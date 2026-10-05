export type FoodId = 'apple' | 'energy_snack' | 'potion';

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
    name: 'Manzana',
    description: 'Un snack fresco y ligero',
    price: 15,
    icon: '🍎',
    hunger: 25,
    happiness: 10,
  },
  {
    id: 'energy_snack',
    name: 'Snack Energético',
    description: 'Recarga energía al instante',
    price: 30,
    icon: '🍪',
    hunger: 40,
    happiness: 20,
  },
  {
    id: 'potion',
    name: 'Poción Feliz',
    description: 'Alegra a tu mascota al máximo',
    price: 50,
    icon: '🧪',
    hunger: 20,
    happiness: 45,
  },
];

export function getFoodById(id: FoodId): FoodItem | undefined {
  return SHOP_FOODS.find((f) => f.id === id);
}
