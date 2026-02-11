
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
      className="fixed inset-0 z-50 flex flex-col bg-[#FAF9F6]/95 dark:bg-stone-950/95 backdrop-blur-xl paper-texture overflow-y-auto"
    >
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 w-full px-6 md:px-12 py-6 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-bold text-sm">Back</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-500">{dayLabel}</h2>
            <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-40">{format(currentDay.date, 'MMMM do, yyyy')}</p>
        </div>

        <label className="cursor-pointer flex items-center gap-2 px-6 py-2 rounded-full bg-amber-600 text-white shadow-lg hover:bg-amber-700 transition-all hover:scale-105">
          <Plus size={18} />
          <span className="font-bold text-sm">Add Inspiration</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.files && onImageUpload(currentDay.date, e.target.files[0])}
          />
        </label>
      </div>

      {/* Masonry Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-12">
        {dayEntries.length > 0 ? (
          <div className="masonry-grid">
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
            <ImageIcon size={64} strokeWidth={1} />
            <p className="mt-4 text-2xl handwritten">Start your mood board...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ExpandedView;
