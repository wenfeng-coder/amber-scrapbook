
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Image as ImageIcon } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import PolaroidCard from './PolaroidCard';
import { ScrapbookEntry } from '../types';

interface ExpandedViewProps {
  dayLabel: string;
  weekStart: Date;
  entries: ScrapbookEntry[];
  onClose: () => void;
  onImageUpload: (date: Date, file: File) => void;
  onDeleteEntry: (id: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
}

const ExpandedView: React.FC<ExpandedViewProps> = ({ 
  dayLabel, 
  weekStart, 
  entries, 
  onClose, 
  onImageUpload, 
  onDeleteEntry,
  onRemoveTag
}) => {
  const days = [
    { label: 'Monday', date: weekStart },
    { label: 'Tuesday', date: addDays(weekStart, 1) },
    { label: 'Wednesday', date: addDays(weekStart, 2) },
    { label: 'Thursday', date: addDays(weekStart, 3) },
    { label: 'Friday', date: addDays(weekStart, 4) },
    { label: 'Weekend', date: addDays(weekStart, 5), isCombined: true },
  ];

  const currentDay = days.find(d => d.label === dayLabel)!;
  const dayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    if (currentDay.isCombined) {
      return isSameDay(entryDate, currentDay.date) || isSameDay(entryDate, addDays(currentDay.date, 1));
    }
    return isSameDay(entryDate, currentDay.date);
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#F9F8F6]/98 dark:bg-[#121212]/98 backdrop-blur-2xl paper-texture overflow-y-auto"
    >
      {/* App Bar */}
      <div className="sticky top-0 z-50 w-full px-8 py-8 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:border-amber-500 transition-all"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Return</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-500">{dayLabel}</h2>
            <p className="text-xs uppercase tracking-widest font-black opacity-30">{format(currentDay.date, 'MMMM do, yyyy')}</p>
        </div>

        <label className="cursor-pointer flex items-center gap-2 px-7 py-2.5 rounded-full bg-amber-600 text-white shadow-xl hover:bg-amber-700 hover:scale-105 active:scale-95 transition-all">
          <Plus size={20} />
          <span className="font-bold text-sm">New Inspiration</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.files && onImageUpload(currentDay.date, e.target.files[0])}
          />
        </label>
      </div>

      {/*无裁剪瀑布流内容 */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-8 md:px-12 pb-24">
        {dayEntries.length > 0 ? (
          <div className="masonry-grid mt-12">
            {dayEntries.map(entry => (
              <div key={entry.id} className="masonry-item">
                <PolaroidCard 
                  entry={entry}
                  onDelete={() => onDeleteEntry(entry.id)}
                  onRemoveTag={(tag) => onRemoveTag(entry.id, tag)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center text-stone-300 dark:text-stone-700">
            <div className="w-24 h-24 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center">
                <ImageIcon size={48} strokeWidth={1} />
            </div>
            <p className="mt-8 text-3xl handwritten opacity-60">Your canvas is waiting...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ExpandedView;
