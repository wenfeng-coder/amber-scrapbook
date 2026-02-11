
import React, { useState, useEffect, useCallback } from 'react';
// Fix: Removed missing members startOfWeek and subWeeks and added startOfISOWeek as a stable alternative.
import { format, addWeeks, isSameDay, startOfISOWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Sun, Pin, Camera } from 'lucide-react';
import ScrapbookGrid from './components/ScrapbookGrid';
import { ScrapbookEntry, WeeklyData } from './types';
import { analyzeImageDesign } from './geminiService';

const App: React.FC = () => {
  // Fix: Use startOfISOWeek(new Date()) to correctly get the Monday starting the current week.
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfISOWeek(new Date())
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('scrapbook_data');
    if (saved) {
      setWeeklyData(JSON.parse(saved));
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('scrapbook_data', JSON.stringify(weeklyData));
  }, [weeklyData]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navigateWeek = (direction: 'next' | 'prev') => {
    // Fix: Using addWeeks(prev, -1) as a robust replacement for subWeeks.
    setCurrentWeekStart(prev => direction === 'next' ? addWeeks(prev, 1) : addWeeks(prev, -1));
  };

  const getCurrentWeeklyData = useCallback(() => {
    const startStr = currentWeekStart.toISOString();
    let data = weeklyData.find(w => w.weekStart === startStr);
    if (!data) {
      data = { weekStart: startStr, entries: [], generalNote: "" };
    }
    return data;
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
      
      // Temporary entry with loading state
      const newEntry: ScrapbookEntry = {
        id: Math.random().toString(36).substr(2, 9),
        date: date.toISOString(),
        imageUrl: base64,
        tags: ["Analyzing..."]
      };

      const current = getCurrentWeeklyData();
      updateWeeklyData({ entries: [...current.entries, newEntry] });

      // Trigger Gemini API
      const tags = await analyzeImageDesign(base64);
      
      // Update entry with real tags
      setWeeklyData(prev => {
        const startStr = currentWeekStart.toISOString();
        const weekIndex = prev.findIndex(w => w.weekStart === startStr);
        if (weekIndex > -1) {
          const updatedWeek = { ...prev[weekIndex] };
          const entryIndex = updatedWeek.entries.findIndex(entry => entry.id === newEntry.id);
          if (entryIndex > -1) {
            updatedWeek.entries[entryIndex].tags = tags;
          }
          const newState = [...prev];
          newState[weekIndex] = updatedWeek;
          return newState;
        }
        return prev;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeTag = (entryId: string, tagToRemove: string) => {
    setWeeklyData(prev => {
      const startStr = currentWeekStart.toISOString();
      const weekIndex = prev.findIndex(w => w.weekStart === startStr);
      if (weekIndex > -1) {
        const updatedWeek = { ...prev[weekIndex] };
        const entryIndex = updatedWeek.entries.findIndex(e => e.id === entryId);
        if (entryIndex > -1) {
          updatedWeek.entries[entryIndex].tags = updatedWeek.entries[entryIndex].tags.filter(t => t !== tagToRemove);
        }
        const newState = [...prev];
        newState[weekIndex] = updatedWeek;
        return newState;
      }
      return prev;
    });
  };

  const deleteEntry = (entryId: string) => {
    const current = getCurrentWeeklyData();
    updateWeeklyData({ entries: current.entries.filter(e => e.id !== entryId) });
  };

  const weekEnd = format(addWeeks(currentWeekStart, 1), 'MMM d, yyyy');
  const weekStartStr = format(currentWeekStart, 'MMM d');

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-white p-2 rounded-lg shadow-lg rotate-3">
            <Camera size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold handwritten text-amber-900 dark:text-amber-400">Amber Scrapbook</h1>
            <p className="text-sm opacity-60">AI Design Inspiration Journal</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-stone-900 px-6 py-2 rounded-full shadow-md border border-amber-100 dark:border-stone-800">
          <button 
            onClick={() => navigateWeek('prev')}
            className="p-1 hover:bg-amber-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col items-center min-w-[180px]">
            <span className="text-xs uppercase tracking-widest font-semibold opacity-50">Current Week</span>
            <span className="font-bold text-lg">{weekStartStr} — {weekEnd}</span>
          </div>
          <button 
            onClick={() => navigateWeek('next')}
            className="p-1 hover:bg-amber-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-amber-200 dark:bg-stone-800 text-amber-900 dark:text-amber-200 shadow-inner"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main Grid */}
      <ScrapbookGrid 
        weekStart={currentWeekStart}
        weeklyData={getCurrentWeeklyData()}
        onImageUpload={handleImageUpload}
        onDeleteEntry={deleteEntry}
        onRemoveTag={removeTag}
        onUpdateNote={(note) => updateWeeklyData({ generalNote: note })}
      />
      
      {/* Decorative Footer */}
      <footer className="mt-12 opacity-30 flex items-center gap-2 handwritten">
        <Pin size={16} />
        <span>Handcrafted with AI for designers.</span>
      </footer>
    </div>
  );
};

export default App;
