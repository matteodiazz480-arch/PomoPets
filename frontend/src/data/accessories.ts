import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type AccessoryCategory = 'head' | 'face' | 'neck';

export type AccessoryId =
  | 'glasses_round'
  | 'glasses_cool'
  | 'crown_gold'
  | 'hat_party'
  | 'flower_pin'
  | 'bowtie_red'
  | 'scarf_cozy';

export type AccessoryItem = {
  id: AccessoryId;
  name: string;
  category: AccessoryCategory;
  price: number;
  iconName: ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  description: string;
};

export const ALL_ACCESSORY_IDS: AccessoryId[] = [
  'glasses_round',
  'glasses_cool',
  'crown_gold',
  'hat_party',
  'flower_pin',
  'bowtie_red',
  'scarf_cozy',
];

export const ACCESSORIES: AccessoryItem[] = [
  {
    id: 'glasses_round',
    name: 'Lentes de Estudio',
    category: 'face',
    price: 0,
    iconName: 'glasses-outline',
    iconColor: '#78350F',
    description: 'Lentes redondos con cristales transparentes para estudiar concentrado.',
  },
  {
    id: 'glasses_cool',
    name: 'Gafas de Sol',
    category: 'face',
    price: 0,
    iconName: 'glasses',
    iconColor: '#1E293B',
    description: 'Estilo canchero y relajado con cristales polarizados.',
  },
  {
    id: 'crown_gold',
    name: 'Corona Real',
    category: 'head',
    price: 0,
    iconName: 'trophy-outline',
    iconColor: '#D97706',
    description: 'Digna de una mascota que jamás rompe su racha de estudio.',
  },
  {
    id: 'hat_party',
    name: 'Gorro de Fiesta',
    category: 'head',
    price: 0,
    iconName: 'sparkles-outline',
    iconColor: '#EC4899',
    description: 'Cono festivo con pompón para celebrar cada sesión completada.',
  },
  {
    id: 'flower_pin',
    name: 'Flor de Cerezo',
    category: 'head',
    price: 0,
    iconName: 'flower-outline',
    iconColor: '#F43F5E',
    description: 'Delicada flor primaveral que adorna su orejita.',
  },
  {
    id: 'bowtie_red',
    name: 'Moño Elegante',
    category: 'neck',
    price: 0,
    iconName: 'ribbon-outline',
    iconColor: '#E11D48',
    description: 'Corbatín rojo satinado para ocasiones formales.',
  },
  {
    id: 'scarf_cozy',
    name: 'Bufanda Abrigada',
    category: 'neck',
    price: 0,
    iconName: 'infinite-outline',
    iconColor: '#EA580C',
    description: 'Bufanda de lana a rayas para estudiar cómodo en invierno.',
  },
];

export function getAccessoryById(id: AccessoryId): AccessoryItem | undefined {
  return ACCESSORIES.find((a) => a.id === id);
}
