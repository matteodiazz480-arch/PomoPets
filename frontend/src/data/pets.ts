export type EvolutionStage = {
  id: number;
  name: string;
  description: string;
  minLevel: number;
  eyesOpen: any;
  eyesClosed: any;
};

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    id: 1,
    name: 'Cornolín',
    description: 'Una cría curiosa que apenas empieza su camino de estudio.',
    minLevel: 1,
    eyesOpen: require('../../Pets/Pet1-1.png'),
    eyesClosed: require('../../Pets/Pet1-2.png'),
  },
  {
    id: 2,
    name: 'Sabielo',
    description: '¡Se graduó del nido! Ya sabe que estudiar tiene recompensa.',
    minLevel: 5,
    eyesOpen: require('../../Pets/Pet2-1.png'),
    eyesClosed: require('../../Pets/Pet2-2.png'),
  },
  {
    id: 3,
    name: 'Flamastas',
    description: 'Su racha de estudio enciende una llama interior imparable.',
    minLevel: 10,
    eyesOpen: require('../../Pets/Pet3-1.png'),
    eyesClosed: require('../../Pets/Pet3-2.png'),
  },
  {
    id: 4,
    name: 'Alazar',
    description: 'La forma final: alas ardientes forjadas a pura constancia.',
    minLevel: 16,
    eyesOpen: require('../../Pets/Pet4-1.png'),
    eyesClosed: require('../../Pets/Pet4-2.png'),
  },
];

export function getStageForLevel(level: number): EvolutionStage {
  let current = EVOLUTION_STAGES[0];
  for (const stage of EVOLUTION_STAGES) {
    if (level >= stage.minLevel) current = stage;
  }
  return current;
}

export function getNextStage(level: number): EvolutionStage | null {
  const current = getStageForLevel(level);
  const idx = EVOLUTION_STAGES.findIndex((s) => s.id === current.id);
  return EVOLUTION_STAGES[idx + 1] ?? null;
}

export const PET_LOGO = require('../../Pets/Logo.png');
