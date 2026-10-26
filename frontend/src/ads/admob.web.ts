export const ADMOB_APP_ID = 'ca-app-pub-7765029109255049~4223502727';
export const ADMOB_REWARDED_UNIT_ID = 'ca-app-pub-7765029109255049/2910421056';

export async function initAdMob(): Promise<void> {
  // En web no existe el módulo nativo de AdMob; se usa la vista previa interactiva.
}

export function loadRewardedAd(onLoadedChange?: (loaded: boolean) => void): () => void {
  onLoadedChange?.(true);
  return () => {};
}

export async function showRewardedAd(_onRewardEarned: (amount: number, type: string) => void): Promise<boolean> {
  return false;
}

export function isRewardedAdReady(): boolean {
  return false;
}
