
import React from 'react';
import { addDays, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import DayModule from './DayModule';
import ResizableNotes from './ResizableNotes';
import { WeeklyData } from '../types';

interface ScrapbookGridProps {
  weekStart: Date;
  weeklyData: WeeklyData;
  onSelectDay: (label: string) => void;
  onUpdateNote: (note: string) => void;
}

const ScrapbookGrid: React.FC<ScrapbookGridProps> = ({ 
  weekStart, 
  weeklyData, 
  onSelectDay,
  onUpdateNote
}) => {
  const days = [
    { label: 'Monday', date: weekStart },
    { label: 'Tuesday', date: addDays(weekStart, 1) },
    { label: 'Wednesday', date: addDays(weekStart, 2) },
    { label: 'Thursday', date: addDays(weekStart, 3) },
    { label: 'Friday', date: addDays(weekStart, 4) },
    { label: 'Weekend', date: addDays(weekStart, 5), isCombined: true },
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
    <div className="w-full max-w-6xl flex flex-col gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {days.map((day) => (
          <DayModule 
            key={day.label}
            day={day}
            entries={getEntriesForDay(day.date, day.isCombined || false)}
            onClick={() => onSelectDay(day.label)}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mt-4"
      >
        <ResizableNotes 
          value={weeklyData.generalNote} 
          onChange={onUpdateNote} 
        />
      </motion.div>
    </div>
  );
};

export default ScrapbookGrid;
