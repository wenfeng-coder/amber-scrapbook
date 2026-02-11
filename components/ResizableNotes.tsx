
import React, { useState, useRef } from 'react';
import { StickyNote } from 'lucide-react';

interface ResizableNotesProps {
  value: string;
  onChange: (val: string) => void;
}

const ResizableNotes: React.FC<ResizableNotesProps> = ({ value, onChange }) => {
  const [height, setHeight] = useState(240);
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
      className="relative w-full bg-[#FFFDF0] dark:bg-stone-900 border border-amber-200/50 dark:border-stone-800 rounded-[2.5rem] p-8 flex flex-col shadow-inner group transition-colors overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-4 opacity-40">
        <StickyNote size={20} className="text-amber-600" />
        <span className="text-sm font-bold uppercase tracking-[0.2em]">Weekly Reflections</span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Capture the vibe of your design week..."
        className="flex-1 bg-transparent border-none outline-none resize-none handwritten text-2xl text-amber-900 dark:text-amber-100 placeholder:opacity-30 leading-relaxed"
      />

      {/* Resize handle */}
      <div 
        onMouseDown={handleMouseDown}
        className="absolute bottom-0 left-0 right-0 h-8 cursor-ns-resize flex items-center justify-center group-hover:bg-amber-100/10 dark:group-hover:bg-amber-900/10 transition-colors"
      >
        <div className="w-16 h-1 bg-amber-200 dark:bg-stone-700 rounded-full opacity-40" />
      </div>
    </div>
  );
};

export default ResizableNotes;
