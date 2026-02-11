
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface TagCloudProps {
  tags: string[];
  onRemove: (tag: string) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ tags, onRemove }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopied(tag);
    setTimeout(() => setCopied(null), 2000);
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.div 
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => handleCopy(tag)}
            className="group relative flex items-center gap-1.5 px-3 py-1 bg-amber-50/50 dark:bg-stone-300 border border-amber-200 dark:border-stone-400 rounded-md cursor-pointer hover:border-amber-400 transition-all shadow-sm"
          >
            <span className="text-[11px] font-bold text-amber-900 dark:text-stone-800 uppercase tracking-tighter">
              {tag}
            </span>
            
            <AnimatePresence>
                {copied === tag ? (
                    <motion.div initial={{scale:0}} animate={{scale:1}} className="text-green-600"><Check size={10}/></motion.div>
                ) : (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(tag);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity"
                    >
                        <X size={10} />
                    </button>
                )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TagCloud;
