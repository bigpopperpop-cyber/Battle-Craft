
export enum Faction {
  HUMAN = 'Human',
  ORC = 'Orc'
}

export enum EntityType {
  UNIT = 'unit',
  BUILDING = 'building',
  RESOURCE = 'resource'
}

export enum UnitClass {
  WORKER = 'Worker',
  MELEE = 'Melee',
  RANGED = 'Ranged'
}

export enum BuildingClass {
  TOWNHALL = 'Town Hall',
  FARM = 'Farm',
  BARRACKS = 'Barracks'
}

export interface Position {
  x: number;
  y: number;
}

export interface ResourceState {
  gold: number;
  wood: number;
  food: number;
  maxFood: number;
}

export interface GameEntity {
  id: string;
  type: EntityType;
  faction: Faction | 'Neutral';
  name: string;
  pos: Position;
  targetPos?: Position;
  hp: number;
  maxHp: number;
  selected?: boolean;
  state: 'idle' | 'moving' | 'attacking' | 'harvesting';
  lastActionTime: number;
  owner: 'player' | 'cpu';
}

export interface Unit extends GameEntity {
  type: EntityType.UNIT;
  unitClass: UnitClass;
  speed: number;
  attackRange: number;
  damage: number;
  carryAmount: number;
  targetId?: string;
}

export interface Building extends GameEntity {
  type: EntityType.BUILDING;
  buildingClass: BuildingClass;
  isComplete: boolean;
  progress: number;
  trainingQueue: string[];
}

export interface ResourceNode extends GameEntity {
  type: EntityType.RESOURCE;
  amount: number;
}
