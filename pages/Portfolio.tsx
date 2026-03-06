import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ServiceApp } from '../types';
import { Input } from '../components/Input';
import { RoadmapPanel } from '../components/RoadmapPanel';
import { SatelliteFoundry } from '../components/SatelliteFoundry';
import { APP_ROADMAPS, USER_CHANGELOG } from '../services/roadmapData';
import { AppCard } from '../components/portfolio/AppCard';
import { AdminManager } from '../components/portfolio/AdminManager';
import { KitTable } from '../components/portfolio/KitTable';
import { storageService } from '../services/storageService';
import { ViewToggle } from '../components/ViewToggle';

import { Tabs } from '../components/Tabs';

const Portfolio: React.FC = () => {
  const { currentProject, installApp, uninstallApp, user, registerCustomApp, unregisterCustomApp, t, availableApps: dynamicApps } = useAuth();
  
  const [customUrl, setCustomUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [adminTab, setAdminTab] = useState<'apps' | 'new'>('apps');
  const [adminLifecycleTab, setAdminLifecycleTab] = useState<'active' | 'development' | 'inactive'>('active');
  const [managingApp, setManagingApp] = useState<ServiceApp | null>(null);
  const [generatedKits, setGeneratedKits] = useState<{ category: string; appName: string; devUrl: string }[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('portfolioViewMode') as 'grid' | 'list') || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('portfolioViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const storedKits = storageService.getGeneratedKits();
    if (storedKits.length > 0) {
      setGeneratedKits(storedKits);
    }

    // Auto-fill customUrl with example for local testing
    if (customUrl === '' && process.env.NODE_ENV === 'development') {
      setCustomUrl('http://localhost:3001');
    }
  }, []);

  const handleClearGeneratedKit = (indexToRemove: number) => {
    const updatedKits = generatedKits.filter((_, index) => index !== indexToRemove);
    setGeneratedKits(updatedKits);
    storageService.setGeneratedKits(updatedKits);
  };

  const handleCopyDevUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setUpdateTrigger(prev => prev + 1);
    };
    window.addEventListener('satellite-storage-update', handleStorageUpdate);
    return () => window.removeEventListener('satellite-storage-update', handleStorageUpdate);
  }, []);

  const isAdmin = user?.role === 'admin';
  
  const customApps = user?.customApps || [];
  // Filter out system apps that are overridden by custom apps (same ID)
  const systemApps = dynamicApps.filter(sysApp => !customApps.some(customApp => customApp.id === sysApp.id));
  
  const allApps = React.useMemo(() => [...systemApps, ...customApps].map(app => {
    const { logo, description, scopes, lifecycleStatus, sipEnabled } = storageService.getAppCustomizations(app.id);
    let newApp = { ...app };
    if (logo) newApp.logoUrl = logo;
    if (description) newApp.description = description;
    if (scopes) newApp.scopes = scopes;
    if (lifecycleStatus) newApp.lifecycleStatus = lifecycleStatus as any;
    newApp.sipEnabled = sipEnabled !== false;
    return newApp;
  }), [systemApps, customApps, updateTrigger]);
  
  const filteredByStatus = isAdmin 
    ? allApps 
    : allApps.filter(app => app.lifecycleStatus === 'active');

  const installedAppIds = currentProject?.installedAppIds || [];
  const availableApps = filteredByStatus.filter(app => !installedAppIds.includes(app.id));
  const installedApps = filteredByStatus.filter(app => installedAppIds.includes(app.id));

  const categories = ['All', 'Added', ...Array.from(new Set(allApps.filter(a => a.category).map(a => a.category as string)))];

  const displayedApps = activeCategory === 'Added'
    ? installedApps
    : (activeCategory === 'All' 
        ? availableApps 
        : availableApps.filter(app => app.category === activeCategory));

  const adminSections = [
    { id: 'active', title: t.lifecycleActive, apps: availableApps.filter(a => a.lifecycleStatus === 'active') },
    { id: 'dev', title: t.lifecycleDev, apps: availableApps.filter(a => a.lifecycleStatus === 'development') },
    { id: 'inactive', title: t.lifecycleInactive, apps: availableApps.filter(a => a.lifecycleStatus === 'inactive') }
  ];

  const combinedRoadmap = availableApps.flatMap(app => APP_ROADMAPS[app.id] || []);

  const handleInstall = (appId: string) => {
      installApp(appId);
  };

  const handleUninstall = (appId: string) => {
    if (window.confirm("¿Estás seguro de que quieres quitar esta aplicación de este proyecto?")) {
      uninstallApp(appId);
    }
  };

  const handleRegisterCustom = async () => {
      if (!customUrl) return;
      setIsFetching(true);
      setError(null);

      let cleanUrl = customUrl.replace(/\/$/, '');
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = `http://${cleanUrl}`;
      }

      try {
          const res = await fetch(`${cleanUrl}/manifest.json`);
          if (!res.ok) throw new Error('Failed to fetch manifest');
          
          const manifest = await res.json();
          
          // Validate manifest structure
          if (!manifest.id || !manifest.name || !manifest.url) {
            throw new Error('Invalid manifest structure. Missing id, name, or url.');
          }

          const newApp: ServiceApp = {
              id: manifest.id,
              name: manifest.name,
              description: manifest.description || 'No description provided.',
              icon: manifest.icon || 'Code',
              url: manifest.url,
              logoUrl: manifest.logoUrl || '',
              status: 'active',
              lifecycleStatus: manifest.lifecycleStatus || 'development',
              requiresPro: manifest.requiresPro || false,
              isCustom: true,
              category: manifest.category || 'Custom'
          };

          registerCustomApp(newApp);
          setCustomUrl('');
          setGeneratedKits([]);
          storageService.clearGeneratedKits();
          setError(null); // Clear any previous errors
      } catch (e: any) {
          console.error(e);
          // Check if it might be a mixed content / CORS issue
          if (e.message === 'Failed to fetch' && window.location.protocol === 'https:' && cleanUrl.startsWith('http://')) {
              setError('Error de conexión (Mixed Content). Si estás usando la URL de vista previa (HTTPS), tu navegador bloqueará las peticiones a localhost (HTTP). Por favor, usa la URL local (http://localhost:3000) para probar aplicaciones locales.');
          } else {
              setError(t.manifestError || 'Error al conectar. Verifica que la app esté corriendo y la URL sea correcta.');
          }
      } finally {
          setIsFetching(false);
      }
  };

  if (managingApp) {
    return (
      <AdminManager 
        app={managingApp}
        onClose={() => setManagingApp(null)}
        onUpdateApp={(updated) => setManagingApp(updated)}
        onUnregister={unregisterCustomApp}
        t={t}
        backLabel="Regresar a Tienda de Apps"
      />
    );
  }

  return (
    <div className="flex -m-4 md:-m-8 h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-8 animate-fadeIn">
        <header className="flex justify-between items-end">
          <div>
              <h2 className="text-3xl font-bold text-solutium-dark">{t.portfolioTitle}</h2>
              <p className="text-solutium-grey mt-2">
                  Simplifica las tareas en <span className="font-bold text-solutium-blue">{currentProject?.name}</span> agregando alguna de estas soluciones.
              </p>
          </div>
          <div className="flex items-center space-x-3">
            {!showRoadmap && (
              <button 
                onClick={() => setShowRoadmap(true)}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Ver Roadmap
              </button>
            )}
          </div>
        </header>

        {/* Tabs Section */}
        <div className="flex justify-between items-center mb-8">
          <Tabs 
            options={isAdmin ? [
              { id: 'apps', label: t.apps },
              { id: 'new', label: t.newApps }
            ] : categories.map(cat => ({ 
              id: cat, 
              label: cat === 'All' ? t.all : (cat === 'Added' ? t.added : cat) 
            }))}
            activeTab={isAdmin ? adminTab : activeCategory}
            onChange={(id: string) => isAdmin ? setAdminTab(id as any) : setActiveCategory(id)}
            style="primary"
            className="mb-0"
          />
          <ViewToggle view={viewMode} onChange={setViewMode} />
        </div>

        <div className="space-y-12">
          {isAdmin ? (
            adminTab === 'apps' ? (
              // Admin View: Lifecycle Sections with Sub-Tabs
              <div className="space-y-8">
                <Tabs 
                  options={adminSections.map(section => ({ 
                    id: section.id === 'dev' ? 'development' : section.id, 
                    label: section.title, 
                    count: section.apps.length 
                  }))}
                  activeTab={adminLifecycleTab}
                  onChange={(id: string) => setAdminLifecycleTab(id as any)}
                  style="secondary"
                />

                {adminSections.find(s => 
                  s.id === adminLifecycleTab || 
                  (s.id === 'dev' && adminLifecycleTab === 'development')
                )?.apps.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-400 italic">No hay aplicaciones en esta sección.</p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col space-y-4"}>
                    {adminSections.find(s => 
                      s.id === adminLifecycleTab || 
                      (s.id === 'dev' && adminLifecycleTab === 'development')
                    )?.apps.map(app => (
                      <AppCard 
                        key={app.id}
                        app={app}
                        isAdmin={isAdmin}
                        onInstall={handleInstall}
                        onManage={setManagingApp}
                        onUnregister={unregisterCustomApp}
                        t={t}
                        view={viewMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Admin View: New Applications / Custom Registration (Satellite Lab)
              <div className="space-y-8">
                <SatelliteFoundry 
                  customUrl={customUrl}
                  setCustomUrl={setCustomUrl}
                  handleRegisterCustom={handleRegisterCustom}
                  isFetching={isFetching}
                  error={error}
                  generatedKits={generatedKits}
                  handleCopyDevUrl={handleCopyDevUrl}
                  handleClearGeneratedKit={handleClearGeneratedKit}
                  KitTable={KitTable}
                  Input={Input}
                />
              </div>
            )
          ) : (
            // User View: Filtered Grid
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col space-y-4"}>
              {displayedApps.map(app => (
                <AppCard 
                  key={app.id}
                  app={app}
                  isInstalled={installedAppIds.includes(app.id)}
                  onInstall={handleInstall}
                  onUninstall={activeCategory === 'Added' ? handleUninstall : undefined}
                  t={t}
                  view={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <RoadmapPanel 
        title="Roadmap de Nuevas Apps"
        roadmap={combinedRoadmap}
        changelog={USER_CHANGELOG}
        isOpen={showRoadmap}
        onClose={() => setShowRoadmap(false)}
      />

      {/* Add Custom App Modal removed as it is now inline */}
    </div>
  );
};

export default Portfolio;
