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
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none flex flex-col items-center p-2 sm:p-4">
      
      {/* Resource Header */}
      <div className="mb-2 flex gap-4 bg-black/90 backdrop-blur-md px-6 py-2 rounded-full border border-amber-900/50 text-white font-bold pointer-events-auto shadow-2xl">
        <ResourceItem color={COLORS.NEUTRAL.GOLD} value={resources.gold} icon="🪙" label="Gold" />
        <ResourceItem color={COLORS.NEUTRAL.WOOD} value={resources.wood} icon="🪵" label="Lumber" />
        <ResourceItem color="#fff" value={`${resources.food}/${resources.maxFood}`} icon="🍗" label="Food" />
      </div>

      {/* Control Console */}
      <div className="w-full max-w-xl bg-gradient-to-b from-[#2d1b10] to-[#1a0f08] border-2 border-amber-900/80 rounded-t-2xl p-4 flex gap-4 pointer-events-auto shadow-[0_-10px_50px_rgba(0,0,0,0.8)]">
        
        {/* Entity Portrait Area */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#0d0d0d] rounded-lg border-2 border-amber-900/30 flex flex-col items-center justify-center relative overflow-hidden">
          {selectedEntity ? (
            <>
              <div className="text-4xl">{selectedEntity.type === EntityType.UNIT ? '🤺' : '🏛️'}</div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] uppercase font-black text-amber-500 py-1 text-center truncate px-1">
                {selectedEntity.name}
              </div>
              {/* HP Bar */}
              <div className="absolute top-1 left-1 right-1 h-1 bg-gray-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300" 
                  style={{ width: `${(selectedEntity.hp / selectedEntity.maxHp) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-[10px] text-amber-900 font-bold uppercase tracking-widest text-center">Awaiting Selection</div>
          )}
        </div>

        {/* Action Grid */}
        <div className="flex-1 grid grid-cols-3 gap-2">
          {selectedEntity?.type === EntityType.UNIT ? (
            <>
              <ActionButton icon="⚔️" label="Attack" onClick={() => onAction('attack')} />
              <ActionButton icon="👣" label="Move" onClick={() => onAction('move')} />
              <ActionButton icon="🛡️" label="Hold" onClick={() => onAction('stop')} />
            </>
          ) : selectedEntity?.type === EntityType.BUILDING ? (
            <>
              <ActionButton icon="👷" label="Train" onClick={() => onAction('train_worker')} />
              <div className="col-span-2 bg-black/20 rounded-lg border border-amber-900/10 flex items-center justify-center text-[10px] text-amber-700 uppercase italic">
                Construction Site
              </div>
            </>
          ) : (
            <div className="col-span-3 flex items-center justify-center text-amber-900/50 font-bold uppercase text-xs tracking-widest">
              Ready for Orders
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ResourceItem: React.FC<{ color: string, value: string | number, icon: string, label: string }> = ({ color, value, icon, label }) => (
  <div className="flex items-center gap-2">
    <span className="text-lg">{icon}</span>
    <div className="flex flex-col">
      <span className="text-[10px] uppercase font-black opacity-40 leading-none">{label}</span>
      <span className="text-sm sm:text-base tabular-nums" style={{ color }}>{value}</span>
    </div>
  </div>
);

const ActionButton: React.FC<{ icon: string, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-[#3d2b1f] active:bg-amber-700 hover:bg-[#4d3b2f] text-white flex flex-col items-center justify-center rounded-lg border border-amber-900/50 shadow-inner group transition-all h-full min-h-[54px]"
  >
    <span className="text-xl group-active:scale-90 transition-transform">{icon}</span>
    <span className="text-[8px] sm:text-[9px] uppercase font-black text-amber-600 mt-1">{label}</span>
  </button>
);

export default HUD;