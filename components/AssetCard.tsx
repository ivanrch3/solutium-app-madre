import React from 'react';
import { motion } from 'motion/react';
import { Clock, ExternalLink, Edit2, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { encodeSolutiumToken } from '../utils/satelliteConnection';
import { storageService } from '../services/storageService';

interface AssetCardProps {
  asset: any;
  index: number;
  viewMode: 'active' | 'archived';
  user: any;
  availableApps: any[];
  onEdit: (asset: any) => void;
  onArchive: (asset: any) => void;
  onRestore: (asset: any) => void;
  onDelete: (asset: any) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getIconForType: (appId: string) => React.ReactNode;
  getAppName: (appId: string) => string;
  formatDate: (timestamp: number) => string;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  index,
  viewMode,
  user,
  availableApps,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  getStatusColor,
  getStatusLabel,
  getIconForType,
  getAppName,
  formatDate
}) => {
  const handleOpen = () => {
    const app = [...availableApps, ...(user?.customApps || [])].find(a => a.id === asset.appId);
    if (app && user && asset.projectId) {
      const project = user.projects.find((p: any) => p.id === asset.projectId);
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-solutium-blue text-white shadow-md group-hover:bg-solutium-dark transition-colors rounded-lg flex items-center justify-center overflow-hidden">
          {getIconForType(asset.appId)}
        </div>
        <div>
          <h4 className="font-bold text-lg text-solutium-dark">{getAppName(asset.appId)}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(asset.status || 'draft')}`}>
            {getStatusLabel(asset.status || 'draft')}
          </span>
        </div>
      </div>
      
      <div className="mb-6 flex-1">
        <h4 className="text-base font-bold text-slate-900 mb-1">
          {asset.data?.name || asset.data?.version || 'Borrador sin nombre'}
        </h4>
        <p className="text-sm text-solutium-grey leading-relaxed line-clamp-2">
          {asset.data?.description || 'Sin descripción'}
        </p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {(asset.tags || []).map((tag: string, i: number) => (
            <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-100 mt-auto flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-700">{asset.author || user?.name || 'Sistema'}</span>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{formatDate(asset.updatedAt || asset.timestamp)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 w-full">
          <button 
            onClick={handleOpen}
            className="flex-1 py-2.5 px-4 bg-solutium-dark text-white rounded-lg font-medium hover:bg-solutium-blue transition-colors flex items-center justify-center space-x-2 shadow-md"
          >
            <span>Abrir</span>
            <ExternalLink className="w-4 h-4 text-solutium-yellow" />
          </button>
          
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-1 bg-white shadow-sm">
            <button 
              onClick={() => onEdit(asset)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-colors"
              title="Editar Metadatos"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {viewMode === 'active' ? (
              <button 
                onClick={() => onArchive(asset)}
                className="p-2 text-slate-500 hover:text-orange-500 hover:bg-slate-50 rounded-md transition-colors"
                title="Archivar"
              >
                <Archive className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => onRestore(asset)}
                className="p-2 text-slate-500 hover:text-green-500 hover:bg-slate-50 rounded-md transition-colors"
                title="Restaurar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => onDelete(asset)}
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-50 rounded-md transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
