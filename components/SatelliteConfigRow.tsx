import React, { useState } from 'react';
import { ServiceApp } from '../types';

interface SatelliteConfigRowProps {
    app: ServiceApp;
    _onRunDiagnostics?: (id: string) => void;
}

export const SatelliteConfigRow: React.FC<SatelliteConfigRowProps> = ({ app }) => {
    const storageKey = `solutium_satellite_url_${app.id}`;
    
    // Initialize state from localStorage or default
    const [currentUrl, setCurrentUrl] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(storageKey) || app.url;
        }
        return app.url;
    });
    
    const [isModified, setIsModified] = useState(false);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentUrl(e.target.value);
        setIsModified(true);
    };

    const handleSave = () => {
        localStorage.setItem(storageKey, currentUrl);
        setIsModified(false);
        alert(`Configuration saved for ${app.name}`);
    };

    const handleReset = () => {
        localStorage.removeItem(storageKey);
        setCurrentUrl(app.url);
        setIsModified(false);
    };

    return (
        <tr className="border-b border-slate-100">
            <td className="p-2 font-bold align-middle">
                <div className="flex items-center space-x-2">
                    <span className="text-solutium-blue">{app.icon}</span>
                    <span>{app.name}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{app.id}</div>
            </td>
            <td className="p-2 align-middle">
                <input 
                    type="text" 
                    value={currentUrl}
                    onChange={handleUrlChange}
                    className={`w-full text-xs border rounded px-2 py-1.5 font-mono ${
                        isModified ? 'border-amber-400 bg-amber-50' : 'border-slate-300'
                    } focus:border-solutium-blue focus:ring-1 focus:ring-solutium-blue outline-none transition-colors`}
                />
            </td>
            <td className="p-2 align-middle">
                <div className="flex space-x-1">
                    <button 
                        onClick={handleSave}
                        disabled={!isModified}
                        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                            isModified 
                                ? 'bg-solutium-blue text-white hover:bg-solutium-dark' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Save
                    </button>
                    <button 
                        onClick={handleReset}
                        title="Reset to Default"
                        className="px-2 py-1 rounded text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        ↺
                    </button>
                </div>
            </td>
        </tr>
    );
};
