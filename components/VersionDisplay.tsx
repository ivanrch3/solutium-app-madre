import React, { useState, useEffect } from 'react';
import { X, GitCommit, Calendar, Tag } from 'lucide-react';

interface VersionEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: string[];
}

interface VersionData {
  version: string;
  build: string;
  history: VersionEntry[];
}

export const VersionDisplay: React.FC<{ className?: string }> = ({ className }) => {
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Use a relative path and add a cache buster to prevent stale loads
    fetch('/version.json?t=' + Date.now())
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setVersionData(data))
      .catch(err => {
        console.error('Failed to load version history:', err);
        // Fallback to a minimal version object to avoid UI breakage
        setVersionData({
          version: '2.5.0',
          build: '20260225',
          history: []
        });
      });
  }, []);

  if (!versionData) return null;

  return (
    <>
      {/* Version Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`group flex items-center space-x-2 text-xs text-slate-400 hover:text-solutium-blue transition-colors ${className}`}
        title="Ver historial de cambios"
      >
        <GitCommit className="w-3 h-3" />
        <span className="font-mono">v{versionData.version}</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-100 px-1 rounded">
          Changelog
        </span>
      </button>

      {/* Changelog Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border border-slate-200">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-solutium-blue" />
                  Historial de Cambios
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Versión Actual: <span className="font-mono font-bold text-slate-700">v{versionData.version}</span>
                  <span className="mx-2">•</span>
                  Build: <span className="font-mono text-slate-400">{versionData.build}</span>
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {versionData.history?.map((entry, index) => (
                <div key={entry.version} className="relative pl-8 border-l-2 border-slate-100 last:border-0">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    index === 0 ? 'bg-solutium-blue' : 'bg-slate-300'
                  }`}></div>

                  <div className="mb-1 flex items-center justify-between">
                    <h4 className={`font-bold ${index === 0 ? 'text-solutium-blue' : 'text-slate-700'}`}>
                      v{entry.version}
                    </h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                      <Calendar className="w-3 h-3" />
                      {entry.date}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {entry.changes.map((change, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                        <span className="leading-relaxed">{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
