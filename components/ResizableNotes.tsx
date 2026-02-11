
import React, { useState, useRef, useEffect } from 'react';
import { StickyNote } from 'lucide-react';

interface ResizableNotesProps {
  value: string;
  onChange: (val: string) => void;
}

const ResizableNotes: React.FC<ResizableNotesProps> = ({ value, onChange }) => {
  const [height, setHeight] = useState(200);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newHeight = Math.max(150, e.clientY - rect.top);
    setHeight(newHeight);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      ref={containerRef}
      style={{ height: `${height}px` }}
      className="relative w-full bg-amber-50 dark:bg-stone-900 border-2 border-amber-200 dark:border-stone-800 rounded-3xl p-6 flex flex-col shadow-inner group"
    >
      <div className="flex items-center gap-2 mb-2 opacity-50">
        <StickyNote size={18} />
        <span className="text-sm font-bold uppercase tracking-widest handwritten">Weekly Notes</span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Thoughts, reflections, or the vibe of this week..."
        className="flex-1 bg-transparent border-none outline-none resize-none handwritten text-xl text-amber-900 dark:text-amber-100 placeholder:opacity-30"
      />

      {/* Resize handle */}
      <div 
        onMouseDown={handleMouseDown}
        className="absolute bottom-0 left-0 right-0 h-6 cursor-ns-resize flex items-center justify-center group-hover:bg-amber-100/30 dark:group-hover:bg-stone-800/30 transition-colors rounded-b-3xl"
      >
        <div className="w-12 h-1 bg-amber-300 dark:bg-stone-700 rounded-full opacity-50" />
      </div>
    </div>
  );
};

export default ResizableNotes;
