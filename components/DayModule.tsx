
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Layout } from 'lucide-react';
import { ScrapbookEntry } from '../types';

interface DayModuleProps {
  day: { label: string, date: Date, isCombined?: boolean };
  entries: ScrapbookEntry[];
  onClick: () => void;
}

const DayModule: React.FC<DayModuleProps> = ({ day, entries, onClick }) => {
  return (
    <motion.div 
      layoutId={`day-container-${day.label}`}
      onClick={onClick}
      className="group relative cursor-pointer flex flex-col h-64 rounded-[2.5rem] p-6 transition-all duration-300
        bg-[#FEF3C7] dark:bg-[#2D2D2D] /* 温暖琥珀色 vs 深棕色 */
        border border-amber-200/50 dark:border-stone-700
        shadow-md hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
    >
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-xl font-bold text-amber-900 dark:text-amber-500">{day.label}</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{format(day.date, 'MMM do')}</p>
        </div>
        <div className="p-2 rounded-full bg-white/40 dark:bg-stone-800/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <Layout size={16} className="text-amber-700 dark:text-amber-400" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative mt-2">
        {entries.length > 0 ? (
          <div className="relative w-24 h-24">
            {entries.slice(0, 3).map((entry, idx) => (
              <motion.div
                key={entry.id}
                layoutId={`img-shell-${entry.id}`}
                className="absolute inset-0 bg-white p-1 shadow-md border border-stone-100"
                style={{ 
                  rotate: idx * 8 - 8,
                  zIndex: 3 - idx,
                  x: idx * 12,
                  scale: 1 - idx * 0.05
                }}
              >
                <img src={entry.imageUrl} className="w-full h-full object-contain" />
              </motion.div>
            ))}
            {entries.length > 3 && (
                <div className="absolute -bottom-1 -right-4 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                    +{entries.length - 3}
                </div>
            )}
          </div>
        ) : (
          <div className="text-center opacity-10 handwritten text-2xl select-none">Blank space...</div>
        )}
      </div>

      {/* Decorative inner gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-50" />
    </motion.div>
  );
};

export default DayModule;
