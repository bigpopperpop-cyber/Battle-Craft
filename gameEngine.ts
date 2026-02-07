
import { 
  Unit, Building, ResourceNode, EntityType, GameEntity, 
  Faction, Position, ResourceState, UnitClass 
} from './types';
import { TILE_SIZE, UNIT_STATS } from './constants';

export class GameEngine {
  units: Unit[] = [];
  buildings: Building[] = [];
  resources: ResourceNode[] = [];
  playerResources: ResourceState = { gold: 1000, wood: 500, food: 1, maxFood: 4 };
  selectedEntityId: string | null = null;
  camera: Position = { x: 0, y: 0 };
  
  constructor() {
    this.initializeDemo();
  }

  initializeDemo() {
    // Basic setup
    this.addResource('gold-1', { x: 5, y: 5 }, 5000);
    this.addResource('gold-2', { x: 35, y: 35 }, 5000);
    
    // Forest blocks
    for (let i = 0; i < 5; i++) {
        this.addResource(`wood-${i}`, { x: 8 + i, y: 4 }, 200, 'wood');
    }

    // Starting units
    this.addUnit('player-peasant-1', Faction.HUMAN, UnitClass.WORKER, { x: 10, y: 10 }, 'player');
    this.addUnit('player-grunt-1', Faction.HUMAN, UnitClass.MELEE, { x: 11, y: 11 }, 'player');
  }

  addUnit(id: string, faction: Faction, unitClass: UnitClass, pos: Position, owner: 'player' | 'cpu') {
    const stats = UNIT_STATS[unitClass];
    const unit: Unit = {
      id,
      type: EntityType.UNIT,
      faction,
      name: unitClass,
      unitClass,
      pos,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      // Fix: Accessing 'range' from UNIT_STATS instead of 'attackRange'
      attackRange: stats.range,
      damage: stats.damage,
      carryAmount: 0,
      state: 'idle',
      lastActionTime: Date.now(),
      owner
    };
    this.units.push(unit);
  }

  addResource(id: string, pos: Position, amount: number, resType: 'gold' | 'wood' = 'gold') {
    const node: ResourceNode = {
      id,
      type: EntityType.RESOURCE,
      faction: 'Neutral',
      name: resType === 'gold' ? 'Gold Mine' : 'Forest',
      pos,
      hp: amount,
      maxHp: amount,
      amount,
      state: 'idle',
      lastActionTime: Date.now(),
      owner: 'cpu'
    };
    this.resources.push(node);
  }

  update(deltaTime: number) {
    // Process unit logic
    this.units.forEach(unit => {
      if (unit.state === 'moving' && unit.targetPos) {
        const dx = unit.targetPos.x - unit.pos.x;
        const dy = unit.targetPos.y - unit.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 0.1) {
          unit.pos = { ...unit.targetPos };
          unit.state = 'idle';
          unit.targetPos = undefined;
        } else {
          const moveDist = unit.speed * (deltaTime / 1000);
          unit.pos.x += (dx / dist) * moveDist;
          unit.pos.y += (dy / dist) * moveDist;
        }
      }
    });
  }

  selectAt(worldX: number, worldY: number) {
    // Find closest unit/building
    const threshold = 1.0;
    const clickedUnit = this.units.find(u => 
      Math.abs(u.pos.x - worldX) < threshold && Math.abs(u.pos.y - worldY) < threshold
    );
    
    if (clickedUnit) {
      this.selectedEntityId = clickedUnit.id;
      return clickedUnit;
    }

    const clickedBuilding = this.buildings.find(b => 
      Math.abs(b.pos.x - worldX) < threshold && Math.abs(b.pos.y - worldY) < threshold
    );

    if (clickedBuilding) {
      this.selectedEntityId = clickedBuilding.id;
      return clickedBuilding;
    }

    this.selectedEntityId = null;
    return null;
  }

  issueOrder(entityId: string, worldX: number, worldY: number) {
    const unit = this.units.find(u => u.id === entityId);
    if (!unit) return;

    // Is it a resource?
    const res = this.resources.find(r => 
        Math.abs(r.pos.x - worldX) < 1.0 && Math.abs(r.pos.y - worldY) < 1.0
    );

    if (res && unit.unitClass === UnitClass.WORKER) {
        unit.state = 'harvesting';
        unit.targetId = res.id;
        unit.targetPos = { ...res.pos };
    } else {
        unit.state = 'moving';
        unit.targetPos = { x: worldX, y: worldY };
    }
  }
}
