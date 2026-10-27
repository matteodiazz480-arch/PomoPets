import mobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

export const ADMOB_APP_ID = 'ca-app-pub-7765029109255049~4223502727';
export const ADMOB_REWARDED_UNIT_ID = 'ca-app-pub-7765029109255049/2910421056';

let rewardedAd: RewardedAd | null = null;
let isAdLoaded = false;
let isInitializing = false;

export async function initAdMob(): Promise<void> {
  if (isInitializing) return;
  isInitializing = true;
  try {
    await mobileAds().initialize();
    loadRewardedAd();
  } catch {} finally {
    isInitializing = false;
  }
}

export function loadRewardedAd(onLoadedChange?: (loaded: boolean) => void): () => void {
  try {
    const ad = RewardedAd.createForAdRequest(ADMOB_REWARDED_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });
    rewardedAd = ad;
    isAdLoaded = false;
    onLoadedChange?.(false);

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isAdLoaded = true;
      onLoadedChange?.(true);
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      isAdLoaded = false;
      onLoadedChange?.(false);
      ad.load();
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      isAdLoaded = false;
      onLoadedChange?.(false);
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
    };
  } catch {
    onLoadedChange?.(false);
    return () => {};
  }
}

export async function showRewardedAd(onRewardEarned: (amount: number, type: string) => void): Promise<boolean> {
  if (!rewardedAd || !isAdLoaded) {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    try {
      let earned = false;
      const unsubEarned = rewardedAd!.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          earned = true;
          onRewardEarned(reward.amount || 50, reward.type || 'coins');
        }
      );

      const unsubClosed = rewardedAd!.addAdEventListener(AdEventType.CLOSED, () => {
        unsubEarned();
        unsubClosed();
        resolve(earned);
      });

      const unsubError = rewardedAd!.addAdEventListener(AdEventType.ERROR, () => {
        unsubEarned();
        unsubClosed();
        unsubError();
        resolve(false);
      });

      rewardedAd!.show().catch(() => {
        unsubEarned();
        unsubClosed();
        unsubError();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

export function isRewardedAdReady(): boolean {
  return isAdLoaded;
}
