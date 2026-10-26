export type FoodId =
  | 'apple'
  | 'carrot'
  | 'cookie'
  | 'sandwich'
  | 'ramen'
  | 'cake'
  | 'smoothie'
  | 'potion';

export type FoodItem = {
  id: FoodId;
  name: string;
  description: string;
  price: number;
  icon: string;
  hunger: number;
  happiness: number;
};

export const SHOP_FOODS: FoodItem[] = [
  {
    id: 'apple',
    name: 'Manzana Crujiente',
    description: 'Snack fresco, dulce y lleno de vitaminas.',
    price: 10,
    icon: '🍎',
    hunger: 25,
    happiness: 12,
  },
  {
    id: 'carrot',
    name: 'Zanahoria de Huerto',
    description: 'Vegetal crujiente ideal para la vista.',
    price: 12,
    icon: '🥕',
    hunger: 20,
    happiness: 15,
  },
  {
    id: 'cookie',
    name: 'Galleta con Chispas',
    description: 'Recién horneada para recargar ánimo.',
    price: 20,
    icon: '🍪',
    hunger: 30,
    happiness: 25,
  },
  {
    id: 'sandwich',
    name: 'Sándwich Nutritivo',
    description: 'Comida completa para rendir en tus estudios.',
    price: 28,
    icon: '🥪',
    hunger: 45,
    happiness: 22,
  },
  {
    id: 'smoothie',
    name: 'Batido Tropical',
    description: 'Bebida helada que refresca al instante.',
    price: 25,
    icon: '🧃',
    hunger: 25,
    happiness: 30,
  },
  {
    id: 'ramen',
    name: 'Tazón de Ramen',
    description: 'Caldo humeante y fideos reconfortantes.',
    price: 40,
    icon: '🍜',
    hunger: 65,
    happiness: 35,
  },
  {
    id: 'cake',
    name: 'Pastelito de Fresa',
    description: 'Postre suave que alegra el corazón.',
    price: 35,
    icon: '🍰',
    hunger: 35,
    happiness: 55,
  },
  {
    id: 'potion',
    name: 'Poción Feliz',
    description: 'Elixir mágico que llena a Cornolín de alegría.',
    price: 50,
    icon: '🧪',
    hunger: 30,
    happiness: 75,
  },
];

export function getFoodById(id: FoodId): FoodItem | undefined {
  return SHOP_FOODS.find((f) => f.id === id);
}
