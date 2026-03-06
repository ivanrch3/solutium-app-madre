import React from 'react';
import { ServiceApp, IconName } from '../../types';
import { Icons, APP_CATEGORIES } from '../../constants';
import { storageService } from '../../services/storageService';

interface AppCardProps {
  app: ServiceApp;
  isInstalled?: boolean;
  isAdmin?: boolean;
  onInstall: (appId: string) => void;
  onManage?: (app: ServiceApp) => void;
  onUnregister?: (appId: string) => void;
  onUninstall?: (appId: string) => void;
  t: any;
  view?: 'grid' | 'list';
}

export const AppCard: React.FC<AppCardProps> = ({ 
  app, 
  isInstalled = false, 
  isAdmin = false, 
  onInstall, 
  onManage, 
  onUnregister,
  onUninstall,
  t,
  view = 'grid'
}) => {
  const renderIcon = (icon: IconName | React.ReactNode) => {
    if (typeof icon === 'string') {
      const IconComp = Icons[icon as IconName] || Icons.Code;
      return <IconComp className="w-6 h-6" />;
    }
    if (!icon) {
      return <Icons.Code className="w-6 h-6" />;
    }
    return icon;
  };

  if (view === 'list') {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center hover:border-solutium-blue hover:shadow-md transition-all relative group ${isInstalled ? 'opacity-60 grayscale-[0.5]' : ''}`}>
        {isAdmin && app.isCustom && onUnregister && (
            <button 
              onClick={() => onUnregister(app.id)}
              className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title={t.delete}
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        )}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden shrink-0 mr-4 ${app.logoUrl ? 'bg-transparent' : (isInstalled ? 'bg-white text-slate-400 border border-slate-100 shadow-sm' : 'bg-slate-50 text-solutium-grey border border-slate-100 shadow-sm')}`}>
          {app.logoUrl ? (
            <img src={app.logoUrl} alt={app.name} className="w-full h-full object-contain p-1" />
          ) : (
            renderIcon(app.icon)
          )}
        </div>
        
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h4 className={`font-bold text-base truncate ${isInstalled ? 'text-slate-500' : 'text-solutium-dark'}`}>{app.name}</h4>
            {app.category && (
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider text-white shrink-0"
                style={{ backgroundColor: APP_CATEGORIES[app.category]?.dominant || '#777' }}
              >
                {app.category}
              </span>
            )}
            {app.tags?.map(tag => {
              const customTags = storageService.getCustomTags();
              const customTag = customTags.find((t: any) => t.id === tag);
              
              const colors: Record<string, string> = {
                beta: 'bg-yellow-100 text-yellow-800',
                coming_soon: 'bg-slate-100 text-slate-600',
                new: 'bg-green-100 text-green-800',
                maintenance: 'bg-red-100 text-red-800',
                pro: 'bg-indigo-100 text-indigo-800'
              };
              const labels: Record<string, string> = {
                beta: 'BETA',
                coming_soon: 'PRÓXIMAMENTE',
                new: 'NUEVA',
                maintenance: 'MANTENIMIENTO',
                pro: 'PREMIUM'
              };
              
              const colorClass = customTag ? customTag.color : (colors[tag] || 'bg-gray-100 text-gray-800');
              const labelText = customTag ? customTag.label : (labels[tag] || tag);

              return (
                <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${colorClass}`}>
                  {labelText}
                </span>
              );
            })}
          </div>
          <p className={`text-sm truncate ${isInstalled ? 'text-slate-400' : 'text-solutium-grey'}`}>
            {app.description}
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          {isInstalled ? (
            <>
              {onUninstall ? (
                <button 
                  onClick={() => onUninstall(app.id)}
                  className="py-2 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Icons.Trash className="w-4 h-4" />
                  {t.remove}
                </button>
              ) : (
                <button disabled className="py-2 px-4 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg font-medium cursor-default flex items-center justify-center gap-2 text-sm">
                  <Icons.Check className="w-4 h-4" />
                  {t.installed}
                </button>
              )}
              {isAdmin && onManage && (
                <button
                  onClick={() => onManage(app)}
                  className="px-3 py-2 border border-slate-200 text-slate-500 bg-white rounded-lg font-medium hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center justify-center shadow-sm"
                  title={t.manage}
                >
                  <Icons.Settings className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => onInstall(app.id)}
                disabled={app.status === 'coming_soon'}
                className="py-2 px-6 border border-solutium-blue text-solutium-blue rounded-lg font-medium hover:bg-solutium-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {t.add}
              </button>
              {isAdmin && onManage && (
                <button
                  onClick={() => onManage(app)}
                  className="px-3 py-2 border border-slate-200 text-slate-500 bg-white rounded-lg font-medium hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center justify-center shadow-sm"
                  title={t.manage}
                >
                  <Icons.Settings className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:border-solutium-blue hover:shadow-lg transition-all relative group ${isInstalled ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      {isAdmin && app.isCustom && onUnregister && (
          <button 
            onClick={() => onUnregister(app.id)}
            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title={t.delete}
          >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
      )}
      <div className="flex items-center space-x-4 mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${app.logoUrl ? 'bg-transparent' : (isInstalled ? 'bg-white text-slate-400 border border-slate-100 shadow-sm' : 'bg-slate-50 text-solutium-grey border border-slate-100 shadow-sm')}`}>
          {app.logoUrl ? (
            <img src={app.logoUrl} alt={app.name} className="w-full h-full object-contain p-1" />
          ) : (
            renderIcon(app.icon)
          )}
        </div>
        <div>
          <h4 className={`font-bold text-lg ${isInstalled ? 'text-slate-500' : 'text-solutium-dark'}`}>{app.name}</h4>
          <div className="flex gap-2 flex-wrap">
            {app.category && (
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider text-white"
                style={{ backgroundColor: APP_CATEGORIES[app.category]?.dominant || '#777' }}
              >
                {app.category}
              </span>
            )}
            {app.tags?.map(tag => {
              const customTags = storageService.getCustomTags();
              const customTag = customTags.find((t: any) => t.id === tag);

              const colors: Record<string, string> = {
                beta: 'bg-yellow-100 text-yellow-800',
                coming_soon: 'bg-slate-100 text-slate-600',
                new: 'bg-green-100 text-green-800',
                maintenance: 'bg-red-100 text-red-800',
                pro: 'bg-indigo-100 text-indigo-800'
              };
              const labels: Record<string, string> = {
                beta: 'BETA',
                coming_soon: 'PRÓXIMAMENTE',
                new: 'NUEVA',
                maintenance: 'MANTENIMIENTO',
                pro: 'PREMIUM'
              };

              const colorClass = customTag ? customTag.color : (colors[tag] || 'bg-gray-100 text-gray-800');
              const labelText = customTag ? customTag.label : (labels[tag] || tag);

              return (
                <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${colorClass}`}>
                  {labelText}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <p className={`text-sm flex-1 mb-6 leading-relaxed ${isInstalled ? 'text-slate-400' : 'text-solutium-grey'}`}>
        {app.description}
      </p>
      
      <div className="flex gap-2">
        {isInstalled ? (
          <>
            {onUninstall ? (
              <button 
                onClick={() => onUninstall(app.id)}
                className="flex-1 py-2 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Icons.Trash className="w-4 h-4" />
                {t.remove}
              </button>
            ) : (
              <button disabled className="flex-1 py-2 px-4 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg font-medium cursor-default flex items-center justify-center gap-2">
                <Icons.Check className="w-4 h-4" />
                {t.installed}
              </button>
            )}
            {isAdmin && onManage && (
              <button
                onClick={() => onManage(app)}
                className="px-4 py-2 border border-slate-200 text-slate-500 bg-white rounded-lg font-medium hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center justify-center shadow-sm"
                title={t.manage}
              >
                <Icons.Settings className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => onInstall(app.id)}
              disabled={app.status === 'coming_soon'}
              className="flex-1 py-2 px-4 border border-solutium-blue text-solutium-blue rounded-lg font-medium hover:bg-solutium-blue hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.add}
            </button>
            {isAdmin && onManage && (
              <button
                onClick={() => onManage(app)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center"
                title={t.manage}
              >
                <Icons.Settings className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
