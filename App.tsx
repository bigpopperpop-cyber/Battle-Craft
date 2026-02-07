
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import GameMap from './components/GameMap';
import HUD from './components/HUD';
import BriefingModal from './components/BriefingModal';
import Leaderboard from './components/Leaderboard';
import { GameEngine } from './gameEngine';
import { Faction, GameEntity } from './types';
import { generateBriefing } from './services/geminiService';
import { initAuth, saveGameState, loadGameState, getLeaderboard, PlayerData } from './services/firebaseService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'briefing' | 'playing'>('menu');
  const [faction, setFaction] = useState<Faction>(Faction.HUMAN);
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [saveData, setSaveData] = useState<PlayerData | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<PlayerData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const engine = useMemo(() => new GameEngine(), []);

  // Initialize Auth and check for saves
  useEffect(() => {
    initAuth().then(async (userUid) => {
      if (userUid) {
        setUid(userUid);
        const data = await loadGameState(userUid);
        if (data) setSaveData(data);
      }
    }).catch(err => {
      console.warn("Auth initialization failed, running in local mode:", err);
    });
  }, []);

  // Auto-save loop
  useEffect(() => {
    if (gameState !== 'playing' || !uid) return;

    const interval = setInterval(async () => {
      setIsSyncing(true);
      const success = await saveGameState({
        uid,
        gold: engine.playerResources.gold,
        wood: engine.playerResources.wood,
        faction: faction,
        mission: 1, // Currently only 1 mission demo
        lastUpdated: Date.now()
      });
      setTimeout(() => setIsSyncing(false), 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, [gameState, uid, faction, engine.playerResources]);

  const selectedEntity = useMemo(() => {
    return engine.units.find(u => u.id === selectedId) || engine.buildings.find(b => b.id === selectedId) || null;
  }, [selectedId, engine]);

  const handleStartGame = async (selectedFaction: Faction, resume: boolean = false) => {
    setFaction(selectedFaction);
    setLoading(true);
    
    if (resume && saveData) {
      engine.playerResources.gold = saveData.gold;
      engine.playerResources.wood = saveData.wood;
    }

    const text = await generateBriefing(selectedFaction, resume ? (saveData?.mission || 1) : 1);
    setBriefing(text);
    setLoading(false);
    setGameState('briefing');
  };

  const handleOpenLeaderboard = async () => {
    setLoading(true);
    const entries = await getLeaderboard();
    setLeaderboardEntries(entries);
    setShowLeaderboard(true);
    setLoading(false);
  };

  const handleAction = (action: string) => {
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
        {showLeaderboard && (
          <Leaderboard entries={leaderboardEntries} onClose={() => setShowLeaderboard(false)} />
        )}
        
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img src="https://picsum.photos/1920/1080?grayscale&blur=5" className="w-full h-full object-cover" alt="Background" />
        </div>

        <div className="z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 font-serif tracking-tighter text-amber-500 drop-shadow-lg text-shadow-xl">
                ORCS VS HUMANS
            </h1>
            <p className="text-gray-400 mb-8 text-lg uppercase tracking-widest">Mobile Origins</p>
            
            <div className="flex flex-col gap-4 max-w-md mx-auto">
                {saveData && (
                  <button 
                    onClick={() => handleStartGame(saveData.faction as Faction, true)}
                    className="group relative px-12 py-4 bg-amber-600/20 hover:bg-amber-600 transition-all border-2 border-amber-500 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  >
                    <span className="relative z-10 text-xl font-bold text-amber-500 group-hover:text-white uppercase">Resume Mission</span>
                  </button>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                      onClick={() => handleStartGame(Faction.HUMAN)}
                      className="group relative px-12 py-4 bg-blue-900/40 hover:bg-blue-800 transition-all border-2 border-blue-500 rounded-lg overflow-hidden"
                      disabled={loading}
                  >
                      <span className="relative z-10 text-xl font-bold">HUMAN ALLIANCE</span>
                  </button>
                  
                  <button 
                      onClick={() => handleStartGame(Faction.ORC)}
                      className="group relative px-12 py-4 bg-red-900/40 hover:bg-red-800 transition-all border-2 border-red-500 rounded-lg overflow-hidden"
                      disabled={loading}
                  >
                      <span className="relative z-10 text-xl font-bold">ORCISH HORDE</span>
                  </button>
                </div>

                <button 
                  onClick={handleOpenLeaderboard}
                  className="mt-4 text-amber-700 hover:text-amber-500 font-bold tracking-widest flex items-center justify-center gap-2 transition-colors"
                >
                  🏆 HALL OF HEROES
                </button>
            </div>
            
            {loading && (
                <div className="mt-8 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-amber-500 text-sm animate-pulse">Consulting the War Council...</span>
                </div>
            )}
        </div>

        <footer className="absolute bottom-8 text-gray-500 text-[10px] text-center px-4 uppercase tracking-tighter">
            {uid ? 'Cloud Sync Active' : 'Offline Mode'} &bull; Gemini AI Strategist &bull; Mobile Enhanced
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

      {/* Sync Status Icon */}
      {isSyncing && uid && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full border border-amber-500/30">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse-glow"></div>
          <span className="text-[10px] text-amber-500 font-bold uppercase">Syncing...</span>
        </div>
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
