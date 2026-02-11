
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy } from 'lucide-react';

interface TagCloudProps {
  tags: string[];
  onRemove: (tag: string) => void;
}

const TagCloud: React.FC<TagCloudProps> = ({ tags, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopied(tag);
    setTimeout(() => setCopied(null), 2000);
  };

  if (tags.length === 0) return null;

  return (
    <div 
      className="relative z-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col gap-1">
        <AnimatePresence mode="popLayout">
          {isHovered ? (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0, scale: 0.95, x: -5 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -5 }}
              className="flex flex-wrap gap-2 max-w-[200px]"
            >
              {tags.map((tag) => (
                <TagItem 
                  key={tag} 
                  tag={tag} 
                  onRemove={onRemove} 
                  onCopy={handleCopy} 
                  isCopied={copied === tag} 
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <div className="px-3 py-1 bg-amber-100 dark:bg-stone-800 rounded-full text-[10px] font-bold uppercase tracking-tighter text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-stone-700">
                {tags[0]}
              </div>
              {tags.length > 1 && (
                <div className="w-6 h-6 flex items-center justify-center bg-stone-200 dark:bg-stone-700 rounded-full text-[10px] font-bold text-stone-600 dark:text-stone-300">
                  +{tags.length - 1}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TagItem: React.FC<{ 
  tag: string, 
  onRemove: (t: string) => void, 
  onCopy: (t: string) => void, 
  isCopied: boolean 
}> = ({ tag, onRemove, onCopy, isCopied }) => {
  return (
    <motion.div 
      layout
      className="group/item relative flex items-center bg-white dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-md px-2 py-1 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => onCopy(tag)}
    >
      <span className="text-[11px] font-medium leading-tight whitespace-nowrap text-amber-950 dark:text-amber-50">
        {isCopied ? "Copied!" : tag}
      </span>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(tag);
        }}
        className="ml-2 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-stone-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
      >
        <X size={10} />
      </button>
    </motion.div>
  );
};

export default TagCloud;
