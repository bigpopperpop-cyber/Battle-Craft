
export const TILE_SIZE = 40;
export const MAP_SIZE = 40; // 40x40 tiles

export const COLORS = {
  HUMAN: {
    PRIMARY: '#3b82f6', // blue-500
    SECONDARY: '#60a5fa',
    ACCENT: '#fbbf24'
  },
  ORC: {
    PRIMARY: '#ef4444', // red-500
    SECONDARY: '#f87171',
    ACCENT: '#10b981'
  },
  NEUTRAL: {
    GOLD: '#f59e0b',
    WOOD: '#10b981',
    GROUND: '#2d3748'
  }
};

export const UNIT_STATS = {
  Worker: { hp: 40, damage: 2, range: 1, speed: 2, cost: { gold: 50, wood: 0, food: 1 }, time: 5 },
  Melee: { hp: 100, damage: 10, range: 1.2, speed: 1.5, cost: { gold: 120, wood: 0, food: 1 }, time: 10 },
  Ranged: { hp: 60, damage: 8, range: 5, speed: 1.8, cost: { gold: 100, wood: 40, food: 1 }, time: 8 }
};

export const BUILDING_STATS = {
  TownHall: { hp: 1000, cost: { gold: 400, wood: 200 }, time: 30 },
  Farm: { hp: 200, cost: { gold: 100, wood: 50 }, time: 10, foodProvided: 4 },
  Barracks: { hp: 500, cost: { gold: 200, wood: 100 }, time: 20 }
};
