import React from 'react';
import { Icons } from '../constants';

export const DeploymentPanel: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-solutium-dark">Infraestructura & Despliegue</h3>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">Localhost Mode</span>
        </div>
        <p className="text-sm text-slate-500 mb-6">Configura los endpoints para el paso a producción y pruebas externas.</p>
        
        <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Staging Server</span>
                    <span className="text-[10px] text-slate-400">No configurado</span>
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="https://staging.solutium.app" className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">Set</button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">SSL Status</p>
                    <div className="flex items-center text-emerald-700">
                        <Icons.Plus className="w-3 h-3 mr-1" />
                        <span className="text-xs font-bold">Local Trust</span>
                    </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Webhooks</p>
                    <div className="flex items-center text-blue-700">
                        <Icons.Settings className="w-3 h-3 mr-1" />
                        <span className="text-xs font-bold">Tunnel Required</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
