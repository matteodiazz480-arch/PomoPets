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
  const diffMs = endOfDay.getTime() - now.getTime() + (daysUntilSunday > 0 ? (daysUntilSunday - 1) * 86400000 : 0);
  const totalHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { days, hours };
}

function PlayerAvatar({
  photoUrl,
  name,
  size = 46,
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
          <Text style={[styles.avatarLetter, { fontSize: size * 0.45 }]}>{initial}</Text>
        </View>
      )}
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

  // Sync current user and listen to real-time updates from Firestore
  useEffect(() => {
    setLoading(true);

    // 1. Initial sync to ensure player is in Firestore
    syncScoreToCloud().catch(() => {});

    // 2. Real-time subscription to Firestore leaderboard
    const unsubscribe = subscribeToLeaderboard(criteria, (realPlayers) => {
      // Ensure current user is in the list even if offline or just created
      const exists = realPlayers.some((p) => p.id === state.playerId);
      let list = [...realPlayers];

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

  // Find user's position in ranking
  const myIndex = players.findIndex((p) => p.id === state.playerId);
  const myRank = myIndex !== -1 ? myIndex + 1 : 1;

  const top1 = players[0];
  const top2 = players[1];
  const top3 = players[2];
  const restPlayers = players.slice(3);

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
            <Text style={styles.title}>Torneo Semanal</Text>
            <Text style={styles.subtitle}>Compite con estudiantes de todo el mundo</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            activeOpacity={0.85}
            onPress={() => {
              playSound('tap');
              setProfileModalVisible(true);
            }}
          >
            <PlayerAvatar
              photoUrl={state.photoUrl || undefined}
              name={state.playerName}
              size={38}
              borderColor={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Weekly Countdown & Rewards Banner */}
        <View style={styles.tournamentBannerCard}>
          <View style={styles.bannerTopRow}>
            <View style={styles.seasonBadge}>
              <Ionicons name="flame" size={14} color="#D97706" />
              <Text style={styles.seasonBadgeText}>Temporada Semanal</Text>
            </View>
            <View style={styles.timerPill}>
              <Ionicons name="hourglass-outline" size={13} color="#92400E" />
              <Text style={styles.timerPillText}>
                {timeLeft.days > 0 ? `${timeLeft.days}d ${timeLeft.hours}h restantes` : `${timeLeft.hours}h restantes`}
              </Text>
            </View>
          </View>

          <Text style={styles.bannerPrizeTitle}>Recompensas para los Ganadores:</Text>
          <View style={styles.prizesRow}>
            <View style={styles.prizeItem}>
              <Text style={styles.prizeMedal}>🥇</Text>
              <Text style={styles.prizeText}>+500 Monedas</Text>
            </View>
            <View style={styles.prizeItem}>
              <Text style={styles.prizeMedal}>🥈</Text>
              <Text style={styles.prizeText}>+300 Monedas</Text>
            </View>
            <View style={styles.prizeItem}>
              <Text style={styles.prizeMedal}>🥉</Text>
              <Text style={styles.prizeText}>+150 Monedas</Text>
            </View>
          </View>
        </View>

        {/* Criteria Switcher Tabs */}
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
              size={16}
              color={criteria === 'xp' ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.criteriaText, criteria === 'xp' && styles.criteriaTextActive]}>
              Por Experiencia (EXP)
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
              size={16}
              color={criteria === 'hours' ? '#FFFFFF' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.criteriaText, criteria === 'hours' && styles.criteriaTextActive]}>
              Por Horas de Estudio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current User Card */}
        <TouchableOpacity
          style={styles.myCard}
          activeOpacity={0.9}
          onPress={() => {
            playSound('tap');
            setProfileModalVisible(true);
          }}
        >
          <View style={styles.myRankCircle}>
            <Text style={styles.myRankText}>#{myRank}</Text>
          </View>
          <PlayerAvatar
            photoUrl={state.photoUrl || undefined}
            name={state.playerName}
            size={48}
            borderColor={colors.primary}
          />
          <View style={styles.myInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.myName} numberOfLines={1}>
                {state.playerName ? `${state.playerName} (Tú)` : 'Toca para poner tu nombre ✏️'}
              </Text>
              <Ionicons name="pencil-sharp" size={13} color={colors.primary} />
            </View>
            <Text style={styles.mySub}>
              Nv. {level} • 🔥 {state.streak}d racha
            </Text>
          </View>
          <View style={styles.myScorePill}>
            <Text style={styles.myScoreValue}>
              {criteria === 'xp' ? `${state.totalXp} XP` : formatHoursAndMinutes(state.minutesStudiedTotal)}
            </Text>
          </View>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando participantes del torneo...</Text>
          </View>
        ) : (
          <>
            {/* Cartoon Podium (Top 3) */}
            <View style={styles.podiumContainer}>
              {/* 2nd Place */}
              {top2 && (
                <View style={[styles.podiumItem, styles.podiumSecond]}>
                  <Text style={styles.podiumMedal}>🥈</Text>
                  <PlayerAvatar
                    photoUrl={top2.photoUrl}
                    name={top2.name}
                    size={52}
                    borderColor="#94A3B8"
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>{top2.name}</Text>
                  <Text style={styles.podiumScore}>
                    {criteria === 'xp' ? `${top2.totalXp} XP` : formatHoursAndMinutes(top2.minutesStudied)}
                  </Text>
                  <View style={[styles.podiumBar, styles.podiumBarSecond]}>
                    <Text style={styles.podiumNumber}>2</Text>
                  </View>
                </View>
              )}

              {/* 1st Place */}
              {top1 && (
                <View style={[styles.podiumItem, styles.podiumFirst]}>
                  <Text style={styles.podiumCrown}>👑</Text>
                  <PlayerAvatar
                    photoUrl={top1.photoUrl}
                    name={top1.name}
                    size={64}
                    borderColor="#F59E0B"
                  />
                  <Text style={[styles.podiumName, styles.podiumNameFirst]} numberOfLines={1}>
                    {top1.name}
                  </Text>
                  <Text style={[styles.podiumScore, styles.podiumScoreFirst]}>
                    {criteria === 'xp' ? `${top1.totalXp} XP` : formatHoursAndMinutes(top1.minutesStudied)}
                  </Text>
                  <View style={[styles.podiumBar, styles.podiumBarFirst]}>
                    <Text style={[styles.podiumNumber, { color: '#B45309' }]}>1</Text>
                  </View>
                </View>
              )}

              {/* 3rd Place */}
              {top3 && (
                <View style={[styles.podiumItem, styles.podiumThird]}>
                  <Text style={styles.podiumMedal}>🥉</Text>
                  <PlayerAvatar
                    photoUrl={top3.photoUrl}
                    name={top3.name}
                    size={52}
                    borderColor="#CD7F32"
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>{top3.name}</Text>
                  <Text style={styles.podiumScore}>
                    {criteria === 'xp' ? `${top3.totalXp} XP` : formatHoursAndMinutes(top3.minutesStudied)}
                  </Text>
                  <View style={[styles.podiumBar, styles.podiumBarThird]}>
                    <Text style={styles.podiumNumber}>3</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Rest of Real Players List */}
            {restPlayers.length > 0 && (
              <View style={styles.list}>
                {restPlayers.map((player, idx) => {
                  const rank = idx + 4;
                  const isMe = player.id === state.playerId;
                  return (
                    <View key={player.id} style={[styles.row, isMe && styles.rowHighlight]}>
                      <Text style={[styles.rankNumber, isMe && styles.rankNumberMe]}>{rank}</Text>
                      <PlayerAvatar
                        photoUrl={player.photoUrl}
                        name={player.name}
                        size={38}
                        borderColor={isMe ? colors.primary : colors.border}
                      />
                      <View style={styles.rowInfo}>
                        <Text style={[styles.rowName, isMe && styles.rowNameMe]} numberOfLines={1}>
                          {player.name} {isMe ? '(Tú)' : ''}
                        </Text>
                        <View style={styles.rowMeta}>
                          <View style={styles.levelPill}>
                            <Text style={styles.levelPillText}>Nv. {player.level}</Text>
                          </View>
                          {player.streak > 0 && (
                            <Text style={styles.streakText}>🔥 {player.streak}d</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.rowScoreWrap}>
                        <Text style={[styles.rowScore, isMe && styles.rowScoreMe]}>
                          {criteria === 'xp'
                            ? `${player.totalXp} XP`
                            : formatHoursAndMinutes(player.minutesStudied)}
                        </Text>
                        <Text style={styles.rowScoreSub}>
                          {criteria === 'xp'
                            ? formatHoursAndMinutes(player.minutesStudied)
                            : `${player.totalXp} XP`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {players.length === 1 && (
              <View style={styles.singlePlayerCard}>
                <Ionicons name="sparkles" size={28} color="#D97706" style={{ marginBottom: 6 }} />
                <Text style={styles.singlePlayerTitle}>¡Vas en el puesto #1!</Text>
                <Text style={styles.singlePlayerDesc}>
                  Completa tus sesiones de estudio y anima a tus compañeros a unirse para verlos aquí.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Profile & Photo Modal */}
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
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  desktopScroll: {
    maxWidth: 860,
    paddingHorizontal: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  profileBtn: {
    padding: 3,
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
  tournamentBannerCard: {
    backgroundColor: '#FFFDF5',
    borderRadius: 22,
    padding: 14,
    borderWidth: 2,
    borderColor: '#FDE68A',
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 2,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  seasonBadgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: '#92400E',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerPillText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: '#92400E',
  },
  bannerPrizeTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  prizesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  prizeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 5,
  },
  prizeMedal: {
    fontSize: 14,
  },
  prizeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: colors.textPrimary,
  },
  criteriaWrap: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 4,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  criteriaTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
  },
  criteriaTabActive: {
    backgroundColor: colors.primary,
  },
  criteriaText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  criteriaTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_800ExtraBold',
  },
  myCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 22,
    padding: 12,
    borderWidth: 2,
    borderColor: '#FDE68A',
    marginBottom: 20,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 3,
  },
  myRankCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRankText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  myInfo: {
    flex: 1,
  },
  myName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.textPrimary,
  },
  mySub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  myScorePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  myScoreValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#B45309',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 22,
    gap: 8,
    paddingTop: 10,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumFirst: {
    flex: 1.15,
  },
  podiumSecond: {
    flex: 0.95,
  },
  podiumThird: {
    flex: 0.95,
  },
  podiumCrown: {
    fontSize: 22,
    marginBottom: 4,
  },
  podiumMedal: {
    fontSize: 20,
    marginBottom: 4,
  },
  podiumName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    maxWidth: 90,
    marginTop: 6,
  },
  podiumNameFirst: {
    fontSize: 13,
    color: '#92400E',
  },
  podiumScore: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  podiumScoreFirst: {
    color: '#B45309',
    fontWeight: '800',
  },
  podiumBar: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  podiumBarFirst: {
    height: 98,
    backgroundColor: '#FDE68A',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderBottomWidth: 0,
  },
  podiumBarSecond: {
    height: 74,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderBottomWidth: 0,
  },
  podiumBarThird: {
    height: 54,
    backgroundColor: '#FFEDD5',
    borderWidth: 2,
    borderColor: '#FB923C',
    borderBottomWidth: 0,
  },
  podiumNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: '#64748B',
  },
  list: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingVertical: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  rowHighlight: {
    backgroundColor: '#FEF3C7',
  },
  rankNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textSecondary,
    width: 22,
    textAlign: 'center',
  },
  rankNumberMe: {
    color: colors.primaryDark,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  rowNameMe: {
    color: '#92400E',
    fontWeight: '800',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  levelPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  streakText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  rowScoreWrap: {
    alignItems: 'flex-end',
  },
  rowScore: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.textPrimary,
  },
  rowScoreMe: {
    color: '#B45309',
  },
  rowScoreSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
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
  singlePlayerCard: {
    backgroundColor: '#FFFDF5',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    marginTop: 14,
    textAlign: 'center',
  },
  singlePlayerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: '#B45309',
  },
  singlePlayerDesc: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
