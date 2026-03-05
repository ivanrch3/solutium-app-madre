import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { compareSemVer, VersionInfo, VersionStatus } from '../utils/versionUtils';
import { RefreshCw, Server, Clock, Download } from 'lucide-react';

interface AppVersionStatus {
    id: string;
    name: string;
    localVersion: string | null;
    status: VersionStatus;
    message?: string;
    lastSync?: string;
    updateType?: 'Feature' | 'Security' | 'Bugfix' | 'None';
    isUpdating?: boolean;
    updateProgress?: number;
}

export const VersionTrafficLight: React.FC = () => {
    const { t, user, availableApps } = useAuth();
    const [motherVersion, setMotherVersion] = useState<VersionInfo | null>(null);
    const [satelliteStatuses, setSatelliteStatuses] = useState<AppVersionStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastCheck, setLastCheck] = useState<string | null>(null);

    const allApps = useMemo(() => {
        return Array.from(
            new Map([...availableApps, ...(user?.customApps || [])].map(app => [app.id, app])).values()
        );
    }, [availableApps, user?.customApps]);

    const fetchVersion = async (url: string, appName: string): Promise<VersionInfo | null> => {
        try {
            // Allow empty string for Mother App, but block undefined/null
            if (url === undefined || url === null) return null;
            
            const cleanUrl = url.replace(/\/$/, '');
            const target = url === '' ? '/version.json' : `${cleanUrl}/version.json`;
            const finalUrl = url === '' ? `${target}?t=${Date.now()}` : target;

            console.log(`[TrafficLight] Checking ${appName} at: ${finalUrl}`);

            const res = await fetch(finalUrl);
            if (!res.ok) throw new Error('Status ' + res.status);
            return await res.json();
        } catch (e) {
            console.warn(`[TrafficLight] Failed to reach ${appName}:`, e);
            return null;
        }
    };

    const runCheck = async () => {
        setLoading(true);
        console.log('[TrafficLight] Starting health check for apps:', allApps.map(a => a.id));
        
        const mother = await fetchVersion('', 'Solutium Core');
        setMotherVersion(mother);

        if (!mother) {
            console.error('[TrafficLight] Could not load Mother App version.json');
            setLoading(false);
            return;
        }

        const results = await Promise.allSettled(
            allApps.map(async (app) => {
                const vInfo = await fetchVersion(app.url, app.name);
                
                let status: VersionStatus = 'offline';
                let message = t.statusUnreachable;
                let localVersion = null;
                let updateType: 'Feature' | 'Security' | 'Bugfix' | 'None' = 'None';

                if (vInfo) {
                    localVersion = vInfo.version;
                    const minVer = mother.compatibleSatellites?.minVersion || '0.0.0';
                    
                    if (compareSemVer(vInfo.version, minVer) < 0) {
                        status = 'incompatible';
                        message = `${t.statusIncompatible} (Min: ${minVer})`;
                        updateType = 'Feature'; // Real fallback
                    } else {
                        status = 'compatible';
                        message = t.statusOperational;
                    }
                } else {
                    message = t.statusUnreachable;
                }

                return {
                    id: app.id,
                    name: app.name,
                    localVersion,
                    status,
                    message,
                    lastSync: vInfo ? 'Reciente' : 'Desconocido',
                    updateType,
                    isUpdating: false,
                    updateProgress: 0
                };
            })
        );

        const statuses = results.map((res, index) => {
            if (res.status === 'fulfilled') return res.value;
            return {
                id: allApps[index].id,
                name: allApps[index].name,
                localVersion: null,
                status: 'offline' as VersionStatus,
                message: t.statusUnreachable,
                lastSync: 'Desconocido',
                updateType: 'None' as const,
                isUpdating: false,
                updateProgress: 0
            };
        });

        setSatelliteStatuses(statuses);
        setLastCheck(new Date().toLocaleTimeString());
        setLoading(false);
    };

    useEffect(() => {
        runCheck();
    }, []);

    const handleUpdateSatellite = (id: string) => {
        // Simulate OTA Update Process
        setSatelliteStatuses(prev => prev.map(sat => 
            sat.id === id ? { ...sat, isUpdating: true, updateProgress: 0 } : sat
        ));

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 20) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Finish update
                setTimeout(() => {
                    setSatelliteStatuses(prev => prev.map(sat => 
                        sat.id === id ? { 
                            ...sat, 
                            isUpdating: false, 
                            status: 'compatible', 
                            localVersion: motherVersion?.compatibleSatellites?.minVersion || '1.0.0',
                            updateType: 'None',
                            message: t.statusOperational,
                            lastSync: 'Hace 0 min'
                        } : sat
                    ));
                }, 500);
            }

            setSatelliteStatuses(prev => prev.map(sat => 
                sat.id === id ? { ...sat, updateProgress: progress } : sat
            ));
        }, 400);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-solutium-dark">Seguimiento de Apps Satélite</h3>
                    <p className="text-xs text-slate-500">{t.trafficLightDesc}</p>
                </div>
                <button 
                    onClick={runCheck} 
                    disabled={loading}
                    className={`p-2 rounded-full hover:bg-slate-200 transition-colors ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                </button>
            </div>

            <div className="p-6">
                {/* Mother Status */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-solutium-dark rounded-lg flex items-center justify-center text-white">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-800">Solutium Core ({t.trafficLightHost})</h4>
                            <div className="text-xs text-slate-500 font-mono">
                                v{motherVersion?.version || '---'} <span className="text-slate-300">|</span> Build {motherVersion?.build || '---'}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            HOST / CONTROL PLANE
                        </span>
                    </div>
                </div>

                {/* Satellites Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                <th className="px-3 py-3 font-semibold">Satélite</th>
                                <th className="px-3 py-3 font-semibold">Versión</th>
                                <th className="px-3 py-3 font-semibold">Última Sincronización</th>
                                <th className="px-3 py-3 font-semibold">Tipo Act.</th>
                                <th className="px-3 py-3 font-semibold text-right">Estado / Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {satelliteStatuses.map((sat) => (
                                <tr key={sat.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-3 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2.5 h-2.5 rounded-full shadow-sm shrink-0 ${
                                                sat.status === 'compatible' ? 'bg-emerald-500' :
                                                sat.status === 'incompatible' ? 'bg-amber-500 animate-pulse' :
                                                'bg-slate-300'
                                            }`}></div>
                                            <span className="font-bold text-sm text-slate-700">{sat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                                            {sat.localVersion ? `v${sat.localVersion}` : '---'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="flex items-center text-xs text-slate-500">
                                            <Clock className="w-3 h-3 mr-1.5 opacity-70" />
                                            {sat.lastSync}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4">
                                        {sat.updateType !== 'None' ? (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                                                sat.updateType === 'Security' ? 'bg-red-50 text-red-600 border-red-100' :
                                                sat.updateType === 'Feature' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {sat.updateType}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-4 text-right">
                                        {sat.isUpdating ? (
                                            <div className="flex flex-col items-end w-32 ml-auto">
                                                <div className="flex justify-between w-full text-[10px] text-slate-500 mb-1 font-bold">
                                                    <span>Actualizando (OTA)...</span>
                                                    <span>{sat.updateProgress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                        className="bg-solutium-blue h-1.5 rounded-full transition-all duration-300 ease-out" 
                                                        style={{ width: `${sat.updateProgress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ) : sat.status === 'incompatible' ? (
                                            <button 
                                                onClick={() => handleUpdateSatellite(sat.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-solutium-dark text-solutium-yellow hover:bg-black rounded-lg text-xs font-bold transition-colors shadow-sm"
                                            >
                                                <Download className="w-3 h-3 mr-1.5" />
                                                Forzar OTA
                                            </button>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <span className={`text-xs font-bold ${
                                                    sat.status === 'compatible' ? 'text-emerald-600' : 'text-slate-400'
                                                }`}>
                                                    {sat.status === 'compatible' ? t.statusCompatible : t.statusOffline}
                                                </span>
                                                <span className="text-[10px] text-slate-400 mt-0.5">{sat.message}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-slate-400 font-medium">
                        {t.trafficLightLastCheck} {lastCheck || 'Nunca'}
                    </p>
                </div>
            </div>
        </div>
    );
};
