
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Paperclip } from 'lucide-react';
import TagCloud from './TagCloud';
import { ScrapbookEntry } from '../types';

interface PolaroidCardProps {
  entry: ScrapbookEntry;
  onDelete: () => void;
  onRemoveTag: (tag: string) => void;
}

const PolaroidCard: React.FC<PolaroidCardProps> = ({ entry, onDelete, onRemoveTag }) => {
  const [rotation] = useState(() => (Math.random() * 6 - 3));
  const [decoration] = useState(() => Math.floor(Math.random() * 3));

  const DecorationIcon = () => {
    switch(decoration) {
      case 0: return <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-400/20 rotate-1 backdrop-blur-sm z-20 border-x border-amber-900/10 shadow-sm" />; // Washed Tape
      case 1: return <Paperclip className="absolute -top-5 left-8 text-stone-400 dark:text-stone-500 rotate-12 z-30 drop-shadow-sm" size={32} />;
      default: return <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-red-600 rounded-full shadow-lg z-30 border-2 border-white/40" />; // Red Pushpin
    }
  };

  return (
    <motion.div 
      layoutId={`img-shell-${entry.id}`}
      style={{ rotate: rotation }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group w-full"
    >
      <div className="bg-white dark:bg-stone-200 p-4 pb-14 shadow-2xl border border-stone-200 dark:border-stone-400 transition-transform duration-500 hover:scale-[1.03] hover:z-40">
        <DecorationIcon />
        
        {/* Original Aspect Ratio Container */}
        <div className="relative w-full bg-stone-50/50 dark:bg-stone-300/50 overflow-hidden flex items-center justify-center">
           <img 
             src={entry.imageUrl} 
             alt="Design Board Item" 
             className="w-full h-auto block" // 保留原图比例
           />
           
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
             className="absolute top-3 right-3 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 active:scale-90"
           >
             <Trash2 size={16} />
           </button>
        </div>

        {/* Info Area */}
        <div className="mt-5 px-1 min-h-[40px]">
          <TagCloud tags={entry.tags} onRemove={onRemoveTag} />
        </div>
      </div>
    </motion.div>
  );
};

export default PolaroidCard;
