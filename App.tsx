
import React, { useState, useEffect, useCallback } from 'react';
import { format, addWeeks, startOfISOWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Sun, Pin } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ScrapbookGrid from './components/ScrapbookGrid';
import ExpandedView from './components/ExpandedView';
import { WeeklyData, ScrapbookEntry } from './types';
import { analyzeImageDesign } from './geminiService';

const App: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfISOWeek(new Date()));
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('designmuse_dark');
      return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [selectedDayLabel, setSelectedDayLabel] = useState<string | null>(null);

  // Sync Dark Mode with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('designmuse_dark', String(isDarkMode));
  }, [isDarkMode]);

  // Load Initial Data
  useEffect(() => {
    const saved = localStorage.getItem('designmuse_store_v3');
    if (saved) setWeeklyData(JSON.parse(saved));
  }, []);

  // Persist Data
  useEffect(() => {
    localStorage.setItem('designmuse_store_v3', JSON.stringify(weeklyData));
  }, [weeklyData]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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
          const weekStartStr = currentWeekStart.toISOString();
          const weekIndex = prev.findIndex(w => w.weekStart === weekStartStr);
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
        console.error("AI Analysis failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const weekLabel = `${format(currentWeekStart, 'MMMM d')} - ${format(addWeeks(currentWeekStart, 1), 'd, yyyy')}`;

  return (
    <div className="min-h-screen py-8 px-6 md:px-16 max-w-7xl mx-auto flex flex-col">
      <header className="flex justify-between items-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-amber-500 tracking-tight select-none">
          DesignMuse
        </h1>

        <div className="flex items-center gap-6">
          <div className="flex items-center bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-5 py-2 rounded-full border border-stone-200 dark:border-stone-800 shadow-sm">
            <button onClick={() => navigateWeek('prev')} className="p-1 hover:text-amber-600 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="mx-4 text-sm font-bold opacity-80">{weekLabel}</span>
            <button onClick={() => navigateWeek('next')} className="p-1 hover:text-amber-600 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <button 
            onClick={toggleDarkMode}
            className="p-3 bg-amber-100 dark:bg-stone-800 rounded-full text-amber-900 dark:text-amber-400 shadow-md hover:scale-110 transition-transform"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <ScrapbookGrid 
        weekStart={currentWeekStart}
        weeklyData={getCurrentWeeklyData()}
        onSelectDay={setSelectedDayLabel}
        onUpdateNote={(note) => updateWeeklyData({ generalNote: note })}
      />

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

      <footer className="mt-auto py-12 flex items-center justify-center gap-2 opacity-30 handwritten text-xl">
        <Pin size={18} className="rotate-45" />
        <span>Curating the soul of design.</span>
      </footer>
    </div>
  );
};

export default App;
