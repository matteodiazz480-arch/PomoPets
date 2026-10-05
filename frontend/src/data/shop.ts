import type { BackgroundThemeId } from '../theme/colors';

export type ShopItem = {
  id: BackgroundThemeId;
  name: string;
  price: number;
  icon: string;
  colors: [string, string, string];
};

export const SHOP_BACKGROUNDS: ShopItem[] = [
  {
    id: 'sky',
    name: 'Cielo Despejado',
    price: 0,
    icon: '☀️',
    colors: ['#CDEBFF', '#EAF6FF', '#F8FDFF'],
  },
  {
    id: 'forest',
    name: 'Bosque Suave',
    price: 80,
    icon: '🌿',
    colors: ['#CDECC9', '#E6F6DE', '#F6FCEF'],
  },
  {
    id: 'sunset',
    name: 'Atardecer Cálido',
    price: 150,
    icon: '🌅',
    colors: ['#FFD3B0', '#FFB5A7', '#F5A9C6'],
  },
  {
    id: 'night',
    name: 'Noche Estrellada',
    price: 250,
    icon: '🌙',
    colors: ['#3A3F73', '#5C5B9F', '#8C7FC7'],
  },
];
