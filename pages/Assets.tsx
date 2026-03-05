import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, ExternalLink, Trash2, Layout, Code, Store, Edit2, X, Users, Archive, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { encodeSolutiumToken } from '../utils/satelliteConnection';

const MOCK_ASSETS = [
  {
    projectId: 'demo-project',
    appId: 'web-constructor',
    timestamp: Date.now() - 86400000 * 15, // 15 days ago
    updatedAt: Date.now() - 86400000 * 1, // 1 day ago
    data: { version: 'Landing Page - Promoción Primavera', description: 'Diseño principal para la campaña de primavera.' },
    status: 'published',
    author: 'Juan Pérez',
    tags: ['Campaña', 'Diseño UI']
  },
  {
    projectId: 'demo-project',
    appId: 'invoicer',
    timestamp: Date.now() - 86400000 * 40, // 40 days ago
    updatedAt: Date.now() - 86400000 * 2, // 2 days ago
    data: { version: 'Plantilla Factura B2B Internacional', description: 'Plantilla con impuestos internacionales.' },
    status: 'draft',
    author: 'Ana Gómez',
    tags: ['Plantilla', 'Finanzas']
  },
  {
    projectId: 'demo-project',
    appId: 'crm',
    timestamp: Date.now() - 86400000 * 0, // Today
    updatedAt: Date.now() - 86400000 * 0, // Today
    data: { version: 'Segmento: Clientes VIP 2025', description: 'Lista de clientes con compras > $10k.' },
    status: 'archived',
    author: 'Carlos Ruiz',
    tags: ['Base de datos']
  }
];

const Assets = () => {
  const { user, currentProject, customers, products, availableApps } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [originalAsset, setOriginalAsset] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');

  useEffect(() => {
    const loadAssets = () => {
      if (!currentProject) {
        setAssets([]);
        return;
      }

      const projectId = currentProject.id;
      const allAssets = storageService.getAllAssets([projectId]);
      
      // Filter mock assets too
      const filteredMockAssets = MOCK_ASSETS.filter(ma => ma.projectId === projectId);
      
      if (allAssets.length === 0) {
        setAssets(filteredMockAssets);
      } else {
        setAssets(allAssets);
      }
    };

    loadAssets();
    const interval = setInterval(loadAssets, 5000);
    return () => clearInterval(interval);
  }, [user, currentProject]);

  const displayedAssets = assets.filter(asset => 
    viewMode === 'active' ? asset.status !== 'archived' : asset.status === 'archived'
  );

  const getIconForType = (type: string) => {
    if (type?.includes('web') || type?.includes('constructor')) return <Layout className="w-5 h-5 text-blue-500" />;
    if (type?.includes('code')) return <Code className="w-5 h-5 text-purple-500" />;
    if (type?.includes('store')) return <Store className="w-5 h-5 text-emerald-500" />;
    if (type?.includes('crm')) return <Users className="w-5 h-5 text-orange-500" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  const getAppName = (id: string) => {
    if (!id || id === 'unknown-app') return 'App Externa';
    if (id === 'web-constructor') return 'Constructor Web';
    if (id === 'invoicer') return 'Facturación';
    if (id === 'crm') return 'CRM Clientes';
    return id;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + 
           new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'archived': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // draft
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'archived': return 'Archivado';
      default: return 'Borrador';
    }
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAsset && originalAsset) {
      // If project changed, delete the old entry first
      if (editingAsset.projectId !== originalAsset.projectId) {
        storageService.deleteSatelliteData(originalAsset.projectId, originalAsset.appId);
      }
      
      // Save the new/updated asset
      // We extract data and metadata from editingAsset
      const { projectId, appId, data, ...metadata } = editingAsset;
      
      // Update timestamp to now
      const newTimestamp = Date.now();
      
      // Save to storage
      storageService.saveSatelliteData(projectId, appId, data, {
        ...metadata,
        updatedAt: newTimestamp
      });
      
      // Update local state immediately
      const updatedAsset = { ...editingAsset, updatedAt: newTimestamp, timestamp: newTimestamp };
      
      setAssets(prev => {
        // Remove the old asset from the list
        const filtered = prev.filter(a => 
          !(a.projectId === originalAsset.projectId && a.appId === originalAsset.appId)
        );
        // Add the updated asset
        return [updatedAsset, ...filtered].sort((a, b) => b.timestamp - a.timestamp);
      });
      
      setEditingAsset(null);
      setOriginalAsset(null);
    }
  };

  const handleArchive = (asset: any) => {
    if (window.confirm('¿Deseas archivar este activo?')) {
      const { projectId, appId, data, ...metadata } = asset;
      const newTimestamp = Date.now();
      
      storageService.saveSatelliteData(projectId, appId, data, {
        ...metadata,
        status: 'archived',
        updatedAt: newTimestamp
      });
      
      setAssets(assets.map(a => 
        (a.projectId === projectId && a.appId === appId) 
          ? { ...a, status: 'archived', updatedAt: newTimestamp } 
          : a
      ));
    }
  };

  const handleRestore = (asset: any) => {
    if (window.confirm('¿Deseas restaurar este activo?')) {
      const { projectId, appId, data, ...metadata } = asset;
      const newTimestamp = Date.now();
      
      storageService.saveSatelliteData(projectId, appId, data, {
        ...metadata,
        status: 'draft', // Restore as draft by default
        updatedAt: newTimestamp
      });
      
      setAssets(assets.map(a => 
        (a.projectId === projectId && a.appId === appId) 
          ? { ...a, status: 'draft', updatedAt: newTimestamp } 
          : a
      ));
    }
  };

  const handleDelete = (asset: any) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este activo permanentemente? Esta acción no se puede deshacer.')) {
      storageService.deleteSatelliteData(asset.projectId, asset.appId);
      setAssets(assets.filter(a => !(a.projectId === asset.projectId && a.appId === asset.appId)));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Activos Digitales</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Recursos generados por tus Apps</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-100 p-1 rounded-lg flex text-sm font-medium">
            <button 
              onClick={() => setViewMode('active')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'active' ? 'bg-white text-solutium-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Activos
            </button>
            <button 
              onClick={() => setViewMode('archived')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'archived' ? 'bg-white text-solutium-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Archivo
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            Total: {displayedAssets.length}
          </div>
        </div>
      </div>

      {displayedAssets.length === 0 ? (
        <div className="text-center py-16 md:py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          {viewMode === 'active' ? (
            <>
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No hay activos activos</h3>
              <p className="text-slate-500 mt-1 text-sm md:text-base">Guarda un borrador desde cualquier app para verlo aquí.</p>
            </>
          ) : (
            <>
              <Archive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">El archivo está vacío</h3>
              <p className="text-slate-500 mt-1 text-sm md:text-base">Los activos archivados aparecerán aquí.</p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop/Tablet View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-bold">App Origen</th>
                    <th className="px-6 py-4 font-bold">Nombre del Activo</th>
                    <th className="px-6 py-4 font-bold">Estado</th>
                    <th className="px-6 py-4 font-bold">Etiquetas</th>
                    <th className="px-6 py-4 font-bold">Autor</th>
                    <th className="px-6 py-4 font-bold">Fechas</th>
                    <th className="px-6 py-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedAssets.map((asset, index) => (
                    <motion.tr
                      key={`${asset.projectId}-${asset.appId}-${asset.timestamp}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            {getIconForType(asset.appId)}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{getAppName(asset.appId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900 block mb-1">
                          {asset.data?.name || asset.data?.version || 'Borrador sin nombre'}
                        </span>
                        <span className="text-xs text-slate-500 line-clamp-1">
                          {asset.data?.description || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(asset.status || 'draft')}`}>
                          {getStatusLabel(asset.status || 'draft')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(asset.tags || []).map((tag: string, i: number) => (
                            <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {(!asset.tags || asset.tags.length === 0) && <span className="text-xs text-slate-400">-</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{asset.author || user?.name || 'Sistema'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5" title="Creado">
                            <Clock className="w-3 h-3" />
                            {formatDate(asset.timestamp)}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400" title="Modificado">
                            <Edit2 className="w-3 h-3" />
                            {formatDate(asset.updatedAt || asset.timestamp)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {viewMode === 'active' ? (
                            <>
                              <button 
                                onClick={() => {
                                  const app = [...availableApps, ...(user?.customApps || [])].find(a => a.id === asset.appId);
                                  if (app && user && asset.projectId) {
                                    // Find the project for this asset
                                    const project = user.projects.find(p => p.id === asset.projectId);
                                    if (project) {
                                      const { customUrl, logo: customLogo, enableBootObserver } = storageService.getAppCustomizations(app.id);

                                      const payload: any = { 
                                        userId: user.id, 
                                        projectId: project.id,
                                        role: user.role,
                                        timestamp: Date.now(),
                                        scopes: ['profile', 'project', 'crm', 'products', 'assets'],

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
                                            industry: project.industry,
                                            whatsapp: project.whatsapp,
                                            website: project.website,
                                            email: project.email,
                                            address: project.address,
                                            socials: project.socials?.reduce((acc: any, s: any) => {
                                                acc[s.platform] = s.url;
                                                return acc;
                                            }, {})
                                        },

                                        // 5. Project Identity
                                        projectData: {
                                            name: project.name,
                                            colors: project.brandColors || ['#333', '#fff', '#ccc'],
                                            logoUrl: customLogo || app.logoUrl || project.logoUrl || '',
                                            fontFamily: user.fontFamily || 'Inter',
                                            baseSize: user.baseSize || '16px',
                                            contact: {
                                                email: project.email || '',
                                                phone: project.whatsapp || '', 
                                                address: project.address || ''
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

                                        // 9. Current Asset
                                        currentAsset: {
                                            id: asset.appId,
                                            name: asset.data?.name || asset.data?.version || 'Asset',
                                            type: asset.appId,
                                            url: '',
                                            originApp: getAppName(asset.appId),
                                            author: asset.author || user.name,
                                            status: asset.status,
                                            tags: asset.tags || [],
                                            createdAt: new Date(asset.timestamp).toISOString(),
                                            editedAt: new Date(asset.updatedAt || asset.timestamp).toISOString(),
                                            metadata: asset.data || {}
                                        },

                                        // Legacy/Bridge Configs
                                        initialData: asset.data,
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
                                      
                                      const targetUrl = new URL(baseUrl);
                                      targetUrl.hash = `token=${token}`;
                                      
                                      window.open(targetUrl.toString(), '_blank');
                                    }
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-solutium-blue hover:bg-blue-50 rounded-md transition-colors" 
                                title="Abrir en App"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingAsset({...asset});
                                  setOriginalAsset(asset);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Editar Metadatos"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleArchive(asset)}
                                className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors" title="Archivar"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(asset)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleRestore(asset)}
                                className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors" title="Restaurar"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(asset)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Eliminar Permanentemente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {displayedAssets.map((asset, index) => (
              <motion.div
                key={`${asset.projectId}-${asset.appId}-${asset.timestamp}-mobile`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      {getIconForType(asset.appId)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 block">{getAppName(asset.appId)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${getStatusColor(asset.status || 'draft')}`}>
                        {getStatusLabel(asset.status || 'draft')}
                      </span>
                      <span className="text-xs font-bold text-slate-900 block mt-1">
                        {asset.data?.name || asset.data?.version || 'Borrador sin nombre'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {viewMode === 'active' ? (
                      <>
                        <button 
                          onClick={() => {
                            const app = [...availableApps, ...(user?.customApps || [])].find(a => a.id === asset.appId);
                            if (app && user && asset.projectId) {
                              // Find the project for this asset
                              const project = user.projects.find(p => p.id === asset.projectId);
                              if (project) {
                                const { customUrl, logo: customLogo, enableBootObserver } = storageService.getAppCustomizations(app.id);

                                const payload: any = { 
                                  userId: user.id, 
                                  projectId: project.id,
                                  role: user.role,
                                  projectData: {
                                      name: project.name,
                                      colors: project.brandColors || ['#333', '#fff', '#ccc'],
                                      logoUrl: customLogo || app.logoUrl || project.logoUrl || '',
                                      fontFamily: user.fontFamily || 'Inter',
                                      baseSize: user.baseSize || '16px',
                                      contact: {
                                          email: project.email || '',
                                          phone: project.whatsapp || '', 
                                          address: project.address || ''
                                      }
                                  },
                                  // Inject the asset data to be opened
                                  initialData: asset.data,
                                  crmConfig: {
                                    apiUrl: window.location.origin,
                                    authToken: 'temp-session-token'
                                  },
                                  productsConfig: {
                                    apiUrl: window.location.origin,
                                    authToken: 'temp-session-token'
                                  },
                                  enableBootObserver: enableBootObserver ?? true,
                                  timestamp: Date.now()
                                };
                                
                                const token = encodeSolutiumToken(payload);
                                
                                let baseUrl = app.url;
                                if (customUrl) {
                                    baseUrl = customUrl;
                                }
                                
                                const targetUrl = new URL(baseUrl);
                                targetUrl.hash = `token=${token}`;
                                
                                window.open(targetUrl.toString(), '_blank');
                              }
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-solutium-blue hover:bg-blue-50 rounded-md transition-colors" 
                          title="Abrir en App"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingAsset({...asset});
                            setOriginalAsset(asset);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Editar Metadatos"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleArchive(asset)}
                          className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors" title="Archivar"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(asset)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleRestore(asset)}
                          className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors" title="Restaurar"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(asset)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Eliminar Permanentemente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-sm font-bold text-slate-900 block mb-1">
                    {asset.data?.version || 'Borrador sin nombre'}
                  </span>
                  <span className="text-xs text-slate-500 line-clamp-2">
                    {asset.data?.description || ''}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {(asset.tags || []).map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(asset.timestamp)}
                  </div>
                  <span className="text-slate-600">{asset.author || user?.name || 'Sistema'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Edit Metadata Modal */}
      <AnimatePresence>
        {editingAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Editar Metadatos</h3>
                <button 
                  onClick={() => setEditingAsset(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSaveMetadata} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Activo</label>
                  <input 
                    type="text" 
                    value={editingAsset.data?.version || ''}
                    onChange={(e) => setEditingAsset({...editingAsset, data: {...editingAsset.data, version: e.target.value}})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solutium-blue outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea 
                    value={editingAsset.data?.description || ''}
                    onChange={(e) => setEditingAsset({...editingAsset, data: {...editingAsset.data, description: e.target.value}})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solutium-blue outline-none resize-none h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                    <select 
                      value={editingAsset.status || 'draft'}
                      onChange={(e) => setEditingAsset({...editingAsset, status: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solutium-blue outline-none"
                    >
                      <option value="draft">Borrador</option>
                      <option value="published">Publicado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
                    <select 
                      value={editingAsset.projectId || ''}
                      onChange={(e) => setEditingAsset({...editingAsset, projectId: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solutium-blue outline-none"
                    >
                      <option value="demo-project">Proyecto Demo</option>
                      {user?.projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Etiquetas (separadas por coma)</label>
                  <input 
                    type="text" 
                    value={(editingAsset.tags || []).join(', ')}
                    onChange={(e) => setEditingAsset({...editingAsset, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solutium-blue outline-none"
                    placeholder="Ej: Finanzas, Urgente"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingAsset(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm font-bold text-white bg-solutium-blue hover:bg-solutium-dark rounded-lg transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Assets;
