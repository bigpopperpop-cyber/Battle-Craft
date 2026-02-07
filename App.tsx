
import React, { useState, useEffect, useMemo } from 'react';
import GameMap from './components/GameMap';
import HUD from './components/HUD';
import BriefingModal from './components/BriefingModal';
import { GameEngine } from './gameEngine';
import { Faction, GameEntity } from './types';
import { generateBriefing } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'briefing' | 'playing'>('menu');
  const [faction, setFaction] = useState<Faction>(Faction.HUMAN);
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const engine = useMemo(() => new GameEngine(), []);

  const selectedEntity = useMemo(() => {
    return engine.units.find(u => u.id === selectedId) || engine.buildings.find(b => b.id === selectedId) || null;
  }, [selectedId, engine]);

  const handleStartGame = async (selectedFaction: Faction) => {
    setFaction(selectedFaction);
    setLoading(true);
    const text = await generateBriefing(selectedFaction, 1);
    setBriefing(text);
    setLoading(false);
    setGameState('briefing');
  };

  const handleAction = (action: string) => {
    console.log("HUD Action:", action, "on", selectedId);
    // Logic for training units, stopping, etc. would go here
    if (action === 'stop' && selectedId) {
        const u = engine.units.find(u => u.id === selectedId);
        if (u) {
            u.state = 'idle';
            u.targetPos = undefined;
        }
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0d0d0d] text-white p-6 relative overflow-hidden">
        {/* Background Visual */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img src="https://picsum.photos/1920/1080?grayscale&blur=5" className="w-full h-full object-cover" alt="Background" />
        </div>

        <div className="z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 font-serif tracking-tighter text-amber-500 drop-shadow-lg">
                ORCS VS HUMANS
            </h1>
            <p className="text-gray-400 mb-12 text-lg uppercase tracking-widest">Mobile Origins</p>
            
            <div className="flex flex-col sm:flex-row gap-6">
                <button 
                    onClick={() => handleStartGame(Faction.HUMAN)}
                    className="group relative px-12 py-4 bg-blue-900/40 hover:bg-blue-800 transition-all border-2 border-blue-500 rounded-lg overflow-hidden"
                    disabled={loading}
                >
                    <span className="relative z-10 text-xl font-bold">HUMAN ALLIANCE</span>
                    <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
                
                <button 
                    onClick={() => handleStartGame(Faction.ORC)}
                    className="group relative px-12 py-4 bg-red-900/40 hover:bg-red-800 transition-all border-2 border-red-500 rounded-lg overflow-hidden"
                    disabled={loading}
                >
                    <span className="relative z-10 text-xl font-bold">ORCISH HORDE</span>
                    <div className="absolute inset-0 bg-red-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>
            
            {loading && (
                <div className="mt-8 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-amber-500 text-sm animate-pulse">Consulting the War Council...</span>
                </div>
            )}
        </div>

        <footer className="absolute bottom-8 text-gray-500 text-xs text-center px-4">
            Enhanced for mobile with Gemini AI Powered Campaign Briefings. <br/>
            Drag to pan, tap to select/order.
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative bg-gray-900 overflow-hidden select-none touch-none">
      {gameState === 'briefing' && (
        <BriefingModal 
          briefing={briefing} 
          faction={faction} 
          onClose={() => setGameState('playing')} 
        />
      )}

      <GameMap 
        engine={engine} 
        onSelect={setSelectedId} 
      />

      <HUD 
        resources={engine.playerResources} 
        selectedEntity={selectedEntity} 
        onAction={handleAction}
        faction={faction}
      />

      <button 
        onClick={() => setGameState('menu')}
        className="fixed top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors z-20"
      >
        ⚙️
      </button>
    </div>
  );
};

export default App;
