import React, { useState } from 'react';
import { Icons } from '../constants';

interface DocumentInfo {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: keyof typeof Icons;
  content?: string;
}

const CONSTITUTION_DOCS: DocumentInfo[] = [
  {
    id: 'constants',
    title: 'Master Design Memory & Registry',
    description: 'Contiene las clases de diseño base (THEME_CLASSES), iconos globales, configuración de dominios (DOMAINS) y el registro central de aplicaciones satélite (AVAILABLE_APPS).',
    path: '/src/constants.tsx',
    icon: 'Code'
  },
  {
    id: 'translations',
    title: 'Diccionario de Traducciones',
    description: 'Centraliza todos los textos de la interfaz en inglés y español. Es vital para mantener la consistencia del lenguaje en toda la aplicación madre.',
    path: '/src/translations.ts',
    icon: 'Grid'
  },
  {
    id: 'roadmap',
    title: 'Roadmap & Changelog',
    description: 'Define la hoja de ruta de desarrollo de las aplicaciones satélite y el registro de cambios (changelog) visible para los usuarios.',
    path: '/src/services/roadmapData.ts',
    icon: 'Calendar'
  },
  {
    id: 'auth-context',
    title: 'Contexto de Autenticación',
    description: 'Maneja el estado global del usuario, roles (admin/guest), inicio de sesión, y la inyección simulada de tokens para los satélites.',
    path: '/src/context/AuthContext.tsx',
    icon: 'Settings'
  },
  {
    id: 'portfolio',
    title: 'Portfolio & Satellite Lab',
    description: 'La vista principal donde los usuarios ven sus apps y los administradores gestionan el ciclo de vida de los satélites (Fundición y Registro).',
    path: '/src/pages/Portfolio.tsx',
    icon: 'WebBuilder'
  }
];

export const ConstitutionPanel: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentInfo | null>(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-solutium-blue rounded-full opacity-10 transform translate-x-20 -translate-y-20 blur-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2 flex items-center">
            <Icons.Code className="w-6 h-6 mr-3 text-solutium-yellow" />
            Constitución del Sistema
          </h3>
          <p className="text-slate-400 max-w-2xl">
            Estos son los documentos fundamentales que rigen la arquitectura, diseño y comportamiento de la Aplicación Madre y sus Satélites. Modificar estos archivos altera el ADN del sistema.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CONSTITUTION_DOCS.map((doc) => {
          const IconComp = Icons[doc.icon] || Icons.Code;
          return (
            <div 
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-solutium-blue transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-slate-50 text-solutium-blue rounded-lg group-hover:bg-solutium-blue group-hover:text-white transition-colors">
                  <IconComp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 group-hover:text-solutium-blue transition-colors">{doc.title}</h4>
              </div>
              <p className="text-sm text-slate-500 mb-4 flex-1">{doc.description}</p>
              <div className="text-xs font-mono text-slate-400 bg-slate-50 p-2 rounded border border-slate-100 truncate">
                {doc.path}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-scaleIn relative">
            <button 
              onClick={() => setSelectedDoc(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                {React.createElement(Icons[selectedDoc.icon] || Icons.Code, { className: "w-8 h-8" })}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{selectedDoc.title}</h3>
                <p className="text-sm font-mono text-solutium-blue mt-1">{selectedDoc.path}</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6">
              <h4 className="font-bold text-slate-800 mb-2">Propósito en el Ecosistema</h4>
              <p className="text-slate-600 leading-relaxed">{selectedDoc.description}</p>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
