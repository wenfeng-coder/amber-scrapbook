
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Maximize2 } from 'lucide-react';
import { ScrapbookEntry } from '../types';

interface DayModuleProps {
  day: { label: string, date: Date, isCombined?: boolean };
  entries: ScrapbookEntry[];
  onClick: () => void;
}

const DayModule: React.FC<DayModuleProps> = ({ day, entries, onClick }) => {
  return (
    <motion.div 
      layoutId={`day-${day.label}`}
      onClick={onClick}
      className="group relative bg-white/40 dark:bg-stone-900/40 backdrop-blur-sm border border-amber-200/50 dark:border-stone-800 rounded-[2rem] p-6 h-64 flex flex-col cursor-pointer shadow-sm hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-900 transition-all overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-amber-900 dark:text-amber-500">{day.label}</h3>
          <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{format(day.date, 'MMMM do')}</p>
        </div>
        <div className="p-2 rounded-full bg-amber-50 dark:bg-stone-800 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 size={16} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {entries.length > 0 ? (
          <div className="relative w-28 h-28">
            {entries.slice(0, 3).map((entry, idx) => (
              <motion.div
                key={entry.id}
                layoutId={`img-${entry.id}`}
                className="absolute inset-0 bg-white p-1 shadow-lg border border-stone-100"
                style={{ 
                  rotate: idx * 6 - 6,
                  zIndex: 3 - idx,
                  x: idx * 8,
                  scale: 1 - idx * 0.05
                }}
              >
                <img src={entry.imageUrl} className="w-full h-full object-cover" />
              </motion.div>
            ))}
            {entries.length > 3 && (
                <div className="absolute -bottom-2 -right-4 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                    +{entries.length - 3}
                </div>
            )}
          </div>
        ) : (
          <div className="text-center opacity-20 handwritten text-lg">Empty canvas...</div>
        )}
      </div>
    </motion.div>
  );
};

export default DayModule;
