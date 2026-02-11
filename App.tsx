
import React, { useState, useEffect, useCallback } from 'react';
import { format, addWeeks, startOfISOWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Sun, Pin, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ScrapbookGrid from './components/ScrapbookGrid';
import ExpandedView from './components/ExpandedView';
import { ScrapbookEntry, WeeklyData } from './types';
import { analyzeImageDesign } from './geminiService';

const App: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfISOWeek(new Date()));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [selectedDayLabel, setSelectedDayLabel] = useState<string | null>(null);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('designmuse_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDarkMode(initialDark);
    if (initialDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('designmuse_theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Data persistence
  useEffect(() => {
    const saved = localStorage.getItem('designmuse_data_v2');
    if (saved) setWeeklyData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('designmuse_data_v2', JSON.stringify(weeklyData));
  }, [weeklyData]);

  const navigateWeek = (direction: 'next' | 'prev') => {
    setCurrentWeekStart(prev => addWeeks(prev, direction === 'next' ? 1 : -1));
  };

  const getCurrentWeeklyData = useCallback(() => {
    const startStr = currentWeekStart.toISOString();
    return weeklyData.find(w => w.weekStart === startStr) || { 
      weekStart: startStr, 
      entries: [], 
      generalNote: "" 
    };
  }, [currentWeekStart, weeklyData]);

  const updateWeeklyData = (newData: Partial<WeeklyData>) => {
    const startStr = currentWeekStart.toISOString();
    setWeeklyData(prev => {
      const index = prev.findIndex(w => w.weekStart === startStr);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...newData };
        return updated;
      } else {
        return [...prev, { weekStart: startStr, entries: [], generalNote: "", ...newData }];
      }
    });
  };

  const handleImageUpload = async (date: Date, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const newEntry: ScrapbookEntry = {
        id: Math.random().toString(36).substr(2, 9),
        date: date.toISOString(),
        imageUrl: base64,
        tags: ["Thinking..."]
      };

      const current = getCurrentWeeklyData();
      updateWeeklyData({ entries: [...current.entries, newEntry] });

      try {
        const tags = await analyzeImageDesign(base64);
        setWeeklyData(prev => {
          const startStr = currentWeekStart.toISOString();
          const weekIndex = prev.findIndex(w => w.weekStart === startStr);
          if (weekIndex > -1) {
            const updatedWeek = { ...prev[weekIndex] };
            const entryIndex = updatedWeek.entries.findIndex(entry => entry.id === newEntry.id);
            if (entryIndex > -1) updatedWeek.entries[entryIndex].tags = tags;
            const newState = [...prev];
            newState[weekIndex] = updatedWeek;
            return newState;
          }
          return prev;
        });
      } catch (err) {
        console.error("Gemini failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const weekRange = `${format(currentWeekStart, 'MMM d')} — ${format(addWeeks(currentWeekStart, 1), 'MMM d, yyyy')}`;

  return (
    <div className="min-h-screen px-4 md:px-12 py-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-amber-500 tracking-tight">
          DesignMuse
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-amber-100 dark:border-stone-800 shadow-sm">
            <button onClick={() => navigateWeek('prev')} className="p-1 hover:bg-amber-100 dark:hover:bg-stone-800 rounded-full transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-xs md:text-sm">{weekRange}</span>
            <button onClick={() => navigateWeek('next')} className="p-1 hover:bg-amber-100 dark:hover:bg-stone-800 rounded-full transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <button 
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-400 hover:rotate-12 transition-all shadow-md"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Grid View */}
      <ScrapbookGrid 
        weekStart={currentWeekStart}
        weeklyData={getCurrentWeeklyData()}
        onSelectDay={setSelectedDayLabel}
        onUpdateNote={(note) => updateWeeklyData({ generalNote: note })}
      />

      {/* Expanded Overlay */}
      <AnimatePresence>
        {selectedDayLabel && (
          <ExpandedView 
            dayLabel={selectedDayLabel}
            weekStart={currentWeekStart}
            entries={getCurrentWeeklyData().entries}
            onClose={() => setSelectedDayLabel(null)}
            onImageUpload={handleImageUpload}
            onDeleteEntry={(id) => {
              const current = getCurrentWeeklyData();
              updateWeeklyData({ entries: current.entries.filter(e => e.id !== id) });
            }}
            onRemoveTag={(id, tag) => {
               const current = getCurrentWeeklyData();
               const updated = current.entries.map(e => e.id === id ? {...e, tags: e.tags.filter(t => t !== tag)} : e);
               updateWeeklyData({ entries: updated });
            }}
          />
        )}
      </AnimatePresence>
      
      <footer className="mt-24 mb-12 opacity-30 flex items-center gap-2 handwritten text-lg">
        <Pin size={16} className="text-amber-600" />
        <span>Design is intelligence made visible.</span>
      </footer>
    </div>
  );
};

export default App;
