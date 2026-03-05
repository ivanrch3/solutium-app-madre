import React from 'react';

export type TabStyle = 'primary' | 'secondary';

interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  style?: TabStyle;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  options, 
  activeTab, 
  onChange, 
  style = 'primary',
  className = ''
}) => {
  if (style === 'primary') {
    return (
      <div className={`flex items-center space-x-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar ${className}`}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`px-4 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === option.id 
                ? 'text-solutium-blue' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="ml-1.5 opacity-50 text-xs">({option.count})</span>
            )}
            {activeTab === option.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-solutium-blue rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto no-scrollbar ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
            activeTab === option.id 
              ? 'bg-white text-solutium-blue shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-2 opacity-50">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};
