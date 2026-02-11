
import React from 'react';
import { addDays, format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import PolaroidCard from './PolaroidCard';
import ResizableNotes from './ResizableNotes';
import { WeeklyData, ScrapbookEntry } from '../types';

interface ScrapbookGridProps {
  weekStart: Date;
  weeklyData: WeeklyData;
  onImageUpload: (date: Date, file: File) => void;
  onDeleteEntry: (id: string) => void;
  onRemoveTag: (entryId: string, tag: string) => void;
  onUpdateNote: (note: string) => void;
}

const ScrapbookGrid: React.FC<ScrapbookGridProps> = ({ 
  weekStart, 
  weeklyData, 
  onImageUpload, 
  onDeleteEntry,
  onRemoveTag,
  onUpdateNote
}) => {
  const days = [
    { label: 'Monday', date: weekStart },
    { label: 'Tuesday', date: addDays(weekStart, 1) },
    { label: 'Wednesday', date: addDays(weekStart, 2) },
    { label: 'Thursday', date: addDays(weekStart, 3) },
    { label: 'Friday', date: addDays(weekStart, 4) },
    { label: 'Weekend', date: addDays(weekStart, 5), isCombined: true }, // Sat/Sun
  ];

  const getEntriesForDay = (dayDate: Date, isCombined: boolean) => {
    return weeklyData.entries.filter(entry => {
      const entryDate = new Date(entry.date);
      if (isCombined) {
        return isSameDay(entryDate, dayDate) || isSameDay(entryDate, addDays(dayDate, 1));
      }
      return isSameDay(entryDate, dayDate);
    });
  };

  return (
    <div className="w-full max-w-6xl grid grid-rows-[auto_auto_auto] gap-6">
      {/* Row 1: Mon, Tue, Wed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {days.slice(0, 3).map((day) => (
          <DaySection 
            key={day.label} 
            day={day} 
            entries={getEntriesForDay(day.date, false)}
            onImageUpload={onImageUpload}
            onDeleteEntry={onDeleteEntry}
            onRemoveTag={onRemoveTag}
          />
        ))}
      </div>

      {/* Row 2: Thu, Fri, Weekend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {days.slice(3).map((day) => (
          <DaySection 
            key={day.label} 
            day={day} 
            entries={getEntriesForDay(day.date, day.isCombined || false)}
            onImageUpload={onImageUpload}
            onDeleteEntry={onDeleteEntry}
            onRemoveTag={onRemoveTag}
          />
        ))}
      </div>

      {/* Row 3: Resizable Notes Area */}
      <div className="w-full">
        <ResizableNotes 
          value={weeklyData.generalNote} 
          onChange={onUpdateNote} 
        />
      </div>
    </div>
  );
};

const DaySection: React.FC<{ 
  day: { label: string, date: Date, isCombined?: boolean }, 
  entries: ScrapbookEntry[],
  onImageUpload: (date: Date, file: File) => void,
  onDeleteEntry: (id: string) => void,
  onRemoveTag: (entryId: string, tag: string) => void
}> = ({ day, entries, onImageUpload, onDeleteEntry, onRemoveTag }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border-2 border-dashed border-amber-200 dark:border-stone-800 rounded-3xl p-4 min-h-[300px] flex flex-col relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-xl handwritten text-amber-800 dark:text-amber-500">{day.label}</h3>
          <p className="text-xs opacity-50">{format(day.date, 'MMMM d')}</p>
        </div>
        
        <label className="cursor-pointer bg-amber-100 dark:bg-stone-800 p-2 rounded-full hover:bg-amber-200 dark:hover:bg-stone-700 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.files && onImageUpload(day.date, e.target.files[0])}
          />
          <span className="text-amber-900 dark:text-amber-100 text-xs font-bold">+</span>
        </label>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pb-4">
        {entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none mt-12">
            <div className="w-16 h-16 border-4 border-dashed border-current rounded-full mb-2" />
            <p className="handwritten text-lg">Paste some magic here</p>
          </div>
        ) : (
          entries.map(entry => (
            <PolaroidCard 
              key={entry.id} 
              entry={entry} 
              onDelete={() => onDeleteEntry(entry.id)}
              onRemoveTag={(tag) => onRemoveTag(entry.id, tag)}
            />
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ScrapbookGrid;
