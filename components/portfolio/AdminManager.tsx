import React, { useState, useEffect } from 'react';
import { ServiceApp } from '../../types';
import { Icons } from '../../constants';
import { Button } from '../Button';
import { Input } from '../Input';
import { storageService } from '../../services/storageService';
import { useNotification } from '../../context/NotificationContext';
import { WebConstructorPreview } from './WebConstructorPreview';
import { encodeSolutiumToken, type SolutiumPayload } from '../../utils/satelliteConnection';
import { useAuth } from '../../context/AuthContext';

interface AdminManagerProps {
  app: ServiceApp;
  onClose: () => void;
  onUpdateApp: (updatedApp: ServiceApp) => void;
  onUnregister?: (appId: string) => void;
  t: any;
}

export const AdminManager: React.FC<AdminManagerProps> = ({ 
  app, 
  onClose, 
  onUpdateApp, 
  onUnregister,
  t 
}) => {
  const { showNotification } = useNotification();
  const { user, currentProject, customers, products } = useAuth();
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[System] Initializing handshake protocol...",
    "[System] Waiting for satellite response..."
  ]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [bootObserverEnabled, setBootObserverEnabled] = useState(true);

  useEffect(() => {
    checkConnection();
    const custom = storageService.getAppCustomizations(app.id);
    setBootObserverEnabled(custom.enableBootObserver ?? true);
  }, [app.url, app.id]);

  const handleLaunchApp = () => {
    if (!user || !currentProject) return;

    // --- PROTOCOLO S.I.P. (Solutium Integration Protocol) ---
    const { customUrl, logo: customLogo } = storageService.getAppCustomizations(app.id);
    const payload: SolutiumPayload = { 
      userId: user.id, 
      projectId: currentProject.id,
      role: user.role,
      timestamp: Date.now(),
      scopes: app.scopes || ['profile', 'project'],

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
      enableBootObserver: bootObserverEnabled ?? true,
    };
    
    const token = encodeSolutiumToken(payload);
    let baseUrl = customUrl || app.url;
    
    try {
        const targetUrl = new URL(baseUrl);
        targetUrl.hash = `token=${token}`;
        window.open(targetUrl.toString(), '_blank');
        setConsoleLogs(prev => [...prev, `[System] Launching satellite with payload...`]);
    } catch (e) {
        alert(`Error: Invalid URL: ${baseUrl}`);
    }
  };

  const checkConnection = async () => {
    setConnectionStatus('connecting');
    setConsoleLogs(prev => [...prev, `[System] Pinging ${app.url}...`]);
    
    try {
      // Check for Mixed Content issues (HTTPS parent -> HTTP child)
      if (window.location.protocol === 'https:' && app.url.startsWith('http://')) {
        setConsoleLogs(prev => [...prev, `[Warning] Mixed Content detected: HTTPS parent trying to access HTTP satellite.`]);
        setConsoleLogs(prev => [...prev, `[Tip] This might be blocked by the browser. Ensure you are running the Mother App locally or the Satellite via HTTPS.`]);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // Try to fetch manifest.json which should exist in public folder
      const response = await fetch(`${app.url}/manifest.json`, { 
          method: 'GET',
          signal: controller.signal,
          mode: 'cors'
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
          const data = await response.json();
          setConnectionStatus('connected');
          setConsoleLogs(prev => [
              ...prev, 
              `[Success] Heartbeat detected from '${data.name || app.id}'`,
              `[Info] Satellite version: ${data.version || 'v1.0.0'}`,
              `[Info] S.I.P. Secure Tunnel established.`,
              `[System] Ready for data sync.`
          ]);
      } else {
          throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setConsoleLogs(prev => [
          ...prev, 
          `[Error] Connection failed: ${error.message === 'Failed to fetch' ? 'Network Error (or CORS/Mixed Content)' : error.message}`,
          `[Warning] No heartbeat detected from '${app.id}'`,
          `[Tip] Check if satellite is running on ${app.url}`
      ]);
    }
  };

  const availableScopes = [
    { id: 'profile', label: t.scopeProfile },
    { id: 'crm', label: t.scopeCRM },
    { id: 'invoices', label: t.scopeInvoices },
    { id: 'calendar', label: t.scopeCalendar },
  ];

  const toggleScope = (id: string) => {
    const currentScopes = app.scopes || [];
    const newScopes = currentScopes.includes(id)
      ? currentScopes.filter(s => s !== id)
      : [...currentScopes, id];
    
    const updatedApp = { ...app, scopes: newScopes };
    onUpdateApp(updatedApp);
    storageService.setAppScopes(app.id, newScopes);
  };

  const handleDescriptionChange = (val: string) => {
    const updatedApp = { ...app, description: val };
    onUpdateApp(updatedApp);
    storageService.setAppDescription(app.id, val);
  };

  const handleLogoChange = (val: string) => {
    const updatedApp = { ...app, logoUrl: val };
    onUpdateApp(updatedApp);
    storageService.setAppLogo(app.id, val);
  };

  const handleStatusChange = (status: string) => {
    const updatedApp = { ...app, lifecycleStatus: status as any };
    onUpdateApp(updatedApp);
    storageService.setAppStatus(app.id, status);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        handleLogoChange(url);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBootObserverToggle = () => {
    const newValue = !bootObserverEnabled;
    setBootObserverEnabled(newValue);
    storageService.setAppBootObserver(app.id, newValue);
  };

  const isWebConstructor = app.id === 'web-constructor';

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      <header className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Icons.Grid className="w-6 h-6 text-slate-400" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-solutium-dark">Administrar: {app.name}</h2>
            <p className="text-solutium-grey">Configuración técnica y estadísticas de rendimiento.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
            {app.lifecycleStatus}
          </span>
          <Button variant="secondary" onClick={onClose}>
            Volver al Portafolio
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Configuración del Satélite</h3>
            <div className="space-y-6">
              <Input label="App ID" value={app.id} readOnly />
              <Input label="Endpoint URL" value={app.url} readOnly />
              <Input 
                  label="Descripción" 
                  value={app.description || ''} 
                  placeholder="Una breve descripción de la aplicación."
                  onChange={(e) => handleDescriptionChange(e.target.value)}
              />

              <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Permisos de Datos (Scopes)</label>
                  <p className="text-xs text-slate-500 mb-4">Selecciona a qué datos del proyecto puede acceder esta aplicación.</p>
                  <div className="grid grid-cols-2 gap-2">
                      {availableScopes.map(scope => (
                          <label key={scope.id} className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${(app.scopes || []).includes(scope.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                              <input 
                                  type="checkbox" 
                                  className="hidden" 
                                  checked={(app.scopes || []).includes(scope.id)}
                                  onChange={() => toggleScope(scope.id)}
                              />
                              <div className={`w-3 h-3 rounded-sm mr-2 flex items-center justify-center border ${(app.scopes || []).includes(scope.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                  {(app.scopes || []).includes(scope.id) && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className="text-[10px] font-bold">{scope.label}</span>
                          </label>
                      ))}
                  </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Experiencia de Arranque</label>
                  <p className="text-xs text-slate-500 mb-4">Controla cómo se muestra la transferencia de datos al abrir la aplicación.</p>
                  
                  <label className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all bg-white border-slate-200 hover:border-indigo-300">
                    <div>
                      <span className="block text-sm font-bold text-slate-800">Agente de Transmisión (Boot Observability)</span>
                      <span className="block text-xs text-slate-500 mt-1">Muestra una animación detallada de los datos que se están transfiriendo antes de abrir la app. Útil para depuración y transparencia.</span>
                    </div>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${bootObserverEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={bootObserverEnabled}
                        onChange={handleBootObserverToggle}
                      />
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${bootObserverEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </label>
              </div>

              <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-tight">Logo del Satélite</label>
                  <div className="flex gap-6 items-start">
                      <div className={`w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${app.logoUrl ? 'bg-transparent' : 'border-2 border-dashed border-slate-200 bg-slate-50'}`}>
                          {app.logoUrl ? (
                              <img src={app.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                          ) : (
                              <Icons.Code className="w-8 h-8 text-slate-300" />
                          )}
                      </div>
                      <div className="flex-1 space-y-3">
                          <Input 
                              label="URL del Logo" 
                              value={app.logoUrl || ''} 
                              placeholder="https://ejemplo.com/logo.png"
                              onChange={(e) => handleLogoChange(e.target.value)}
                          />
                          <div className="flex items-center">
                              <label className="cursor-pointer bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 text-xs font-bold hover:bg-slate-200 text-slate-600 transition-colors">
                                  Subir Imagen
                                  <input 
                                      type="file" 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={handleFileUpload} 
                                  />
                              </label>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="font-bold text-sm">Protocolo S.I.P. Activo</p>
                  <p className="text-xs text-slate-500">La comunicación segura está habilitada para este satélite.</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                      onClick={handleLaunchApp}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                   >
                      <Icons.ExternalLink className="w-3 h-3" />
                      Lanzar Satélite
                   </button>
                   <div className="w-12 h-6 bg-green-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Métricas de Uso</h3>
            <div className="h-48 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
              [ Gráfico de Actividad en Tiempo Real ]
            </div>
          </section>

          {isWebConstructor && (
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Prototipo: Constructor Web</h3>
                  <p className="text-sm text-slate-500">Paso 1: Canvas del Editor y Sistema de Módulos.</p>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase tracking-widest">En Desarrollo</span>
              </div>
              <WebConstructorPreview />
              
              {/* Debug Console for S.I.P. Connection */}
              <div className="mt-6 bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-hidden">
                <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
                  <span className="font-bold text-white">S.I.P. Debug Console</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setConsoleLogs([]);
                        checkConnection();
                      }}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] transition-colors"
                    >
                      Retry
                    </button>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${connectionStatus === 'connected' ? 'bg-green-900 text-green-200' : connectionStatus === 'error' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                      {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Disconnected' : 'Connecting...'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 h-32 overflow-y-auto custom-scrollbar">
                  {consoleLogs.map((log, i) => (
                    <p key={i} className={`${log.includes('[Error]') ? 'text-red-400' : log.includes('[Warning]') ? 'text-yellow-400' : log.includes('[Success]') ? 'text-green-400' : log.includes('[System]') ? 'opacity-50' : 'text-blue-400'}`}>
                      {log}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold mb-4">Acciones Críticas</h3>
            <div className="space-y-3">
              {app.lifecycleStatus === 'development' && (
                <button 
                  onClick={() => handleStatusChange('active')}
                  className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Promover a Producción (Activar)
                </button>
              )}
              {app.lifecycleStatus === 'active' && (
                <button 
                  onClick={() => handleStatusChange('inactive')}
                  className="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Mover a Inactivas (Mantenimiento)
                </button>
              )}
              {app.lifecycleStatus === 'inactive' && (
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleStatusChange('active')}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Reactivar
                  </button>
                  <button 
                    onClick={() => handleStatusChange('development')}
                    className="w-full py-2 bg-solutium-blue text-white rounded-lg text-sm font-medium hover:bg-solutium-dark transition-colors"
                  >
                    Mover a Beta
                  </button>
                </div>
              )}
              
              <div className="h-px bg-white/10 my-2"></div>
              
              <button 
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres reiniciar esta instancia? Se perderán las sesiones activas.')) {
                    showNotification('Instancia reiniciada con éxito', 'success');
                  }
                }}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                Reiniciar Instancia
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar esta aplicación del registro global? Esta acción no se puede deshacer.')) {
                    onUnregister && onUnregister(app.id);
                    onClose();
                  }
                }}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-sm font-medium transition-colors text-red-400"
              >
                Eliminar del Registro
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
