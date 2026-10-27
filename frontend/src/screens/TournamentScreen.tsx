import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import ProfileModal from '../components/ProfileModal';
import { useGame } from '../context/GameContext';
import { fetchLeaderboard, subscribeToLeaderboard, type TournamentPlayer } from '../services/firebase';
import { colors } from '../theme/colors';

type Criteria = 'xp' | 'hours';

function calculateDaysUntilSunday(): { days: number; hours: number } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diffMs =
    endOfDay.getTime() - now.getTime() + (daysUntilSunday > 0 ? (daysUntilSunday - 1) * 86400000 : 0);
  const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { days, hours };
}

function PlayerAvatar({
  photoUrl,
  name,
  size = 44,
  borderColor = colors.primary,
}: {
  photoUrl?: string;
  name: string;
  size?: number;
  borderColor?: string;
}) {
  const initial = (name || 'J').trim().charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
        },
      ]}
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={[styles.avatarImg, { borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.avatarLetterFallback, { borderRadius: size / 2 }]}>
          <Text style={[styles.avatarLetter, { fontSize: size * 0.44 }]}>{initial}</Text>
        </View>
      )}
    </View>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <View style={[styles.rankBadge, styles.rankBadgeGold]}>
        <Text style={styles.rankMedalEmoji}>🥇</Text>
      </View>
    );
  }
  if (rank === 2) {
    return (
      <View style={[styles.rankBadge, styles.rankBadgeSilver]}>
        <Text style={styles.rankMedalEmoji}>🥈</Text>
      </View>
    );
  }
  if (rank === 3) {
    return (
      <View style={[styles.rankBadge, styles.rankBadgeBronze]}>
        <Text style={styles.rankMedalEmoji}>🥉</Text>
      </View>
    );
  }
  return (
    <View style={styles.rankBadgeDefault}>
      <Text style={styles.rankNumberText}>{rank}</Text>
    </View>
  );
}

export default function TournamentScreen() {
  const insets = useSafeAreaInsets();
  const width = useWindowDimensions().width;
  const desktop = width >= 900;
  const { state, level, syncScoreToCloud } = useGame();

  const [criteria, setCriteria] = useState<Criteria>('xp');
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const timeLeft = calculateDaysUntilSunday();

  useEffect(() => {
    setLoading(true);
    syncScoreToCloud().catch(() => {});

    const unsubscribe = subscribeToLeaderboard(criteria, (realPlayers) => {
      const exists = realPlayers.some((p) => p.id === state.playerId);
      const list = [...realPlayers];

      if (!exists && state.playerId) {
        list.push({
          id: state.playerId,
          name: state.playerName || 'Jugador',
          petName: state.petName || 'Cornolín',
          level,
          totalXp: state.totalXp,
          minutesStudied: state.minutesStudiedTotal,
          streak: state.streak,
          photoUrl: state.photoUrl || '',
        });
        list.sort((a, b) =>
          criteria === 'xp' ? b.totalXp - a.totalXp : b.minutesStudied - a.minutesStudied
        );
      }

      setPlayers(list);
      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      unsubscribe();
    };
  }, [criteria, state.playerId, state.playerName, state.photoUrl, state.totalXp, state.minutesStudiedTotal]);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRefreshing(true);
    await syncScoreToCloud();
    const updated = await fetchLeaderboard(criteria);
    if (updated.length > 0) {
      setPlayers(updated);
    }
    setRefreshing(false);
  };

  const formatHoursAndMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  const myIndex = players.findIndex((p) => p.id === state.playerId);
  const myRank = myIndex !== -1 ? myIndex + 1 : 1;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          desktop && styles.desktopScroll,
          { paddingTop: insets.top + 20, paddingBottom: desktop ? 40 : insets.bottom + 110 },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Tabla de Clasificación</Text>
            <Text style={styles.subtitle}>Ranking semanal de estudiantes en tiempo real</Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileChip}
            activeOpacity={0.85}
            onPress={() => {
              playSound('tap');
              setProfileModalVisible(true);
            }}
          >
            <PlayerAvatar
              photoUrl={state.photoUrl || undefined}
              name={state.playerName || 'T'}
              size={30}
              borderColor={colors.primary}
            />
            <Text style={styles.editProfileChipText}>Mi Perfil</Text>
            <Ionicons name="pencil" size={12} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Weekly Season & Prizes Strip */}
        <View style={styles.seasonCard}>
          <View style={styles.seasonTopRow}>
            <View style={styles.seasonTag}>
              <Ionicons name="trophy" size={14} color="#D97706" />
              <Text style={styles.seasonTagText}>Torneo Semanal</Text>
            </View>
            <View style={styles.countdownTag}>
              <Ionicons name="time-outline" size={13} color="#92400E" />
              <Text style={styles.countdownTagText}>
                {timeLeft.days > 0
                  ? `Termina en ${timeLeft.days}d ${timeLeft.hours}h`
                  : `Termina en ${timeLeft.hours}h`}
              </Text>
            </View>
          </View>

          <View style={styles.prizesBar}>
            <View style={styles.prizePill}>
              <Text style={styles.prizeIcon}>🥇 1°</Text>
              <Text style={styles.prizeVal}>+500</Text>
            </View>
            <View style={styles.prizePill}>
              <Text style={styles.prizeIcon}>🥈 2°</Text>
              <Text style={styles.prizeVal}>+300</Text>
            </View>
            <View style={styles.prizePill}>
              <Text style={styles.prizeIcon}>🥉 3°</Text>
              <Text style={styles.prizeVal}>+150</Text>
            </View>
          </View>
        </View>

        {/* Your Current Position Summary Bar */}
        <TouchableOpacity
          style={styles.mySummaryBar}
          activeOpacity={0.9}
          onPress={() => {
            playSound('tap');
            setProfileModalVisible(true);
          }}
        >
          <View style={styles.myRankBadge}>
            <Text style={styles.myRankBadgeLabel}>TU PUESTO</Text>
            <Text style={styles.myRankBadgeNumber}>#{myRank}</Text>
          </View>

          <PlayerAvatar
            photoUrl={state.photoUrl || undefined}
            name={state.playerName || 'J'}
            size={44}
            borderColor={colors.primary}
          />

          <View style={styles.mySummaryInfo}>
            <View style={styles.myNameRow}>
              <Text style={styles.mySummaryName} numberOfLines={1}>
                {state.playerName ? state.playerName : 'Toca para elegir tu nombre'}
              </Text>
              <Ionicons name="pencil-sharp" size={13} color={colors.primaryDark} />
            </View>
            <Text style={styles.mySummaryStats}>
              Nv. {level} • ⏱️ {formatHoursAndMinutes(state.minutesStudiedTotal)} • ⭐ {state.totalXp} XP
            </Text>
          </View>
        </TouchableOpacity>

        {/* Sort Criteria Selector */}
        <View style={styles.criteriaWrap}>
          <TouchableOpacity
            style={[styles.criteriaTab, criteria === 'xp' && styles.criteriaTabActive]}
            activeOpacity={0.85}
            onPress={() => {
              if (criteria === 'xp') return;
              playSound('tap');
              setCriteria('xp');
            }}
          >
            <Ionicons
              name="sparkles"
              size={15}
              color={criteria === 'xp' ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.criteriaText, criteria === 'xp' && styles.criteriaTextActive]}>
              Ordenar por EXP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.criteriaTab, criteria === 'hours' && styles.criteriaTabActive]}
            activeOpacity={0.85}
            onPress={() => {
              if (criteria === 'hours') return;
              playSound('tap');
              setCriteria('hours');
            }}
          >
            <Ionicons
              name="time"
              size={15}
              color={criteria === 'hours' ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.criteriaText, criteria === 'hours' && styles.criteriaTextActive]}>
              Ordenar por Horas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Traditional Leaderboard Table */}
        <View style={styles.leaderboardCard}>
          {/* Table Column Headers */}
          <View style={styles.tableHeader}>
            <Text style={[styles.colHeader, styles.colRank]}>#</Text>
            <Text style={[styles.colHeader, styles.colPlayer]}>JUGADOR</Text>
            <Text
              style={[
                styles.colHeader,
                styles.colHours,
                criteria === 'hours' && styles.colHeaderActive,
              ]}
            >
              ESTUDIO
            </Text>
            <Text
              style={[
                styles.colHeader,
                styles.colXp,
                criteria === 'xp' && styles.colHeaderActive,
              ]}
            >
              EXP
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando tabla de clasificación...</Text>
            </View>
          ) : (
            players.map((player, index) => {
              const rank = index + 1;
              const isMe = player.id === state.playerId;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              const avatarBorderColor = isTop1
                ? '#F59E0B'
                : isTop2
                  ? '#94A3B8'
                  : isTop3
                    ? '#D97706'
                    : isMe
                      ? colors.primary
                      : colors.border;

              return (
                <View
                  key={player.id}
                  style={[
                    styles.tableRow,
                    isTop1 && styles.rowTop1,
                    isTop2 && styles.rowTop2,
                    isTop3 && styles.rowTop3,
                    isMe && styles.rowMe,
                    index === players.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  {/* Column 1: Position / Rank */}
                  <View style={styles.colRank}>
                    <RankBadge rank={rank} />
                  </View>

                  {/* Column 2: Avatar + Name + Level + Streak */}
                  <View style={styles.colPlayer}>
                    <PlayerAvatar
                      photoUrl={player.photoUrl}
                      name={player.name}
                      size={42}
                      borderColor={avatarBorderColor}
                    />
                    <View style={styles.playerTextWrap}>
                      <View style={styles.playerNameRow}>
                        <Text
                          style={[
                            styles.playerNameText,
                            isTop1 && styles.playerNameTop1,
                            isMe && styles.playerNameMe,
                          ]}
                          numberOfLines={1}
                        >
                          {player.name}
                        </Text>
                        {isMe && (
                          <View style={styles.youTag}>
                            <Text style={styles.youTagText}>TÚ</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.playerSubRow}>
                        <View style={styles.levelBadge}>
                          <Text style={styles.levelBadgeText}>Nv. {player.level}</Text>
                        </View>
                        {player.streak > 0 && (
                          <Text style={styles.streakMeta}>🔥 {player.streak}d</Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Column 3: Study Hours */}
                  <View style={styles.colHours}>
                    <View
                      style={[
                        styles.statPill,
                        criteria === 'hours' && styles.statPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statPillText,
                          criteria === 'hours' && styles.statPillTextActive,
                        ]}
                      >
                        {formatHoursAndMinutes(player.minutesStudied)}
                      </Text>
                    </View>
                  </View>

                  {/* Column 4: Total EXP */}
                  <View style={styles.colXp}>
                    <View
                      style={[
                        styles.statPill,
                        criteria === 'xp' && styles.statPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statPillText,
                          criteria === 'xp' && styles.statPillTextActive,
                        ]}
                      >
                        {player.totalXp} XP
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  scroll: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 14,
  },
  desktopScroll: {
    maxWidth: 880,
    paddingHorizontal: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  editProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  editProfileChipText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.textPrimary,
  },
  avatarContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarLetterFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Nunito_800ExtraBold',
    color: '#92400E',
  },
  seasonCard: {
    backgroundColor: '#FFFDF5',
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  seasonTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seasonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  seasonTagText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: '#92400E',
  },
  countdownTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countdownTagText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: '#92400E',
  },
  prizesBar: {
    flexDirection: 'row',
    gap: 8,
  },
  prizePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 5,
  },
  prizeIcon: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: colors.textSecondary,
  },
  prizeVal: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: '#B45309',
  },
  mySummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 12,
    gap: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.65,
    shadowRadius: 6,
    elevation: 2,
  },
  myRankBadge: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    minWidth: 58,
  },
  myRankBadgeLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 8,
    color: '#B45309',
    letterSpacing: 0.4,
  },
  myRankBadgeNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#92400E',
  },
  mySummaryInfo: {
    flex: 1,
  },
  myNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mySummaryName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  mySummaryStats: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  criteriaWrap: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  criteriaTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
  },
  criteriaTabActive: {
    backgroundColor: colors.primary,
  },
  criteriaText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.textSecondary,
  },
  criteriaTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_800ExtraBold',
  },
  leaderboardCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F1E7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  colHeader: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },
  colHeaderActive: {
    color: colors.primaryDark,
  },
  colRank: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colPlayer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 6,
  },
  colHours: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colXp: {
    width: 74,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F3EAE0',
  },
  rowTop1: {
    backgroundColor: '#FFFDF0',
  },
  rowTop2: {
    backgroundColor: '#FAFCFF',
  },
  rowTop3: {
    backgroundColor: '#FFF9F5',
  },
  rowMe: {
    backgroundColor: '#FFF6E3',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  rankBadgeGold: {
    backgroundColor: '#FEF08A',
    borderColor: '#F59E0B',
  },
  rankBadgeSilver: {
    backgroundColor: '#E2E8F0',
    borderColor: '#94A3B8',
  },
  rankBadgeBronze: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FB923C',
  },
  rankMedalEmoji: {
    fontSize: 16,
  },
  rankBadgeDefault: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5EFE6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rankNumberText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.textPrimary,
  },
  playerTextWrap: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  playerNameText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  playerNameTop1: {
    color: '#92400E',
  },
  playerNameMe: {
    color: colors.primaryDeep,
  },
  youTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  youTagText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  playerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: '#F1EAE0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 9,
    color: colors.textSecondary,
  },
  streakMeta: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: colors.textSecondary,
  },
  statPill: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  statPillActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statPillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.textSecondary,
  },
  statPillTextActive: {
    fontFamily: 'Nunito_800ExtraBold',
    color: '#92400E',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Nunito_600SemiBold',
  },
});
