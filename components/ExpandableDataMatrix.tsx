import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Server, ChevronDown, ChevronUp, Plus, X, Database } from 'lucide-react';
import { storageService } from '../services/storageService';

const SATELLITES = [
  { id: 'web-constructor', name: 'Constructor Web', icon: <Smartphone className="w-5 h-5 text-blue-500" /> },
  { id: 'invoicer', name: 'Facturación', icon: <Server className="w-5 h-5 text-emerald-500" /> },
  { id: 'crm', name: 'CRM Clientes', icon: <Server className="w-5 h-5 text-orange-500" /> }
];

interface UnifiedContract {
  id: string;
  name: string;
  description: string;
  fields: string[];
  status: 'Active' | 'Draft' | 'Deprecated';
}

const INITIAL_CONTRACTS: UnifiedContract[] = [
  { id: 'profile', name: 'Perfil de Usuario', description: 'Datos básicos de identidad y acceso.', fields: ['id', 'name', 'email', 'role', 'avatar'], status: 'Active' },
  { id: 'projectData', name: 'Datos del Proyecto', description: 'Configuración visual y de marca.', fields: ['projectId', 'themeColors', 'logoUrl', 'fontFamily'], status: 'Active' },
  { id: 'customer', name: 'Customer (CRM)', description: 'Perfil completo del cliente comercial.', fields: ['id', 'name', 'email', 'company', 'phone'], status: 'Active' },
  { id: 'invoice', name: 'Invoice (Finanzas)', description: 'Documento fiscal y de cobro.', fields: ['id', 'amount', 'date', 'customerId', 'status'], status: 'Active' },
  { id: 'productService', name: 'Productos y Servicios', description: 'Catálogo de productos y servicios.', fields: ['id', 'name', 'price', 'category', 'sku'], status: 'Active' },
];

export const ExpandableDataMatrix: React.FC = () => {
  const [contracts, setContracts] = useState<UnifiedContract[]>(INITIAL_CONTRACTS);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    const loadPermissions = () => {
      const perms: Record<string, string[]> = {};
      SATELLITES.forEach(sat => {
        const custom = storageService.getAppCustomizations(sat.id);
        perms[sat.id] = custom.scopes || ['profile', 'projectData'];
      });
      setPermissions(perms);
    };
    loadPermissions();
  }, []);

  const handleToggleScope = (satelliteId: string, scopeId: string) => {
    setPermissions(prev => {
      const currentScopes = prev[satelliteId] || [];
      const newScopes = currentScopes.includes(scopeId)
        ? currentScopes.filter(s => s !== scopeId)
        : [...currentScopes, scopeId];
      
      const newPerms = { ...prev, [satelliteId]: newScopes };
      storageService.setAppScopes(satelliteId, newScopes);
      return newPerms;
    });
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleFieldChange = (contractId: string, fieldIndex: number, newValue: string) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        const newFields = [...c.fields];
        newFields[fieldIndex] = newValue;
        return { ...c, fields: newFields };
      }
      return c;
    }));
  };

  const addField = (contractId: string) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return { ...c, fields: [...c.fields, 'new_field'] };
      }
      return c;
    }));
  };

  const removeField = (contractId: string, fieldIndex: number) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        const newFields = [...c.fields];
        newFields.splice(fieldIndex, 1);
        return { ...c, fields: newFields };
      }
      return c;
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-t-4 border-purple-500 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Matriz Expandible (Permisos + S.I.P.)</h3>
          <p className="text-sm text-slate-500">Vista unificada: Controla quién tiene acceso y define la estructura del dato en el mismo lugar.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-bold text-slate-700 w-1/3">Contrato de Datos (Objeto)</th>
              {SATELLITES.map(sat => (
                <th key={sat.id} className="px-6 py-4 text-center border-l border-slate-200">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                      {sat.icon}
                    </div>
                    <span className="font-bold text-slate-800 text-sm">{sat.name}</span>
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-center border-l border-slate-200 w-16">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contracts.map(contract => (
              <React.Fragment key={contract.id}>
                {/* MAIN ROW: PERMISSIONS */}
                <tr className={`hover:bg-slate-50/50 transition-colors ${expandedRow === contract.id ? 'bg-purple-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800 text-sm">{contract.name}</div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${contract.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {contract.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{contract.description}</div>
                  </td>
                  
                  {/* TOGGLES */}
                  {SATELLITES.map(sat => {
                    const isEnabled = (permissions[sat.id] || []).includes(contract.id);
                    return (
                      <td key={`${sat.id}-${contract.id}`} className="px-6 py-4 text-center border-l border-slate-200">
                        <button
                          onClick={() => handleToggleScope(sat.id, contract.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                            isEnabled ? 'bg-purple-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    );
                  })}

                  {/* EXPAND BUTTON */}
                  <td className="px-6 py-4 text-center border-l border-slate-200">
                    <button 
                      onClick={() => toggleRow(contract.id)}
                      className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                    >
                      {expandedRow === contract.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>

                {/* EXPANDED ROW: S.I.P. CONTRACT EDITOR */}
                <AnimatePresence>
                  {expandedRow === contract.id && (
                    <tr>
                      <td colSpan={SATELLITES.length + 2} className="p-0 border-b border-slate-200">
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50 border-t border-slate-100 shadow-inner"
                        >
                          <div className="p-6 pl-12">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Estructura del JSON (S.I.P.)</h4>
                              <button 
                                onClick={() => addField(contract.id)} 
                                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Plus className="w-3 h-3" /> Añadir Propiedad
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                              {contract.fields.map((field, idx) => (
                                <div key={idx} className="flex items-center bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400 transition-all">
                                  <div className="px-2 py-1.5 bg-slate-100 border-r border-slate-200 text-slate-400">
                                    <Database className="w-3 h-3" />
                                  </div>
                                  <input 
                                    type="text" 
                                    value={field}
                                    onChange={e => handleFieldChange(contract.id, idx, e.target.value)}
                                    className="bg-transparent px-3 py-1.5 text-sm font-mono text-slate-700 outline-none w-32"
                                  />
                                  <button 
                                    onClick={() => removeField(contract.id, idx)} 
                                    className="px-2 py-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {contract.fields.length === 0 && (
                                <span className="text-sm text-slate-400 italic">No hay campos definidos. El objeto se enviará vacío.</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
