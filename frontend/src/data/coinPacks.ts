export type CoinPackId = 'starter' | 'popular' | 'value' | 'mega';

export type CoinPack = {
  id: CoinPackId;
  coins: number;
  bonusCoins: number;
  priceLabel: string;
  icon: string;
  highlight?: string;
};

export const COIN_PACKS: CoinPack[] = [
  {
    id: 'starter',
    coins: 100,
    bonusCoins: 0,
    priceLabel: '$0.99',
    icon: 'P',
  },
  {
    id: 'popular',
    coins: 500,
    bonusCoins: 50,
    priceLabel: '$3.99',
    icon: '💰',
    highlight: 'Más elegido',
  },
  {
    id: 'value',
    coins: 1200,
    bonusCoins: 200,
    priceLabel: '$7.99',
    icon: '💎',
  },
  {
    id: 'mega',
    coins: 2600,
    bonusCoins: 600,
    priceLabel: '$14.99',
    icon: '👑',
    highlight: 'Mejor valor',
  },
];
