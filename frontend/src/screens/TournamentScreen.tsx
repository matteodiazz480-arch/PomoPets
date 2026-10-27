import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import { useGame } from '../context/GameContext';
import { fetchLeaderboard, type TournamentPlayer } from '../services/firebase';
import { colors } from '../theme/colors';

type Criteria = 'xp' | 'hours';

// Friendly reference players to ensure a lively community feel if Firestore is newly created
const MOCK_FALLBACK_PLAYERS: TournamentPlayer[] = [
  { id: 'bot_1', name: 'Valen Estudiosa 🎓', petName: 'Cornolín', level: 6, totalXp: 3840, minutesStudied: 1240, streak: 9 },
  { id: 'bot_2', name: 'Lucas_Dev 💻', petName: 'Rocky', level: 5, totalXp: 2950, minutesStudied: 980, streak: 7 },
  { id: 'bot_3', name: 'Marta Pomodoro 🍅', petName: 'Pomi', level: 4, totalXp: 2180, minutesStudied: 720, streak: 5 },
  { id: 'bot_4', name: 'Santi Focus ⚡', petName: 'Sparky', level: 4, totalXp: 1820, minutesStudied: 610, streak: 4 },
  { id: 'bot_5', name: 'Clara Meditativa 🌸', petName: 'Flora', level: 3, totalXp: 1450, minutesStudied: 490, streak: 3 },
  { id: 'bot_6', name: 'Nico Búho 🦉', petName: 'Noctis', level: 3, totalXp: 1100, minutesStudied: 360, streak: 3 },
];

export default function TournamentScreen() {
  const insets = useSafeAreaInsets();
  const width = useWindowDimensions().width;
  const desktop = width >= 900;
  const { state, level, setPlayerName, syncScoreToCloud } = useGame();

  const [criteria, setCriteria] = useState<Criteria>('xp');
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [editNameText, setEditNameText] = useState(state.playerName || 'Estudiante');
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // 1. Sync current player's latest score
      await syncScoreToCloud();

      // 2. Query Firestore global leaderboard
      const cloudPlayers = await fetchLeaderboard(criteria, 50);

      if (cloudPlayers.length > 0) {
        setPlayers(cloudPlayers);
        setSyncSuccess(true);
      } else {
        // In case Firestore is still empty / freshly created, include player with friendly peers
        const currentMe: TournamentPlayer = {
          id: state.playerId || 'me',
          name: state.playerName || 'Tú',
          petName: state.petName || 'Cornolín',
          level,
          totalXp: state.totalXp,
          minutesStudied: state.minutesStudiedTotal,
          streak: state.streak,
        };
        const combined = [currentMe, ...MOCK_FALLBACK_PLAYERS.filter((p) => p.id !== currentMe.id)];
        combined.sort((a, b) =>
          criteria === 'xp' ? b.totalXp - a.totalXp : b.minutesStudied - a.minutesStudied
        );
        setPlayers(combined);
        setSyncSuccess(true);
      }
    } catch {
      setSyncSuccess(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRefreshing(true);
    loadData(false);
  };

  const handleSaveName = () => {
    if (editNameText.trim()) {
      setPlayerName(editNameText.trim());
      setNameModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playSound('success');
      // Reload so new name reflects immediately
      setTimeout(() => loadData(false), 200);
    }
  };

  const formatHoursAndMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  // Find user's position in ranking
  const myIndex = players.findIndex((p) => p.id === state.playerId || p.name === state.playerName);
  const myRank = myIndex !== -1 ? myIndex + 1 : '-';

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
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Torneo Global</Text>
            <Text style={styles.subtitle}>Compite estudiando y sube al podio de honor</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            activeOpacity={0.8}
            onPress={() => {
              playSound('tap');
              onRefresh();
            }}
          >
            <Ionicons name="refresh" size={18} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {/* Cloud Status Badge */}
        <View style={styles.cloudBadge}>
          <View style={[styles.statusDot, { backgroundColor: syncSuccess === false ? '#EF4444' : '#10B981' }]} />
          <Text style={styles.cloudBadgeText}>
            {syncSuccess === false ? 'Modo sin conexión' : 'Conectado a Google Cloud Firestore'}
          </Text>
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
              Por EXP
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

        {/* Current User Floating Card */}
        <View style={styles.myCard}>
          <View style={styles.myRankCircle}>
            <Text style={styles.myRankText}>#{myRank}</Text>
          </View>
          <View style={styles.myInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.myName} numberOfLines={1}>
                {state.playerName || 'Estudiante'} (Tú)
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditNameText(state.playerName || 'Estudiante');
                  setNameModalVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="pencil-sharp" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.mySub}>Mascota: {state.petName || 'Cornolín'} • Nv. {level}</Text>
          </View>
          <View style={styles.myScorePill}>
            <Text style={styles.myScoreValue}>
              {criteria === 'xp' ? `${state.totalXp} XP` : formatHoursAndMinutes(state.minutesStudiedTotal)}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando clasificación de Google Firestore...</Text>
          </View>
        ) : (
          <>
            {/* Podium (Top 3) */}
            <View style={styles.podiumContainer}>
              {/* 2nd Place */}
              {top2 && (
                <View style={[styles.podiumItem, styles.podiumSecond]}>
                  <Text style={styles.podiumMedal}>🥈</Text>
                  <View style={[styles.podiumAvatarWrap, { borderColor: '#94A3B8' }]}>
                    <Ionicons name="person" size={24} color="#64748B" />
                  </View>
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
                  <View style={[styles.podiumAvatarWrap, { borderColor: '#F59E0B', width: 62, height: 62, borderRadius: 31 }]}>
                    <Ionicons name="trophy" size={30} color="#D97706" />
                  </View>
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
                  <View style={[styles.podiumAvatarWrap, { borderColor: '#CD7F32' }]}>
                    <Ionicons name="person" size={24} color="#B45309" />
                  </View>
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

            {/* Rest of Leaderboard */}
            <View style={styles.list}>
              {restPlayers.map((player, idx) => {
                const rank = idx + 4;
                const isMe = player.id === state.playerId || player.name === state.playerName;
                return (
                  <View key={player.id + '_' + rank} style={[styles.row, isMe && styles.rowHighlight]}>
                    <Text style={[styles.rankNumber, isMe && styles.rankNumberMe]}>{rank}</Text>
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
                    <Text style={[styles.rowScore, isMe && styles.rowScoreMe]}>
                      {criteria === 'xp'
                        ? `${player.totalXp} XP`
                        : formatHoursAndMinutes(player.minutesStudied)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Edit Nickname Modal */}
      <Modal visible={nameModalVisible} transparent animationType="fade" onRequestClose={() => setNameModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Nombre de Jugador</Text>
            <Text style={styles.modalSub}>Este nombre aparecerá en la tabla del torneo oficial:</Text>
            <TextInput
              style={styles.modalInput}
              value={editNameText}
              onChangeText={setEditNameText}
              maxLength={24}
              placeholder="Ej: Sofía Estudiosa"
              placeholderTextColor="#94A3B8"
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSave}
                onPress={handleSaveName}
              >
                <Text style={styles.modalBtnSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    maxWidth: 900,
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.09)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 14,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cloudBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  criteriaWrap: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  criteriaTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  criteriaTabActive: {
    backgroundColor: colors.primary,
  },
  criteriaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  criteriaTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  myCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 14,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRankText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
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
    marginBottom: 24,
    gap: 8,
    paddingTop: 16,
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
    marginBottom: 2,
  },
  podiumMedal: {
    fontSize: 20,
    marginBottom: 2,
  },
  podiumAvatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    marginBottom: 6,
  },
  podiumName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    maxWidth: 90,
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
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  podiumBarFirst: {
    height: 94,
    backgroundColor: '#FDE68A',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderBottomWidth: 0,
  },
  podiumBarSecond: {
    height: 70,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderBottomWidth: 0,
  },
  podiumBarThird: {
    height: 52,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  rowHighlight: {
    backgroundColor: '#FEF3C7',
  },
  rankNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textSecondary,
    width: 24,
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
  rowScore: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.textPrimary,
  },
  rowScoreMe: {
    color: '#B45309',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalBtnCancelText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalBtnSave: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalBtnSaveText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
