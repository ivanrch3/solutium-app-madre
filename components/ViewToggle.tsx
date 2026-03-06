import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => {
  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
      <button
        onClick={() => onChange('list')}
        className={`p-1.5 rounded-md transition-colors ${
          view === 'list' 
            ? 'bg-white text-solutium-blue shadow-sm' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
        title="Vista de Lista"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded-md transition-colors ${
          view === 'grid' 
            ? 'bg-white text-solutium-blue shadow-sm' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
        title="Vista de Cuadrícula"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );
};
