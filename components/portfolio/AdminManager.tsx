import React, { useState, useEffect } from 'react';
import { ServiceApp, TagDefinition } from '../../types';
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
  backLabel?: string;
}

export const AdminManager: React.FC<AdminManagerProps> = ({ 
  app, 
  onClose, 
  onUpdateApp, 
  onUnregister,
  backLabel
}) => {
  const { showNotification } = useNotification();
  const { user, currentProject, customers, products } = useAuth();
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[System] Initializing handshake protocol...",
    "[System] Waiting for satellite response..."
  ]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [bootObserverEnabled, setBootObserverEnabled] = useState(true);
  const [sipEnabled, setSipEnabled] = useState(true);
  const [customTags, setCustomTags] = useState<TagDefinition[]>([]);
  const [newTag, setNewTag] = useState({ label: '', desc: '', color: 'bg-slate-100 text-slate-600' });
  const [isAddingTag, setIsAddingTag] = useState(false);

  useEffect(() => {
    checkConnection();
    const loadCustomizations = () => {
      const custom = storageService.getAppCustomizations(app.id);
      setBootObserverEnabled(custom.enableBootObserver ?? true);
      setSipEnabled(custom.sipEnabled !== false);
    };
    
    loadCustomizations();
    setCustomTags(storageService.getCustomTags());

    // Listen for updates from other components (e.g. ExpandableDataMatrix)
    const handleStorageUpdate = () => loadCustomizations();
    window.addEventListener('satellite-storage-update', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('satellite-storage-update', handleStorageUpdate);
    };
  }, [app.url, app.id]);

  const handleAddTag = () => {
    if (!newTag.label) return;
    const tagId = newTag.label.toLowerCase().replace(/\s+/g, '_');
    const tag: TagDefinition = {
      id: tagId,
      label: newTag.label,
      desc: newTag.desc,
      color: newTag.color,
      isCustom: true
    };
    storageService.addCustomTag(tag);
    setCustomTags([...customTags, tag]);
    setNewTag({ label: '', desc: '', color: 'bg-slate-100 text-slate-600' });
    setIsAddingTag(false);
  };

  const handleDeleteTag = (tagId: string) => {
    if (window.confirm('¿Eliminar esta etiqueta personalizada?')) {
      storageService.removeCustomTag(tagId);
      setCustomTags(customTags.filter(t => t.id !== tagId));
      // Also remove from app if applied
      if ((app.tags || []).includes(tagId)) {
        const newTags = (app.tags || []).filter(t => t !== tagId);
        const updatedApp = { ...app, tags: newTags };
        onUpdateApp(updatedApp);
        storageService.setAppTags(app.id, newTags);
      }
    }
  };

  const defaultTags: TagDefinition[] = [
    { id: 'beta', label: 'Beta', desc: 'Versión de prueba, puede contener errores.', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'coming_soon', label: 'Próximamente', desc: 'Anuncio de lanzamiento futuro.', color: 'bg-slate-100 text-slate-600' },
    { id: 'new', label: 'Nueva', desc: 'Destaca lanzamientos recientes.', color: 'bg-green-100 text-green-800' },
    { id: 'maintenance', label: 'Mantenimiento', desc: 'Indica que la app está en reparación.', color: 'bg-red-100 text-red-800' },
    { id: 'pro', label: 'Premium', desc: 'Requiere suscripción avanzada.', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const allTags = [...defaultTags, ...customTags];

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

  const handleDescriptionChange = (val: string) => {
    const updatedApp = { ...app, description: val };
    onUpdateApp(updatedApp);
    storageService.setAppDescription(app.id, val);
    window.dispatchEvent(new Event('satellite-storage-update'));
  };

  const handleLogoChange = (val: string) => {
    const updatedApp = { ...app, logoUrl: val };
    onUpdateApp(updatedApp);
    storageService.setAppLogo(app.id, val);
    window.dispatchEvent(new Event('satellite-storage-update'));
  };

  const handleIsoChange = (val: string) => {
    const updatedApp = { ...app, isoUrl: val };
    onUpdateApp(updatedApp);
    storageService.setAppIso(app.id, val);
    window.dispatchEvent(new Event('satellite-storage-update'));
  };

  const handleFileRead = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStatusChange = (status: string) => {
    const updatedApp = { ...app, lifecycleStatus: status as any };
    onUpdateApp(updatedApp);
    storageService.setAppStatus(app.id, status);
    window.dispatchEvent(new Event('satellite-storage-update'));
  };

  const handleBootObserverToggle = () => {
    const newValue = !bootObserverEnabled;
    setBootObserverEnabled(newValue);
    storageService.setAppBootObserver(app.id, newValue);
    window.dispatchEvent(new Event('satellite-storage-update'));
  };

  const handleSipToggle = () => {
    const newValue = !sipEnabled;
    setSipEnabled(newValue);
    storageService.setAppSipEnabled(app.id, newValue);
    const updatedApp = { ...app, sipEnabled: newValue };
    onUpdateApp(updatedApp);
    
    // Dispatch event to notify other components (like ExpandableDataMatrix)
    window.dispatchEvent(new Event('satellite-storage-update'));
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
          <Button variant="secondary" onClick={onClose}>
            {backLabel || 'Volver al Portafolio'}
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
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Etiquetas de la Aplicación</label>
                  <p className="text-xs text-slate-500 mb-4">Gestiona las etiquetas visibles para esta aplicación.</p>
                  
                  <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 w-10"></th>
                          <th className="px-4 py-2">Etiqueta</th>
                          <th className="px-4 py-2">Descripción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {allTags.map(tag => (
                          <tr key={tag.id} className="hover:bg-white transition-colors">
                            <td className="px-4 py-3 text-center">
                              <input 
                                type="checkbox" 
                                checked={(app.tags || []).includes(tag.id)}
                                onChange={() => {
                                  const currentTags = app.tags || [];
                                  const newTags = currentTags.includes(tag.id)
                                    ? currentTags.filter(t => t !== tag.id)
                                    : [...currentTags, tag.id];
                                  const updatedApp = { ...app, tags: newTags };
                                  onUpdateApp(updatedApp);
                                  storageService.setAppTags(app.id, newTags);
                                }}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-3 font-medium">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${tag.color}`}>
                                {tag.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{tag.desc}</td>
                            <td className="px-4 py-3 text-center">
                              {tag.isCustom && (
                                <button 
                                  onClick={() => handleDeleteTag(tag.id)}
                                  className="text-slate-400 hover:text-red-500 transition-colors"
                                  title="Eliminar etiqueta"
                                >
                                  <Icons.Trash className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="p-3 bg-slate-50 border-t border-slate-200">
                      {!isAddingTag ? (
                        <button 
                          onClick={() => setIsAddingTag(true)}
                          className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-xs font-bold hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Icons.Plus className="w-4 h-4" />
                          Crear Nueva Etiqueta
                        </button>
                      ) : (
                        <div className="space-y-3 p-2 bg-white rounded border border-slate-200 animate-fadeIn">
                          <div className="grid grid-cols-2 gap-3">
                            <Input 
                              label="Nombre" 
                              value={newTag.label} 
                              onChange={(e) => setNewTag({...newTag, label: e.target.value})}
                              placeholder="Ej: Oferta"
                              className="text-xs"
                            />
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
                              <select 
                                value={newTag.color}
                                onChange={(e) => setNewTag({...newTag, color: e.target.value})}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              >
                                <option value="bg-slate-100 text-slate-600">Gris (Default)</option>
                                <option value="bg-red-100 text-red-800">Rojo (Alerta)</option>
                                <option value="bg-yellow-100 text-yellow-800">Amarillo (Warning)</option>
                                <option value="bg-green-100 text-green-800">Verde (Success)</option>
                                <option value="bg-blue-100 text-blue-800">Azul (Info)</option>
                                <option value="bg-indigo-100 text-indigo-800">Indigo (Pro)</option>
                                <option value="bg-purple-100 text-purple-800">Púrpura (Special)</option>
                                <option value="bg-pink-100 text-pink-800">Rosa (Fun)</option>
                              </select>
                            </div>
                          </div>
                          <Input 
                            label="Descripción" 
                            value={newTag.desc} 
                            onChange={(e) => setNewTag({...newTag, desc: e.target.value})}
                            placeholder="Breve descripción para uso interno"
                            className="text-xs"
                          />
                          <div className="flex justify-end gap-2 pt-2">
                            <button 
                              onClick={() => setIsAddingTag(false)}
                              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                            >
                              Cancelar
                            </button>
                            <button 
                              onClick={handleAddTag}
                              disabled={!newTag.label}
                              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                              Guardar Etiqueta
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                  <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-tight">Identidad Visual del Satélite</label>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {/* Imagotipo (Logo + Texto) - 2:1 Relation */}
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider">Imagotipo</label>
                            <p className="text-[10px] text-slate-500 max-w-[200px]">Versión completa (Logo + Nombre). Se usa en el panel expandido.</p>
                          </div>
                          <div className={`w-32 aspect-[2/1] rounded-lg flex items-center justify-center overflow-hidden shadow-sm border ${app.logoUrl ? 'bg-white border-slate-200' : 'border-2 border-dashed border-slate-200 bg-slate-100'}`}>
                              {app.logoUrl ? (
                                  <img src={app.logoUrl} alt="Imagotipo" className="w-full h-full object-contain p-2" />
                              ) : (
                                  <div className="flex flex-col items-center opacity-20">
                                    <Icons.Code className="w-5 h-5" />
                                    <span className="text-[8px] font-bold mt-1">2:1</span>
                                  </div>
                              )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">URL del Imagotipo</span>
                            <Input 
                                label="" 
                                value={app.logoUrl || ''} 
                                placeholder="https://..."
                                onChange={(e) => handleLogoChange(e.target.value)}
                                className="text-xs h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Subir Archivo</span>
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileRead(file, handleLogoChange);
                                }}
                              />
                              <div className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all text-xs font-bold text-slate-500 h-9">
                                <Icons.Upload className="w-3.5 h-3.5" />
                                Cargar Imagen
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>

                    {/* Isotipo (Solo Icono) - 1:1 Relation */}
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider">Isotipo</label>
                            <p className="text-[10px] text-slate-500 max-w-[200px]">Solo el icono. Se usa en el panel contraído y como favicon.</p>
                          </div>
                          <div className={`w-16 aspect-square rounded-lg flex items-center justify-center overflow-hidden shadow-sm border ${app.isoUrl ? 'bg-white border-slate-200' : 'border-2 border-dashed border-slate-200 bg-slate-100'}`}>
                              {app.isoUrl ? (
                                  <img src={app.isoUrl} alt="Isotipo" className="w-full h-full object-contain p-2" />
                              ) : (
                                  <div className="flex flex-col items-center opacity-20">
                                    <Icons.Box className="w-5 h-5" />
                                    <span className="text-[8px] font-bold mt-1">1:1</span>
                                  </div>
                              )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">URL del Isotipo</span>
                            <Input 
                                label="" 
                                value={app.isoUrl || ''} 
                                placeholder="https://..."
                                onChange={(e) => handleIsoChange(e.target.value)}
                                className="text-xs h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Subir Archivo</span>
                            <div className="relative">
                              <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileRead(file, handleIsoChange);
                                }}
                              />
                              <div className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all text-xs font-bold text-slate-500 h-9">
                                <Icons.Upload className="w-3.5 h-3.5" />
                                Cargar Icono
                              </div>
                            </div>
                          </div>
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
                   
                   <label className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${sipEnabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={sipEnabled}
                        onChange={handleSipToggle}
                      />
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sipEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                   </label>
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
