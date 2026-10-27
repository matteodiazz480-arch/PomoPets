import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import { useGame } from '../context/GameContext';
import { fetchLeaderboard, subscribeToLeaderboard, type TournamentPlayer } from '../services/firebase';
import { colors, tournamentScreenStyles } from '../style';

type Criteria = 'xp' | 'hours';

function calculateDaysUntilSunday(): { days: number; hours: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
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
  size = 42,
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
        tournamentScreenStyles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
        },
      ]}
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={[tournamentScreenStyles.avatarImg, { borderRadius: size / 2 }]} />
      ) : (
        <View style={[tournamentScreenStyles.avatarLetterFallback, { borderRadius: size / 2 }]}>
          <Text style={[tournamentScreenStyles.avatarLetter, { fontSize: size * 0.44 }]}>{initial}</Text>
        </View>
      )}
    </View>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <View style={[tournamentScreenStyles.rankBadge, tournamentScreenStyles.rankBadgeGold]}>
        <Text style={tournamentScreenStyles.rankMedalEmoji}>🥇</Text>
      </View>
    );
  }
  if (rank === 2) {
    return (
      <View style={[tournamentScreenStyles.rankBadge, tournamentScreenStyles.rankBadgeSilver]}>
        <Text style={tournamentScreenStyles.rankMedalEmoji}>🥈</Text>
      </View>
    );
  }
  if (rank === 3) {
    return (
      <View style={[tournamentScreenStyles.rankBadge, tournamentScreenStyles.rankBadgeBronze]}>
        <Text style={tournamentScreenStyles.rankMedalEmoji}>🥉</Text>
      </View>
    );
  }
  return (
    <View style={tournamentScreenStyles.rankBadgeDefault}>
      <Text style={tournamentScreenStyles.rankNumberText}>{rank}</Text>
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

  return (
    <View style={tournamentScreenStyles.root}>
      <ScrollView
        contentContainerStyle={[
          tournamentScreenStyles.scroll,
          desktop && tournamentScreenStyles.desktopScroll,
          { paddingTop: insets.top + 20, paddingBottom: desktop ? 40 : insets.bottom + 110 },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={tournamentScreenStyles.header}>
          <Text style={tournamentScreenStyles.title}>Tabla de Clasificación</Text>
          <Text style={tournamentScreenStyles.subtitle}>Ranking semanal de estudiantes en tiempo real</Text>
        </View>

        <View style={tournamentScreenStyles.seasonCard}>
          <View style={tournamentScreenStyles.seasonTopRow}>
            <View style={tournamentScreenStyles.seasonTag}>
              <Ionicons name="trophy" size={14} color="#D97706" />
              <Text style={tournamentScreenStyles.seasonTagText}>Torneo Semanal</Text>
            </View>
            <View style={tournamentScreenStyles.countdownTag}>
              <Ionicons name="time-outline" size={13} color="#92400E" />
              <Text style={tournamentScreenStyles.countdownTagText}>
                {timeLeft.days > 0
                  ? `Termina en ${timeLeft.days}d ${timeLeft.hours}h`
                  : `Termina en ${timeLeft.hours}h`}
              </Text>
            </View>
          </View>

          <View style={tournamentScreenStyles.prizesBar}>
            <View style={tournamentScreenStyles.prizePill}>
              <Text style={tournamentScreenStyles.prizeIcon}>🥇 1°</Text>
              <Text style={tournamentScreenStyles.prizeVal}>+500</Text>
            </View>
            <View style={tournamentScreenStyles.prizePill}>
              <Text style={tournamentScreenStyles.prizeIcon}>🥈 2°</Text>
              <Text style={tournamentScreenStyles.prizeVal}>+300</Text>
            </View>
            <View style={tournamentScreenStyles.prizePill}>
              <Text style={tournamentScreenStyles.prizeIcon}>🥉 3°</Text>
              <Text style={tournamentScreenStyles.prizeVal}>+150</Text>
            </View>
          </View>
        </View>

        <View style={tournamentScreenStyles.criteriaWrap}>
          <TouchableOpacity
            style={[tournamentScreenStyles.criteriaTab, criteria === 'xp' && tournamentScreenStyles.criteriaTabActive]}
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
            <Text style={[tournamentScreenStyles.criteriaText, criteria === 'xp' && tournamentScreenStyles.criteriaTextActive]}>
              Ordenar por EXP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[tournamentScreenStyles.criteriaTab, criteria === 'hours' && tournamentScreenStyles.criteriaTabActive]}
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
            <Text style={[tournamentScreenStyles.criteriaText, criteria === 'hours' && tournamentScreenStyles.criteriaTextActive]}>
              Ordenar por Horas
            </Text>
          </TouchableOpacity>
        </View>

        <View style={tournamentScreenStyles.leaderboardCard}>
          <View style={tournamentScreenStyles.tableHeader}>
            <Text style={[tournamentScreenStyles.colHeader, tournamentScreenStyles.colRank]}>#</Text>
            <Text style={[tournamentScreenStyles.colHeader, tournamentScreenStyles.colPlayer]}>JUGADOR</Text>
            <Text
              style={[
                tournamentScreenStyles.colHeader,
                tournamentScreenStyles.colHours,
                criteria === 'hours' && tournamentScreenStyles.colHeaderActive,
              ]}
            >
              ESTUDIO
            </Text>
            <Text
              style={[
                tournamentScreenStyles.colHeader,
                tournamentScreenStyles.colXp,
                criteria === 'xp' && tournamentScreenStyles.colHeaderActive,
              ]}
            >
              EXP
            </Text>
          </View>

          {loading ? (
            <View style={tournamentScreenStyles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={tournamentScreenStyles.loadingText}>Cargando tabla de clasificación...</Text>
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
                    tournamentScreenStyles.tableRow,
                    isTop1 && tournamentScreenStyles.rowTop1,
                    isTop2 && tournamentScreenStyles.rowTop2,
                    isTop3 && tournamentScreenStyles.rowTop3,
                    isMe && tournamentScreenStyles.rowMe,
                    index === players.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={tournamentScreenStyles.colRank}>
                    <RankBadge rank={rank} />
                  </View>

                  <View style={tournamentScreenStyles.colPlayer}>
                    <PlayerAvatar
                      photoUrl={player.photoUrl}
                      name={player.name}
                      size={42}
                      borderColor={avatarBorderColor}
                    />
                    <View style={tournamentScreenStyles.playerTextWrap}>
                      <View style={tournamentScreenStyles.playerNameRow}>
                        <Text
                          style={[
                            tournamentScreenStyles.playerNameText,
                            isTop1 && tournamentScreenStyles.playerNameTop1,
                            isMe && tournamentScreenStyles.playerNameMe,
                          ]}
                          numberOfLines={1}
                        >
                          {player.name}
                        </Text>
                        {isMe && (
                          <View style={tournamentScreenStyles.youTag}>
                            <Text style={tournamentScreenStyles.youTagText}>TÚ</Text>
                          </View>
                        )}
                      </View>
                      <View style={tournamentScreenStyles.playerSubRow}>
                        <View style={tournamentScreenStyles.levelBadge}>
                          <Text style={tournamentScreenStyles.levelBadgeText}>Nv. {player.level}</Text>
                        </View>
                        {player.streak > 0 && (
                          <Text style={tournamentScreenStyles.streakMeta}>🔥 {player.streak}d</Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={tournamentScreenStyles.colHours}>
                    <View
                      style={[
                        tournamentScreenStyles.statPill,
                        criteria === 'hours' && tournamentScreenStyles.statPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          tournamentScreenStyles.statPillText,
                          criteria === 'hours' && tournamentScreenStyles.statPillTextActive,
                        ]}
                      >
                        {formatHoursAndMinutes(player.minutesStudied)}
                      </Text>
                    </View>
                  </View>

                  <View style={tournamentScreenStyles.colXp}>
                    <View
                      style={[
                        tournamentScreenStyles.statPill,
                        criteria === 'xp' && tournamentScreenStyles.statPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          tournamentScreenStyles.statPillText,
                          criteria === 'xp' && tournamentScreenStyles.statPillTextActive,
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
    </View>
  );
}
