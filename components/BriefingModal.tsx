
import React from 'react';

interface BriefingModalProps {
  briefing: string;
  onClose: () => void;
  faction: string;
}

const BriefingModal: React.FC<BriefingModalProps> = ({ briefing, onClose, faction }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#2d1b1b] border-2 border-amber-900 rounded-lg max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-600"></div>
        
        <h2 className="text-2xl font-bold text-amber-500 mb-4 font-serif uppercase tracking-widest">
          {faction} War Council
        </h2>
        
        <div className="text-gray-200 text-lg leading-relaxed mb-8 italic">
          "{briefing}"
        </div>
        
        <button 
          onClick={onClose}
          className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded border border-amber-900 transition-colors uppercase tracking-widest"
        >
          To Battle!
        </button>
      </div>
    </div>
  );
};

export default BriefingModal;
