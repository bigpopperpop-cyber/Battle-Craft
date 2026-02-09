import React from 'react';

interface BriefingModalProps {
  briefing: string;
  onClose: () => void;
  faction: string;
}

const BriefingModal: React.FC<BriefingModalProps> = ({ briefing, onClose, faction }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#2d1b1b] border-4 border-amber-900 rounded-lg max-w-lg w-full p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Parchment Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>
        
        {/* Top Trim */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-900 via-amber-600 to-amber-900"></div>
        
        <h2 className="text-3xl font-bold text-amber-500 mb-6 font-warcraft uppercase tracking-[0.2em] text-center drop-shadow-md">
          {faction} War Council
        </h2>
        
        <div className="relative bg-black/40 p-6 rounded border border-amber-900/30 mb-8 min-h-[160px]">
          <div className="text-amber-100/90 text-lg leading-relaxed italic typewriter-text">
            {briefing}
          </div>
          {/* Subtle Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px]"></div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full bg-[#5c3c26] hover:bg-[#7a5135] active:scale-95 text-amber-100 font-bold py-4 rounded border-2 border-amber-700/50 shadow-lg transition-all uppercase tracking-widest font-warcraft text-xl"
        >
          Enter the Fray
        </button>

        <p className="text-center text-amber-900 text-[10px] mt-4 uppercase tracking-widest opacity-50">
          Azeroth Chronicles &bull; Mission Briefing
        </p>
      </div>
    </div>
  );
};

export default BriefingModal;