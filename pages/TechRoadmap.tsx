import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_ROADMAP, BACKGROUND_CHANGELOG, RoadmapItem, ChangelogEntry } from '../services/roadmapData';
import { CheckCircle2, Clock, Circle, History, Rocket, ShieldCheck } from 'lucide-react';

const TechRoadmap: React.FC = () => {
  const { t } = useAuth();
  
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
      <header className="border-b border-slate-200 pb-8">
        <div className="flex items-center space-x-4 mb-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.roadmapTitle}</h2>
        </div>
        <p className="text-slate-500 text-lg max-w-2xl">{t.roadmapDesc}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT & CENTER: ROADMAP PHASES */}
        <div className="lg:col-span-2 space-y-10">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center">
                        Plan de Ejecución Priorizado
                    </h3>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                        Internal Ops
                    </span>
                </div>
                
                <div className="p-8">
                    <div className="relative border-l-2 border-slate-100 ml-4 space-y-12">
                        {ADMIN_ROADMAP.map((phase: RoadmapItem) => (
                            <div key={phase.id} className="relative pl-10">
                                {/* Status Icon */}
                                <div className={`absolute -left-[21px] top-0 w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                                    phase.status === 'completed' ? 'bg-green-500 text-white' :
                                    phase.status === 'current' ? 'bg-amber-500 text-white animate-pulse' :
                                    'bg-slate-200 text-slate-400'
                                }`}>
                                    {phase.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                                     phase.status === 'current' ? <Clock className="w-5 h-5" /> :
                                     <Circle className="w-5 h-5" />}
                                </div>

                                <div className="flex flex-col">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{phase.phase}</span>
                                        <h4 className={`text-xl font-bold ${phase.status === 'completed' ? 'text-slate-400' : 'text-slate-900'}`}>
                                            {phase.title}
                                        </h4>
                                        {phase.status === 'completed' && (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Finalizado</span>
                                        )}
                                    </div>
                                    <p className={`text-sm leading-relaxed ${phase.status === 'completed' ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {phase.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Strategic Decisions */}
            <section className="bg-slate-900 text-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <h3 className="text-xl font-bold mb-8 flex items-center">
                    <ShieldCheck className="w-6 h-6 mr-3 text-indigo-400" />
                    Decisiones Arquitectónicas Clave
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h4 className="font-bold text-indigo-300 text-sm uppercase tracking-wider">Marketplace & Seguridad</h4>
                        <p className="text-slate-400 text-sm leading-relaxed italic">
                            "Usamos un sistema de tokens inyectados (Pasaporte Universal). Las apps satélite no pueden funcionar fuera del iframe de Solutium sin un token válido, garantizando que solo usuarios autorizados accedan a sus herramientas."
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-bold text-indigo-300 text-sm uppercase tracking-wider">Sincronización de Datos</h4>
                        <p className="text-slate-400 text-sm leading-relaxed italic">
                            "Implementamos Webhooks Asíncronos para integraciones externas. Si un servicio de terceros falla, Solutium encola la tarea y reintenta automáticamente, evitando interrupciones en la experiencia del usuario."
                        </p>
                    </div>
                </div>
            </section>
        </div>

        {/* RIGHT COLUMN: BACKGROUND CHANGELOG */}
        <div className="space-y-8">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center">
                        <History className="w-5 h-5 mr-2 text-slate-400" />
                        Background Changelog
                    </h3>
                </div>
                
                <div className="p-6 space-y-8">
                    {BACKGROUND_CHANGELOG.map((entry: ChangelogEntry) => (
                        <div key={entry.id} className="relative pl-4 border-l-2 border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400">{entry.date}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                                    entry.type === 'feature' ? 'bg-blue-100 text-blue-700' :
                                    entry.type === 'fix' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {entry.type}
                                </span>
                            </div>
                            <h5 className="text-sm font-bold text-slate-800 mb-1">{entry.title}</h5>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {entry.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                    Este mapa de ruta es dinámico y se actualiza automáticamente conforme avanzamos en la construcción del ecosistema Solutium.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TechRoadmap;
