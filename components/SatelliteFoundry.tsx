import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateStarterKit, generateContextOnly, generatePrompt, LATEST_SDK_CODE } from '../utils/starterKitGenerator';
import { saveAs } from 'file-saver';
import { APP_CATEGORIES } from '../constants';
import { Button } from './Button';
import { Tabs } from './Tabs';
import { Copy, Check, Download, RefreshCw, Code, Trash2 } from 'lucide-react';

interface SatelliteFoundryProps {
    customUrl?: string;
    setCustomUrl?: (val: string) => void;
    handleRegisterCustom?: () => void;
    isFetching?: boolean;
    error?: string | null;
    generatedKits?: any[];
    handleCopyDevUrl?: (url: string) => void;
    handleClearGeneratedKit?: (index: number) => void;
    KitTable?: React.FC<any>;
    Input?: React.FC<any>;
}

export const SatelliteFoundry: React.FC<SatelliteFoundryProps> = ({
    customUrl,
    setCustomUrl,
    handleRegisterCustom,
    isFetching,
    error,
    generatedKits,
    handleCopyDevUrl,
    handleClearGeneratedKit,
    KitTable,
    Input
}) => {
    const { t, currentLang, registerCustomApp, user, unregisterCustomApp } = useAuth();
    const [activeTab, setActiveTab] = useState<'generator' | 'link' | 'updater'>('generator');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingContext, setIsGeneratingContext] = useState(false);
    const [appType, setAppType] = useState('');
    const [appCategory, setAppCategory] = useState(Object.keys(APP_CATEGORIES)[0]);
    const [appId, setAppId] = useState('');
    const [appPort, setAppPort] = useState('3001');
    const [appLogoUrl, setAppLogoUrl] = useState('');
    const [appDescription, setAppDescription] = useState('');
    
    const [promptText, setPromptText] = useState('');
    const [copied, setCopied] = useState(false);
    const [sdkCopied, setSdkCopied] = useState(false);



    // Auto-generate ID from Name
    useEffect(() => {
        if (appType) {
            const slug = appType.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setAppId(`sat-${slug}`);
        }
    }, [appType]);

    const localhostUrl = `http://localhost:${appPort}`;

    // Update prompt when appType, language, port or scopes change
    useEffect(() => {
        if (appType.trim()) {
            const prompt = generatePrompt(appType, currentLang as 'es' | 'en', parseInt(appPort) || 3001, ['profile'], appLogoUrl, appDescription);
            setPromptText(prompt);
        } else {
            setPromptText('');
        }
    }, [appType, currentLang, appPort, appLogoUrl, appDescription]);

    const handleGenerate = async () => {
        if (!appType.trim()) {
            alert(currentLang === 'es' ? 'Por favor ingresa un tipo de aplicación.' : 'Please enter an App Type.');
            return;
        }

        setIsGenerating(true);
        try {
            await generateStarterKit(appType, currentLang as 'es' | 'en', appCategory, appId, parseInt(appPort), ['profile'], appLogoUrl, appDescription);

            const generatedDetails = {
                category: appCategory,
                appName: appType,
                devUrl: localhostUrl,
                logoUrl: appLogoUrl,
                description: appDescription
            };
            const existingKits = JSON.parse(localStorage.getItem('solutium_generated_kits') || '[]');
            const updatedKits = [...existingKits, generatedDetails];
            localStorage.setItem('solutium_generated_kits', JSON.stringify(updatedKits));

            // Auto-register the app
            const newApp: any = {
                id: appId,
                name: appType,
                description: appDescription || 'No description provided.',
                icon: 'Code',
                url: localhostUrl,
                logoUrl: appLogoUrl || '',
                status: 'active',
                lifecycleStatus: 'development',
                requiresPro: false,
                isCustom: true,
                category: appCategory || 'Custom'
            };
            registerCustomApp(newApp);
        } catch (error) {
            console.error("Failed to generate kit:", error);
            alert("Error generating kit. Check console.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateContext = async () => {
        if (!appType.trim()) {
            alert(currentLang === 'es' ? 'Por favor ingresa un tipo de aplicación.' : 'Please enter an App Type.');
            return;
        }

        setIsGeneratingContext(true);
        try {
            await generateContextOnly(appType, currentLang as 'es' | 'en', appCategory, appId, parseInt(appPort), ['profile'], appLogoUrl, appDescription);

            // Auto-register the app
            const newApp: any = {
                id: appId,
                name: appType,
                description: appDescription || 'No description provided.',
                icon: 'Code',
                url: localhostUrl,
                logoUrl: appLogoUrl || '',
                status: 'active',
                lifecycleStatus: 'development',
                requiresPro: false,
                isCustom: true,
                category: appCategory || 'Custom'
            };
            registerCustomApp(newApp);
        } catch (error) {
            console.error("Failed to generate context:", error);
            alert("Error generating context. Check console.");
        } finally {
            setIsGeneratingContext(false);
        }
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPrompt = () => {
        const blob = new Blob([promptText], { type: 'text/markdown;charset=utf-8' });
        const finalId = appId || `sat-${appType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        const filename = currentLang === 'es' ? `Instrucciones IA - ${finalId}.md` : `AI Instructions - ${finalId}.md`;
        saveAs(blob, filename);
    };

    const handleCopySdk = () => {
        navigator.clipboard.writeText(LATEST_SDK_CODE);
        setSdkCopied(true);
        setTimeout(() => setSdkCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            <Tabs 
              options={[
                { id: 'generator', label: currentLang === 'es' ? 'Generar' : 'Generate' },
                { id: 'link', label: t.vinculados },
                { id: 'updater', label: currentLang === 'es' ? 'Actualizar' : 'Update' }
              ]}
              activeTab={activeTab}
              onChange={(id: string) => setActiveTab(id as any)}
              style="secondary"
            />

            {activeTab === 'generator' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                    {/* LEFT: CONFIGURATION */}
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
                            <h4 className="font-bold text-slate-700 mb-4">{t.foundryStep1}</h4>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        {t.foundryAppTypeLabel}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={appType}
                                        onChange={(e) => setAppType(e.target.value)}
                                        placeholder={t.foundryAppTypePlaceholder}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                            {t.foundryCategoryLabel}
                                        </label>
                                        <select 
                                            value={appCategory}
                                            onChange={(e) => setAppCategory(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                        >
                                            {Object.keys(APP_CATEGORIES).map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                            {t.foundryIdLabel}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={appId}
                                            onChange={(e) => setAppId(e.target.value)}
                                            placeholder="sat-my-app"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-50 font-mono"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                            Puerto Local
                                        </label>
                                        <input 
                                            type="number" 
                                            value={appPort}
                                            onChange={(e) => setAppPort(e.target.value)}
                                            placeholder="3001"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                            URL de Desarrollo
                                        </label>
                                        <div className="flex items-center px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono truncate">
                                            {localhostUrl}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        URL del Logo (Opcional)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={appLogoUrl}
                                        onChange={(e) => setAppLogoUrl(e.target.value)}
                                        placeholder="https://ejemplo.com/logo.png"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                        Descripción (Opcional)
                                    </label>
                                    <textarea 
                                        value={appDescription}
                                        onChange={(e) => setAppDescription(e.target.value)}
                                        placeholder="Breve descripción de la aplicación..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm h-20 resize-none"
                                    />
                                </div>
                            </div>



                            <div className="mt-auto space-y-3">
                                <Button 
                                    onClick={handleGenerate} 
                                    isLoading={isGenerating}
                                    className="w-full justify-center"
                                    disabled={!appType.trim() || isGeneratingContext}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {t.foundryGenerateBtn}
                                </Button>
                                
                                <Button 
                                    variant="ghost"
                                    onClick={handleGenerateContext} 
                                    isLoading={isGeneratingContext}
                                    className="w-full justify-center border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                    disabled={!appType.trim() || isGenerating}
                                >
                                    <Code className="w-4 h-4 mr-2" />
                                    {t.foundryDownloadContext}
                                </Button>

                                <p className="text-[10px] text-slate-400 text-center mt-2">
                                    {currentLang === 'es' 
                                        ? 'El kit incluye el entorno completo. El contexto es solo para la IA.' 
                                        : 'The kit includes the full environment. Context is for AI only.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: PROMPT PREVIEW */}
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                 <h4 className="font-bold text-slate-700">{t.foundryStep2}</h4>
                                 {promptText && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleDownloadPrompt}
                                            className="text-xs flex items-center px-2 py-1 rounded transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                        >
                                            <Download className="w-3 h-3 mr-1" />
                                            {t.foundryDownloadPrompt}
                                        </button>
                                        <button 
                                            onClick={handleCopyPrompt}
                                            className={`text-xs flex items-center px-2 py-1 rounded transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                            {copied ? t.foundryPromptCopied : t.foundryCopyPrompt}
                                        </button>
                                    </div>
                                 )}
                            </div>
                            
                            <p className="text-xs text-slate-500 mb-3">
                                {t.foundryStep2Desc}
                            </p>

                            <div className="relative flex-1 min-h-[200px]">
                                <textarea 
                                    readOnly
                                    value={promptText}
                                    className="w-full h-full min-h-[200px] p-3 text-xs font-mono bg-slate-900 text-green-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder={currentLang === 'es' ? 'El prompt aparecerá aquí...' : 'Prompt will appear here...'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'link' && (
                <div className="animate-fadeIn space-y-8">
                    {/* Linked Apps List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h5 className="font-bold text-slate-700 text-sm">{t.vinculados}</h5>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(user?.customApps || []).map((app: any) => (
                                        <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                        {app.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{app.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                    {app.url}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => unregisterCustomApp(app.id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title={t.delete}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!user?.customApps || user.customApps.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                                                No hay aplicaciones vinculadas aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* History of Generated Kits */}
                    {generatedKits && generatedKits.length > 0 && KitTable && (
                        <div className="space-y-3">
                            <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider px-2">Historial de Generación</h5>
                            <KitTable 
                                kits={generatedKits}
                                onCopy={handleCopyDevUrl}
                                onDelete={handleClearGeneratedKit}
                                t={t}
                            />
                        </div>
                    )}

                    {/* Manual Link Form */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
                        <h4 className="font-bold text-slate-700 mb-4">Vincular Manualmente</h4>
                        <div className="grid grid-cols-1 gap-6">
                            {Input && setCustomUrl && (
                                <Input 
                                    label={t.customAppUrl}
                                    value={customUrl}
                                    onChange={(e: any) => setCustomUrl(e.target.value)}
                                    placeholder="http://localhost:3001"
                                />
                            )}
                            
                            <div className="pt-2">
                                <Button 
                                    onClick={handleRegisterCustom}
                                    disabled={!customUrl || isFetching}
                                    isLoading={isFetching}
                                >
                                    {t.registerApp}
                                </Button>
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100 mt-4">{error}</p>}
                    </div>
                </div>
            )}

            {activeTab === 'updater' && (
                <div className="animate-fadeIn space-y-6">
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-900">{t.updaterTitle}</h4>
                                <p className="text-sm text-indigo-700 opacity-80">{t.updaterDesc}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">src/lib/solutium-sdk.ts</span>
                                <button 
                                    onClick={handleCopySdk}
                                    className={`text-xs flex items-center px-3 py-1.5 rounded-lg font-bold transition-all ${sdkCopied ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}
                                >
                                    {sdkCopied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                    {sdkCopied ? t.foundryPromptCopied : t.copySdkCode}
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto rounded-lg border border-slate-100">
                                <pre className="text-[10px] font-mono p-4 bg-slate-50 text-slate-700">
                                    {LATEST_SDK_CODE}
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h5 className="font-bold text-slate-700 text-sm mb-2">¿Cómo actualizar?</h5>
                            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                                <li>Copia el código de arriba.</li>
                                <li>Ve a tu aplicación satélite.</li>
                                <li>Busca el archivo <code className="bg-slate-200 px-1 rounded">src/lib/solutium-sdk.ts</code>.</li>
                                <li>Reemplaza todo el contenido con el código copiado.</li>
                                <li>Guarda los cambios y reinicia tu servidor de desarrollo.</li>
                            </ol>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h5 className="font-bold text-slate-700 text-sm mb-2">¿Por qué actualizar?</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Mantener el SDK actualizado garantiza que tu aplicación satélite pueda comunicarse correctamente con las nuevas versiones de la App Madre, aprovechando mejoras en seguridad, rendimiento y nuevos contratos de datos.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
