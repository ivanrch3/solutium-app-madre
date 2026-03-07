import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Plus, MapPin, Briefcase } from 'lucide-react';
import { INDUSTRIES } from '../constants';

const EmptyState = () => {
    const { createProject, currentLang } = useAuth();
    const [projectName, setProjectName] = useState('');
    const [address, setAddress] = useState('');
    const [industry, setIndustry] = useState('');

    const industriesList = INDUSTRIES[currentLang] || INDUSTRIES['es'];

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (projectName.trim()) {
            createProject(projectName, industry || 'Otro', address);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-slate-100"
            >
                <div className="w-16 h-16 bg-solutium-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Plus className="w-8 h-8 text-solutium-blue" />
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Bienvenido a Solutium</h1>
                <p className="text-slate-500 mb-8">Para comenzar, crea tu primer proyecto.</p>

                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="text-left">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nombre del Proyecto
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Ej. Mi Empresa"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-solutium-blue focus:border-solutium-blue outline-none transition-all"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="text-left">
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> Dirección del Proyecto
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Ej. Av. Principal 123, Ciudad"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-solutium-blue focus:border-solutium-blue outline-none transition-all"
                        />
                    </div>

                    <div className="text-left">
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                            <Briefcase className="w-4 h-4" /> Tipo de Negocio
                        </label>
                        <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-solutium-blue focus:border-solutium-blue outline-none transition-all bg-white"
                            required
                        >
                            <option value="" disabled>Selecciona un tipo de negocio</option>
                            {industriesList.map((ind) => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!projectName.trim() || !industry}
                        className={`w-full py-3 rounded-xl font-medium transition-all mt-4 ${
                            projectName.trim() && industry
                            ? 'bg-solutium-blue text-white hover:bg-solutium-blue/90 shadow-md hover:shadow-lg' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Crear proyecto
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default EmptyState;
