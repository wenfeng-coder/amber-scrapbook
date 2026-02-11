
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Trash2, Paperclip } from 'lucide-react';
import TagCloud from './TagCloud';
import { ScrapbookEntry } from '../types';

interface PolaroidCardProps {
  entry: ScrapbookEntry;
  onDelete: () => void;
  onRemoveTag: (tag: string) => void;
}

const PolaroidCard: React.FC<PolaroidCardProps> = ({ entry, onDelete, onRemoveTag }) => {
  // Random rotation for that "scrapbook" feel
  const [rotation] = useState(() => (Math.random() * 6 - 3));
  const [decoration] = useState(() => Math.floor(Math.random() * 3));

  const DecorationIcon = () => {
    switch(decoration) {
      case 0: return <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-amber-400/40 rotate-2 backdrop-blur-sm z-10" />; // Tape
      case 1: return <Paperclip className="absolute -top-2 left-4 text-stone-400 rotate-12 z-10" size={20} />;
      default: return <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full shadow-sm z-10" />; // Pin
    }
  };

  return (
    <motion.div 
      style={{ rotate: rotation }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group flex items-start"
    >
      <div className="bg-white dark:bg-stone-200 p-2 pb-8 shadow-xl border border-amber-100 dark:border-stone-400 relative">
        <DecorationIcon />
        
        <div className="relative overflow-hidden w-full aspect-square bg-stone-100">
           <img src={entry.imageUrl} alt="Inspiration" className="w-full h-full object-cover" />
           <button 
             onClick={onDelete}
             className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
           >
             <Trash2 size={12} />
           </button>
        </div>
      </div>

      {/* Tags Side Section */}
      <div className="ml-4 flex-1">
        <TagCloud tags={entry.tags} onRemove={onRemoveTag} />
      </div>
    </motion.div>
  );
};

export default PolaroidCard;
