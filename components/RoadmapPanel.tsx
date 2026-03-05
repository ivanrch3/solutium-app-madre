import React, { useState } from 'react';
import { RoadmapItem, ChangelogEntry } from '../services/roadmapData';
import { CheckCircle2, Circle, Clock, Info, ChevronRight, ChevronDown } from 'lucide-react';

interface RoadmapPanelProps {
  title: string;
  roadmap: RoadmapItem[];
  changelog: ChangelogEntry[];
  isOpen?: boolean;
  onClose?: () => void;
}

export const RoadmapPanel: React.FC<RoadmapPanelProps> = ({ 
  title, 
  roadmap, 
  changelog,
  isOpen = true,
  onClose
}) => {
  const [isRoadmapExpanded, setIsRoadmapExpanded] = useState(false);
  const [isChangelogExpanded, setIsChangelogExpanded] = useState(false);

  return (
    <aside className={`bg-white border-l border-slate-200 h-full flex flex-col transition-all duration-300 ${isOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Info className="w-4 h-4 mr-2 text-solutium-blue" />
          {title}
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* ROADMAP SECTION */}
        <section className="border border-slate-100 rounded-xl overflow-hidden">
          <button 
            onClick={() => setIsRoadmapExpanded(!isRoadmapExpanded)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Próximas Mejoras</h4>
            {isRoadmapExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>
          
          {isRoadmapExpanded && (
            <div className="p-3 space-y-4 animate-fadeIn">
              {roadmap.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay tareas pendientes.</p>
              ) : (
                roadmap.map((item) => (
                  <div key={item.id} className="relative pl-6">
                    <div className="absolute left-0 top-1">
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : item.status === 'current' ? (
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${item.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {item.title}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* CHANGELOG SECTION */}
        <section className="border border-slate-100 rounded-xl overflow-hidden">
          <button 
            onClick={() => setIsChangelogExpanded(!isChangelogExpanded)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Historial de Cambios</h4>
            {isChangelogExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {isChangelogExpanded && (
            <div className="p-3 space-y-6 animate-fadeIn">
              {changelog.map((entry) => (
                <div key={entry.id} className="border-l-2 border-slate-100 pl-4 py-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400">{entry.date}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      entry.type === 'feature' ? 'bg-blue-50 text-blue-600' : 
                      entry.type === 'fix' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {entry.type}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">{entry.title}</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center">
          Solutium Ecosystem Status: <span className="text-green-500 font-bold uppercase">Operational</span>
        </p>
      </div>
    </aside>
  );
};
