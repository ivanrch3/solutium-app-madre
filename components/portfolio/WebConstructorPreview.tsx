import React, { useState } from 'react';
import { Icons } from '../../constants';
import { Button } from '../Button';
import { motion, Reorder } from 'motion/react';
import { generateStarterKit } from '../../utils/starterKitGenerator';

interface WebModule {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'contact' | 'products' | 'footer';
  content: any;
}

const MODULE_TEMPLATES: Record<string, any> = {
  hero: { title: 'Bienvenido a mi sitio', subtitle: 'La mejor solución para tu negocio', buttonText: 'Saber más' },
  features: { items: ['Característica 1', 'Característica 2', 'Característica 3'] },
  pricing: { price: '$99', plan: 'Plan Pro' },
  contact: { email: 'contacto@ejemplo.com' },
  products: { title: 'Nuestros Productos', source: 'App Madre' },
  footer: { text: '© 2026 Solutium Web Constructor' }
};

export const WebConstructorPreview: React.FC = () => {
  const [modules, setModules] = useState<WebModule[]>([
    { id: '1', type: 'hero', content: MODULE_TEMPLATES.hero },
    { id: '2', type: 'products', content: MODULE_TEMPLATES.products },
    { id: '3', type: 'footer', content: MODULE_TEMPLATES.footer }
  ]);

  const addModule = (type: WebModule['type']) => {
    const newModule: WebModule = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: MODULE_TEMPLATES[type]
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex h-[600px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        {/* Sidebar: Modules */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Módulos Disponibles</h4>
          <div className="space-y-2 overflow-y-auto flex-1 pr-2">
            {Object.keys(MODULE_TEMPLATES).map((type) => (
              <button
                key={type}
                onClick={() => addModule(type as any)}
                className="w-full flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition-colors">
                  {type === 'hero' && <Icons.WebBuilder className="w-4 h-4" />}
                  {type === 'features' && <Icons.Grid className="w-4 h-4" />}
                  {type === 'pricing' && <Icons.Invoice className="w-4 h-4" />}
                  {type === 'contact' && <Icons.MessageSquare className="w-4 h-4" />}
                  {type === 'products' && <Icons.Store className="w-4 h-4" />}
                  {type === 'footer' && <Icons.Code className="w-4 h-4" />}
                </div>
                <span className="text-sm font-bold text-slate-600 capitalize">{type}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
              <Button variant="accent" className="w-full justify-center text-xs">
                  <Icons.Plus className="w-3 h-3 mr-2" />
                  Crear con IA
              </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col bg-slate-200/50 relative overflow-hidden">
          {/* Browser Header Simulation */}
          <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 max-w-md mx-auto bg-slate-100 rounded-md h-6 flex items-center px-3 text-[10px] text-slate-400 font-mono">
              https://constructor.solutium.app/preview
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Lienzo de Diseño</h3>
                  <p className="text-xs text-slate-500">Previsualización en tiempo real</p>
                </div>
                <div className="flex space-x-2">
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1">
                        <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Icons.Grid className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded bg-indigo-50 text-indigo-600"><Icons.WebBuilder className="w-4 h-4" /></button>
                    </div>
                    <Button size="sm" variant="primary">Publicar</Button>
                </div>
              </div>

            <Reorder.Group axis="y" values={modules} onReorder={setModules} className="space-y-4">
              {modules.map((module) => (
                <Reorder.Item 
                  key={module.id} 
                  value={module}
                  as="div"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden cursor-grab active:cursor-grabbing"
                  >
                    {/* Module Preview */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-widest">
                        {module.type}
                      </span>
                      <button 
                          onClick={(e) => { e.stopPropagation(); removeModule(module.id); }}
                          className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                      >
                          <Icons.X className="w-4 h-4" />
                      </button>
                    </div>

                    {module.type === 'hero' && (
                      <div className="text-center py-4">
                        <h1 className="text-2xl font-bold mb-2">{module.content.title}</h1>
                        <p className="text-slate-500 text-sm mb-4">{module.content.subtitle}</p>
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold">{module.content.buttonText}</button>
                      </div>
                    )}

                    {module.type === 'features' && (
                      <div className="grid grid-cols-3 gap-4 py-4">
                        {module.content.items.map((item: string, i: number) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Icons.Check className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-bold">{item}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {module.type === 'products' && (
                      <div className="py-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-slate-800">{module.content.title}</h4>
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Sincronizado con App Madre</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3 p-3 border border-slate-100 rounded-lg bg-slate-50 opacity-50">
                            <div className="w-10 h-10 bg-slate-200 rounded"></div>
                            <div className="flex-1 space-y-1">
                              <div className="h-2 w-20 bg-slate-200 rounded"></div>
                              <div className="h-2 w-12 bg-slate-200 rounded"></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border border-slate-100 rounded-lg bg-slate-50 opacity-50">
                            <div className="w-10 h-10 bg-slate-200 rounded"></div>
                            <div className="flex-1 space-y-1">
                              <div className="h-2 w-20 bg-slate-200 rounded"></div>
                              <div className="h-2 w-12 bg-slate-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {module.type === 'footer' && (
                      <div className="text-center py-4 border-t border-slate-100 mt-4">
                        <p className="text-xs text-slate-400">{module.content.text}</p>
                      </div>
                    )}

                    {/* Placeholder for other types */}
                    {!['hero', 'features', 'products', 'footer'].includes(module.type) && (
                      <div className="py-8 text-center text-slate-400 italic text-sm">
                        Vista previa del módulo {module.type}
                      </div>
                    )}
                  </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {modules.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <Icons.Plus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Arrastra un módulo para empezar a construir</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Instructions Panel */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-blue-800 text-xl font-bold flex items-center gap-2 mb-3">
              <Icons.Code className="w-6 h-6" />
              Instrucciones para el Satélite "Constructor Web"
            </h3>
            <div className="space-y-4 text-sm text-blue-700 leading-relaxed">
              <p>
                Has iniciado la creación de <strong>Constructor Web</strong>. Este satélite está diseñado para ser el motor de creación de sitios de tus clientes.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-disc pl-5">
                <li><strong>Paso 1:</strong> Descarga el Kit de Inicio usando el botón.</li>
                <li><strong>Paso 2:</strong> Sube el ZIP a tu entorno o dáselo a tu IA.</li>
                <li><strong>Paso 3:</strong> La IA usará el prompt y contexto incluidos.</li>
                <li><strong>Paso 4:</strong> La sincronización S.I.P. ya viene integrada.</li>
              </ul>
            </div>
          </div>
          
          <div className="shrink-0">
            <Button 
              size="lg"
              onClick={() => generateStarterKit('Constructor Web', 'es', 'Marketing y Ventas', 'web-constructor', 3004, ['profile', 'crm', 'products'])}
              className="w-full md:w-auto shadow-lg shadow-blue-200"
            >
              <Icons.Download className="w-4 h-4 mr-2" />
              Descargar Kit de Inicio (ZIP)
            </Button>
            <p className="text-[10px] text-blue-400 mt-2 text-center">v1.0.0 - Solutium Foundry</p>
          </div>
        </div>
        
        <div className="mt-6 bg-white/50 p-4 rounded-xl border border-blue-200 font-mono text-xs text-blue-600">
          <span className="font-bold">Tip:</span> El satélite usará el puerto 3004 por defecto para no interferir con Solutium.
        </div>
      </div>
    </div>
  );
};
