import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tabs } from '../components/Tabs';
import AdminConsole from './AdminConsole';
import TechRoadmap from './TechRoadmap';
import { ConstitutionPanel } from '../components/ConstitutionPanel';
import { RolesPanel } from '../components/RolesPanel';
import { GlobalApiKeysPanel } from '../components/GlobalApiKeysPanel';
import { DeploymentPanel } from '../components/DeploymentPanel';

const Administration: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, t } = useAuth();
  const [activeTab, setActiveTab] = useState('console');

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM7 20h10a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acceso Restringido</h2>
        <p className="text-slate-500 mt-2 max-w-md">Esta sección es exclusiva para administradores de Solutium.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="border-b border-slate-200 pb-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-solutium-dark">
              {t.administration || 'Administración'}
            </h2>
            <p className="text-solutium-grey mt-2">Gestión global del ecosistema, métricas y configuración técnica.</p>
          </div>
        </div>
        
        <Tabs 
          options={[
            { id: 'console', label: 'Apps' },
            { id: 'deployment', label: 'Despliegue' },
            { id: 'tech-roadmap', label: t.techRoadmap || 'Mapa de Ruta' },
            { id: 'roles', label: t.rolesTab || 'Roles y Permisos' },
            { id: 'api-keys', label: 'API Keys Globales' },
            { id: 'constitution', label: t.constitutionTab || 'Constitución' }
          ]}
          activeTab={activeTab}
          onChange={(id: string) => setActiveTab(id)}
          style="primary"
          className="mt-6"
        />
      </header>

      <div className="animate-fadeIn">
        {activeTab === 'console' && <AdminConsole onNavigate={onNavigate} hideHeader={true} />}
        {activeTab === 'deployment' && <DeploymentPanel />}
        {activeTab === 'tech-roadmap' && <TechRoadmap />}
        {activeTab === 'roles' && <RolesPanel />}
        {activeTab === 'api-keys' && <GlobalApiKeysPanel />}
        {activeTab === 'constitution' && <ConstitutionPanel />}
      </div>
    </div>
  );
};

export default Administration;
