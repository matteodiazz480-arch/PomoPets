import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const accessoryOverlayStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 20,
  },
});

export const confettiEffectStyles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export const fittedImageBackgroundStyles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  desktopFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
  },
  content: {
    ...StyleSheet.absoluteFill,
  },
});

export const foodChipStyles = StyleSheet.create({
  chip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: {
    fontSize: 26,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  badgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: '#ffffff',
  },
});

export const habitatBackgroundStyles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  transparentContainer: {
    flex: 1,
  },
  content: {
    ...StyleSheet.absoluteFill,
  },
});

export const missionCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 3,
  },
  largeCard: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
  },
  cardClaimed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FFEFE8',
    borderWidth: 2,
    borderColor: '#FFD4C3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  largeIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    marginRight: 16,
  },
  iconWrapClaimed: {
    backgroundColor: '#E4F8EA',
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  largeInfo: {
    marginRight: 16,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.textPrimary,
  },
  largeTitle: {
    fontSize: 16,
  },
  desc: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
    marginBottom: 8,
  },
  largeDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
    marginBottom: 10,
  },
  track: {
    height: 7,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  largeTrack: {
    height: 9,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  fillClaimed: {
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: 3,
  },
  largeProgressText: {
    fontSize: 12,
    marginTop: 5,
  },
  action: {
    alignItems: 'flex-end',
    gap: 6,
  },
  largeAction: {
    gap: 10,
  },
  claimButtonWrap: {
    transform: [{ scale: 0.84 }],
    marginRight: -10,
  },
  largeClaimButtonWrap: {
    transform: [{ scale: 1 }],
    marginRight: 0,
  },
  rewardRow: {
    alignItems: 'flex-end',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentPurple,
  },
  largeRewardText: {
    fontSize: 13,
  },
  rewardCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rewardCoinsText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coinDark,
  },
  claimedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  largeClaimedLabel: {
    fontSize: 14,
  },
});

export const petAvatarStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImageFrame: {
    position: 'absolute',
    overflow: 'visible',
  },
  petSprite: {
    position: 'absolute',
    top: 0,
  },
  closedEyes: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    top: '16%',
    alignSelf: 'center',
  },
});

export const primaryButtonStyles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
  primary: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2.5,
    borderColor: colors.primaryDark,
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDeep,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
  },
  primaryLabel: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  largePrimary: {
    minWidth: 290,
    minHeight: 64,
    paddingVertical: 18,
    paddingHorizontal: 34,
    borderRadius: 28,
  },
  largeLabel: {
    fontSize: 19,
  },
  largeSecondaryLabel: {
    fontSize: 17,
  },
  largeGhostLabel: {
    fontSize: 16,
  },
  secondary: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  largeSecondary: {
    minWidth: 190,
    minHeight: 60,
    paddingVertical: 17,
    paddingHorizontal: 30,
  },
  secondaryLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  ghost: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeGhost: {
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  ghostLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.45,
  },
});

export const speechBubbleStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    maxWidth: 280,
  },
  bubble: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  largeWrap: {
    maxWidth: 360,
  },
  largeBubble: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  largeText: {
    fontSize: 16,
  },
  tailShadow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.border,
    marginTop: -2,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.card,
    marginTop: -11,
  },
});

export const statBarStyles = StyleSheet.create({
  labeled: {
    width: '100%',
  },
  labeledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labeledIconWrap: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  label: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.textPrimary,
  },
  percent: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
  },
  track: {
    height: 8,
    backgroundColor: '#EBE3D7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  compactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 7,
  },
  compactIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const taskListStyles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 26,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 18,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 5,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  desktopCard: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    borderRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  desktopTitle: {
    fontSize: 19,
  },
  countPill: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  desktopInput: {
    minHeight: 52,
    fontSize: 16,
    paddingHorizontal: 18,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDeep,
    overflow: 'hidden',
  },
  addButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  desktopEmptyText: {
    fontSize: 15,
    lineHeight: 23,
  },
  list: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskTextDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export const timerRingStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  time: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  largeTime: {
    fontSize: 48,
  },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  largeSub: {
    fontSize: 16,
    marginTop: 5,
  },
});

export const topBarStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  desktopWrap: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 3,
  },
  desktopProfilePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 28,
  },
  avatarWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.textPrimary,
    maxWidth: 110,
  },
  desktopPlayerName: {
    fontSize: 15,
    maxWidth: 180,
  },
  levelBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: '#92400E',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  desktopPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  coinPill: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FDE68A',
  },
  coinValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  desktopCoinValue: {
    fontSize: 16,
  },
  streakPill: {
    backgroundColor: colors.streakBg,
    borderColor: colors.border,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.textPrimary,
  },
  desktopStreakValue: {
    fontSize: 15,
  },
});

export const xpBarStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: colors.accentPurple,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.success,
  },
  xpText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 62,
    textAlign: 'right',
  },
  largeWrap: {
    gap: 12,
  },
  largeBadge: {
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  largeLevelText: {
    fontSize: 15,
  },
  largeTrack: {
    height: 14,
  },
  largeXpText: {
    fontSize: 14,
    minWidth: 78,
  },
});
