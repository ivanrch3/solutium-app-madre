import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../constants';
import { ServiceApp } from '../types';
import { AppCardSkeleton, HeaderSkeleton } from '../components/SkeletonLoader';
import { TransmissionAgentModal } from '../components/TransmissionAgentModal';
import { encodeSolutiumToken, type SolutiumPayload } from '../utils/satelliteConnection';
import { RoadmapPanel } from '../components/RoadmapPanel';
import { AdminManager } from '../components/portfolio/AdminManager';
import { APP_ROADMAPS, USER_CHANGELOG } from '../services/roadmapData';
import { storageService } from '../services/storageService';
import { Tabs } from '../components/Tabs';
import Integrations from './Integrations';

const MyApps: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, currentProject, uninstallApp, unregisterCustomApp, t, customers, products, availableApps } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [activeTab, setActiveTab] = useState('apps');
  const [managingApp, setManagingApp] = useState<ServiceApp | null>(null);
  const [transmissionState, setTransmissionState] = useState<{isOpen: boolean, app: any, url: string, scopes: string[], windowRef: Window | null}>({isOpen: false, app: null, url: '', scopes: [], windowRef: null});
  
  const customApps = user?.customApps || [];
  const systemApps = availableApps.filter(sysApp => !customApps.some(customApp => customApp.id === sysApp.id));

  const allApps = [...systemApps, ...customApps].map(app => {
    const { logo } = storageService.getAppCustomizations(app.id);
    return logo ? { ...app, logoUrl: logo } : app;
  });
  const installedApps = allApps.filter(app => (currentProject?.installedAppIds || []).includes(app.id));

  const combinedRoadmap = installedApps.flatMap(app => APP_ROADMAPS[app.id] || []);
  
  useEffect(() => {
    setIsLoadingData(true);
    const timer = setTimeout(() => {
        setIsLoadingData(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentProject?.id]);

  const renderIcon = (icon: string | React.ReactNode) => {
      if (typeof icon === 'string') {
          // @ts-ignore
          const IconComp = Icons[icon] || Icons.Code;
          return <IconComp />;
      }
      if (!icon) {
          return <Icons.Code />;
      }
      return icon;
  };

  const handleLaunchApp = (app: ServiceApp) => {
    if (!user || !currentProject) return;

    const { customUrl, logo: customLogo, scopes: customScopes, enableBootObserver } = storageService.getAppCustomizations(app.id);
    const scopes = customScopes || ['profile', 'projectData'];

    const payload: SolutiumPayload = { 
      userId: user.id, 
      projectId: currentProject.id,
      role: user.role,
      timestamp: Date.now(),
      scopes: scopes,

      // 1. User Profile
      userProfile: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          language: user.language,
          role: user.role,
          preferences: {
              theme: user.activeTheme.includes('dark') ? 'dark' : 'light',
              density: 'comfortable'
          }
      },

      // 2. Team
      teamMembers: user.teamMembers?.map(m => ({
          name: m.name,
          email: m.email,
          role: m.role,
          avatarUrl: m.avatarUrl
      })) || [],

      // 3. Active Projects
      activeProjects: user.projects?.map(p => ({
          id: p.id,
          name: p.name
      })) || [],

      // 4. Business Config
      businessConfig: {
          industry: currentProject.industry,
          whatsapp: currentProject.whatsapp,
          website: currentProject.website,
          email: currentProject.email,
          address: currentProject.address,
          socials: currentProject.socials?.reduce((acc: any, s: any) => {
              acc[s.platform] = s.url;
              return acc;
          }, {})
      },

      // 5. Project Identity
      projectData: {
          name: currentProject.name,
          colors: currentProject.brandColors || ['#333', '#fff', '#ccc'],
          logoUrl: customLogo || app.logoUrl || currentProject.logoUrl || '',
          fontFamily: user.fontFamily || 'Inter',
          baseSize: user.baseSize || '16px',
          contact: {
              email: currentProject.email || '',
              phone: currentProject.whatsapp || '', 
              address: currentProject.address || ''
          }
      },

      // 6. CRM Data
      crmData: customers?.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          role: c.role,
          company: c.company,
          status: c.status,
          source: c.source,
          notes: c.notes
      })) || [],

      // 7. Products Data
      productsData: products?.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          type: p.type,
          unitCost: p.unitCost,
          code: p.code || p.sku,
          status: p.status === 'inactive' ? 'archived' : p.status,
          imageUrl: p.imageUrl
      })) || [],

      // 8. Calendar Config (Placeholder)
      calendarConfig: {
          enabled: false
      },

      // Legacy/Bridge Configs
      crmConfig: {
        apiUrl: window.location.origin,
        authToken: 'temp-session-token'
      },
      productsConfig: {
        apiUrl: window.location.origin,
        authToken: 'temp-session-token'
      },
      enableBootObserver: enableBootObserver ?? true,
    };
    
    const token = encodeSolutiumToken(payload);
    
    let baseUrl = app.url;
    if (customUrl) {
        baseUrl = customUrl;
    }
    
    const newWindow = window.open('about:blank', '_blank');
    
    try {
        const targetUrl = new URL(baseUrl);
        targetUrl.hash = `token=${token}`;
        
        console.log(`[SIP Sender] Preparando satélite hacia: ${targetUrl.origin}`);
        
        if (enableBootObserver ?? true) {
          setTransmissionState({
            isOpen: true,
            app: app,
            url: targetUrl.toString(),
            scopes: scopes,
            windowRef: newWindow
          });
        } else {
          if (newWindow) {
            newWindow.location.href = targetUrl.toString();
          }
        }
    } catch (e) {
        if (newWindow) newWindow.close();
        alert(`Error: La URL configurada no es válida: ${baseUrl}`);
    }
  };

  const executeSatelliteLaunch = () => {
    if (transmissionState.windowRef && transmissionState.url) {
      transmissionState.windowRef.location.href = transmissionState.url;
    }
  };

  const handleUninstall = (e: React.MouseEvent, appId: string) => {
      e.stopPropagation();
      if(window.confirm("Are you sure you want to remove this app from this project?")) {
          uninstallApp(appId);
      }
  };

  if (isLoadingData) {
      return (
          <div className="space-y-8">
              <HeaderSkeleton />
              <div className="pt-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <AppCardSkeleton />
                     <AppCardSkeleton />
                 </div>
              </div>
          </div>
      );
  }

  if (!currentProject) {
      return <div>Please create a project to continue.</div>;
  }

  if (managingApp) {
    return (
      <AdminManager 
        app={managingApp}
        onClose={() => setManagingApp(null)}
        onUpdateApp={(updated) => setManagingApp(updated)}
        onUnregister={unregisterCustomApp}
        t={t}
      />
    );
  }

  return (
    <div className="flex -m-4 md:-m-8 h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-6 animate-fadeIn">
        
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-solutium-dark">
            Mis Apps
          </h1>
          <p className="text-solutium-grey mt-2">
            Simplificación y automatización para la productividad en <span className="font-bold text-solutium-blue">{currentProject.name}</span>.
          </p>
        </div>

        <Tabs 
          options={[
            { id: 'apps', label: 'Apps' },
            { id: 'automations', label: 'Automatizaciones' },
            { id: 'integrations', label: 'Integraciones' }
          ]}
          activeTab={activeTab}
          onChange={(id: string) => setActiveTab(id)}
          style="primary"
          className="mb-8"
        />

        {activeTab === 'apps' && (
          <>
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                  <p className="text-solutium-grey mt-2 max-w-lg">Accede y gestiona las aplicaciones activas en este proyecto.</p>
              </div>
              {!showRoadmap && (
                <button 
                  onClick={() => setShowRoadmap(true)}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Ver Roadmap
                </button>
              )}
            </header>

            <hr className="border-solutium-border" />

            <div>
              {installedApps.length === 0 ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <h4 className="text-lg font-bold text-solutium-dark mb-1">{t.noApps}</h4>
                      <p className="text-solutium-grey mb-6 max-w-sm">{t.portfolioDesc}</p>
                      <button 
                          onClick={() => onNavigate('portfolio')}
                          className="px-6 py-2 bg-solutium-blue text-white rounded-lg font-medium hover:bg-solutium-dark transition-colors"
                      >
                          {t.portfolio}
                      </button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {installedApps.map((app) => (
                      <div key={app.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col border border-slate-100 group relative">
                          
                          <button 
                              onClick={(e) => handleUninstall(e, app.id)}
                              className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors z-10"
                              title={t.uninstall}
                          >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>

                          <div className="flex items-center space-x-4 mb-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${app.logoUrl ? 'bg-transparent' : 'bg-solutium-blue text-white shadow-md group-hover:bg-solutium-dark transition-colors'}`}>
                              {app.logoUrl ? (
                                  <img src={app.logoUrl} alt={app.name} className="w-full h-full object-contain p-1" />
                              ) : (
                                  renderIcon(app.icon)
                              )}
                              </div>
                              <div>
                              <h4 className="font-bold text-lg text-solutium-dark">{app.name}</h4>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{t.installed}</span>
                              </div>
                          </div>
                          <p className="text-solutium-grey text-sm flex-1 mb-6 leading-relaxed">
                              {app.description}
                          </p>
                          
                          <div className="flex gap-2 w-full">
                            <button
                                onClick={() => handleLaunchApp(app)}
                                className="flex-1 py-2.5 px-4 bg-solutium-dark text-white rounded-lg font-medium hover:bg-solutium-blue transition-colors flex items-center justify-center space-x-2 shadow-md"
                            >
                                <span>{t.open}</span>
                                <svg className="w-4 h-4 text-solutium-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </button>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => setManagingApp(app)}
                                className="px-3 py-2.5 border border-slate-200 text-slate-500 bg-white rounded-lg font-medium hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center justify-center shadow-sm"
                                title={t.manage}
                              >
                                <Icons.Settings className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                      </div>
                  ))}
                  
                  <button 
                      onClick={() => onNavigate('portfolio')}
                      className="rounded-xl border-2 border-dashed border-slate-200 hover:border-solutium-blue hover:bg-blue-50/30 transition-all p-6 flex flex-col items-center justify-center text-center h-full min-h-[250px] group"
                  >
                       <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-solutium-blue mb-4 group-hover:scale-110 transition-transform">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                       </div>
                       <h4 className="font-bold text-slate-700">{t.add}</h4>
                       <p className="text-sm text-slate-400 mt-2">{t.portfolioDesc}</p>
                  </button>
                  </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'automations' && (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Icons.Zap className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Automatizaciones</h3>
            <p className="text-slate-500 max-w-md mb-8">
              Crea flujos de trabajo automatizados entre tus aplicaciones conectadas. Próximamente.
            </p>
            <button className="px-6 py-3 bg-solutium-blue text-white rounded-xl font-bold opacity-50 cursor-not-allowed">
              Crear Nueva Automatización
            </button>
          </div>
        )}

        {activeTab === 'integrations' && (
          <Integrations hideHeader={true} />
        )}

      </div>

      <RoadmapPanel 
        title="Roadmap de Mis Apps"
        roadmap={combinedRoadmap}
        changelog={USER_CHANGELOG}
        isOpen={showRoadmap}
        onClose={() => setShowRoadmap(false)}
      />

      <TransmissionAgentModal 
        isOpen={transmissionState.isOpen}
        satelliteName={transmissionState.app?.name || 'Satélite'}
        scopes={transmissionState.scopes}
        onOpenWindow={executeSatelliteLaunch}
        onComplete={() => setTransmissionState({ isOpen: false, app: null, url: '', scopes: [], windowRef: null })}
        onCancel={() => {
          if (transmissionState.windowRef) transmissionState.windowRef.close();
          setTransmissionState({ isOpen: false, app: null, url: '', scopes: [], windowRef: null });
        }}
      />
    </div>
  );
};

export default MyApps;
