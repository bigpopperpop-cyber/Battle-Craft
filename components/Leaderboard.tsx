
import React from 'react';
import { PlayerData } from '../services/firebaseService';

interface LeaderboardProps {
  entries: PlayerData[];
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#1a120b] border-2 border-amber-700 w-full max-w-md rounded-lg overflow-hidden flex flex-col shadow-[0_0_50px_rgba(180,83,9,0.3)]">
        <div className="bg-amber-900/40 p-4 border-b border-amber-800 flex justify-between items-center">
          <h2 className="text-2xl font-serif text-amber-500 font-bold tracking-widest uppercase">Hall of Heroes</h2>
          <button onClick={onClose} className="text-amber-500 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto max-h-[60vh]">
          {entries.length === 0 ? (
            <div className="text-center text-gray-500 py-8 italic">No legends recorded yet...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-amber-600 text-xs uppercase tracking-tighter border-b border-amber-900/50">
                  <th className="pb-2">Commander</th>
                  <th className="pb-2">Faction</th>
                  <th className="pb-2 text-right">Mission</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {entries.map((entry, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-xs">{entry.uid.substring(0, 8)}...</td>
                    <td className={`py-3 text-xs font-bold ${entry.faction === 'Human' ? 'text-blue-400' : 'text-red-400'}`}>
                      {entry.faction.toUpperCase()}
                    </td>
                    <td className="py-3 text-right text-amber-500 font-bold">{entry.mission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 bg-black/40 text-center">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded font-bold uppercase text-sm tracking-widest"
          >
            Return to Gates
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
