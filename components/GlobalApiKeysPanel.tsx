import React, { useState } from 'react';
import { globalConfigService, GlobalConfig } from '../services/globalConfigService';
import { Key } from 'lucide-react';

export const GlobalApiKeysPanel: React.FC = () => {
  const [config, setConfig] = useState<GlobalConfig>(globalConfigService.getConfig());
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfig = (updates: Partial<GlobalConfig>) => {
    setIsSaving(true);
    const newConfig = globalConfigService.saveConfig(updates);
    setConfig(newConfig);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-600 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Key className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-solutium-dark">API Keys Globales</h3>
                <p className="text-sm text-slate-500">Credenciales maestras de infraestructura para servicios de terceros.</p>
            </div>
        </div>
        
        <div className="space-y-4 mt-6">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Google Client ID</label>
                <div className="flex gap-2">
                    <input 
                        type="password" 
                        value={config.googleClientId}
                        onChange={(e) => setConfig({...config, googleClientId: e.target.value})}
                        placeholder="000000000000-xxx.apps.googleusercontent.com" 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                    <button 
                        onClick={() => handleSaveConfig({ googleClientId: config.googleClientId })}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                    >
                        {isSaving ? '...' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">HubSpot API Key</label>
                <div className="flex gap-2">
                    <input 
                        type="password" 
                        value={config.hubspotApiKey}
                        onChange={(e) => setConfig({...config, hubspotApiKey: e.target.value})}
                        placeholder="pat-na1-xxxxxxxxxxxx" 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                    <button 
                        onClick={() => handleSaveConfig({ hubspotApiKey: config.hubspotApiKey })}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                    >
                        {isSaving ? '...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
