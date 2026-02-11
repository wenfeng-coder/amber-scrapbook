
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
  const [rotation] = useState(() => (Math.random() * 4 - 2));
  const [decoration] = useState(() => Math.floor(Math.random() * 3));

  const DecorationIcon = () => {
    switch(decoration) {
      case 0: return <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-4 bg-amber-400/30 rotate-2 backdrop-blur-sm z-20 border-x border-amber-900/5" />; // Tape
      case 1: return <Paperclip className="absolute -top-4 left-6 text-stone-400 dark:text-stone-600 rotate-12 z-20 drop-shadow-sm" size={28} />;
      default: return <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full shadow-md z-20 border-2 border-white/30" />; // Pin
    }
  };

  return (
    <motion.div 
      layoutId={`img-container-${entry.id}`}
      style={{ rotate: rotation }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group w-full"
    >
      <div className="bg-white dark:bg-stone-200 p-3 pb-12 shadow-[0_15px_35px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-stone-100 dark:border-stone-400 transition-transform duration-500 hover:scale-[1.02] hover:z-30">
        <DecorationIcon />
        
        {/* Aspect ratio preserved container */}
        <div className="relative w-full bg-stone-50 overflow-hidden">
           <motion.img 
             layoutId={`img-${entry.id}`}
             src={entry.imageUrl} 
             alt="Design Inspiration" 
             className="w-full h-auto block" 
           />
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
             className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600"
           >
             <Trash2 size={14} />
           </button>
        </div>

        {/* Footer info: Tags */}
        <div className="mt-4 px-1">
          <TagCloud tags={entry.tags} onRemove={onRemoveTag} />
        </div>
      </div>
    </motion.div>
  );
};

export default PolaroidCard;
