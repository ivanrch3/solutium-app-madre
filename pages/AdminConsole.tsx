import React from 'react';
import { useAuth } from '../context/AuthContext';
import { VersionTrafficLight } from '../components/VersionTrafficLight';
import { ExpandableDataMatrix } from '../components/ExpandableDataMatrix';
import { Icons } from '../constants';

const AdminConsole: React.FC<{ onNavigate: (tab: string) => void, hideHeader?: boolean }> = ({ onNavigate, hideHeader = false }) => {
  const { user, t } = useAuth();

  if (user?.role !== 'admin') {
    return <div className="text-red-600">Access Denied. Admin privileges required.</div>;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {!hideHeader && (
        <header className="border-b border-slate-200 pb-6 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-solutium-dark flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
              {t.adminTitle}
            </h2>
            <p className="text-solutium-grey mt-2">{t.adminDesc}</p>
          </div>
          <button 
            onClick={() => onNavigate('tech-roadmap')}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold text-sm shadow-md"
          >
            <Icons.Code className="w-4 h-4" />
            <span>{t.techRoadmap}</span>
          </button>
        </header>
      )}

      <div className="space-y-8">
        
        {/* 1. SEGUIMIENTO DE APPS SATÉLITES */}
        <div className="w-full">
            <VersionTrafficLight />
        </div>

        {/* 2. MATRIZ EXPANDIBLE (VISTA UNIFICADA) */}
        <div className="pt-8 border-t border-slate-200">
            <ExpandableDataMatrix />
        </div>

      </div>
    </div>
  );
};

export default AdminConsole;