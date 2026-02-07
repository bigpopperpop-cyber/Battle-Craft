
import React from 'react';
import { ResourceState, GameEntity, EntityType, UnitClass } from '../types';
import { COLORS } from '../constants';

interface HUDProps {
  resources: ResourceState;
  selectedEntity: GameEntity | null;
  onAction: (action: string) => void;
  faction: string;
}

const HUD: React.FC<HUDProps> = ({ resources, selectedEntity, onAction, faction }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none flex flex-col gap-2">
      {/* Resource Bar */}
      <div className="flex justify-center gap-4 bg-black/70 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white font-bold pointer-events-auto self-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.NEUTRAL.GOLD }}></div>
          <span>{resources.gold}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.NEUTRAL.WOOD }}></div>
          <span>{resources.wood}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white"></div>
          <span>{resources.food}/{resources.maxFood}</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex justify-between items-end w-full max-w-4xl mx-auto pointer-events-auto">
        <div className="w-1/3 bg-black/80 p-3 rounded-t-xl border-t border-x border-white/20 text-white min-h-[120px]">
          {selectedEntity ? (
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                {selectedEntity.type === EntityType.UNIT ? '👤' : '🏰'}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">{selectedEntity.name}</span>
                <span className="text-xs text-gray-400">HP: {selectedEntity.hp} / {selectedEntity.maxHp}</span>
                <span className="text-xs text-blue-400 capitalize">{selectedEntity.state}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 italic">
              Select an entity
            </div>
          )}
        </div>

        <div className="w-1/2 bg-black/80 p-3 rounded-t-xl border-t border-x border-white/20 grid grid-cols-3 gap-2 min-h-[120px]">
          {selectedEntity?.type === EntityType.UNIT && (
            <>
              <ActionButton icon="⚔️" label="Attack" onClick={() => onAction('attack')} />
              <ActionButton icon="📍" label="Move" onClick={() => onAction('move')} />
              <ActionButton icon="🛑" label="Stop" onClick={() => onAction('stop')} />
              {selectedEntity.name === UnitClass.WORKER && (
                <ActionButton icon="🏗️" label="Build" onClick={() => onAction('build_menu')} />
              )}
            </>
          )}
          {selectedEntity?.type === EntityType.BUILDING && (
            <>
              <ActionButton icon="👷" label="Train Worker" onClick={() => onAction('train_worker')} />
              <ActionButton icon="🛡️" label="Train Soldier" onClick={() => onAction('train_soldier')} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: string, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-gray-800 hover:bg-gray-700 active:scale-95 text-white flex flex-col items-center justify-center p-2 rounded-lg border border-white/10 transition-all"
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] uppercase font-bold text-gray-400">{label}</span>
  </button>
);

export default HUD;
