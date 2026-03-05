import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Icons } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

import { Customer, Project } from '../types';
import { useAuth } from '../context/AuthContext';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  initialData?: Customer | null;
  currentProjectId: string;
  projects: Project[];
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({ isOpen, onClose, onSave, initialData, currentProjectId, projects }) => {
  const { t } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    role: initialData?.role || '',
    status: initialData?.status || 'lead',
    source: initialData?.source || 'Direct',
    notes: initialData?.notes || '',
    businessId: initialData?.businessId || (currentProjectId === 'admin-hq' ? 'none' : currentProjectId),
    visibility: initialData?.visibility || 'single',
    assignedBusinessIds: initialData?.assignedBusinessIds || []
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddBusiness = () => {
    const available = projects.filter(p => p.id !== currentProjectId && !formData.assignedBusinessIds.includes(p.id));
    if (available.length > 0) {
      setFormData(prev => ({
        ...prev,
        assignedBusinessIds: [...prev.assignedBusinessIds, available[0].id]
      }));
    }
  };

  const handleBusinessChange = (index: number, value: string) => {
    const newIds = [...formData.assignedBusinessIds];
    newIds[index] = value;
    setFormData(prev => ({ ...prev, assignedBusinessIds: newIds }));
  };

  const handleRemoveBusiness = (index: number) => {
    const newIds = formData.assignedBusinessIds.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, assignedBusinessIds: newIds }));
  };

  const handleVisibilityChange = (value: string) => {
    if (value === 'multiple') {
      setFormData(prev => ({ ...prev, visibility: 'multiple' }));
    } else if (value === 'all') {
      setFormData(prev => ({ ...prev, visibility: 'all', assignedBusinessIds: [] }));
    } else {
      // It's a single business ID
      setFormData(prev => ({ 
        ...prev, 
        visibility: 'single', 
        businessId: value,
        assignedBusinessIds: [] 
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for multiple visibility
    if (formData.visibility === 'multiple') {
      const validIds = formData.assignedBusinessIds.filter(id => id !== '');
      if (validIds.length < 1) { // At least one additional business (plus the owner one)
        alert('Por favor selecciona al menos un negocio adicional para la visibilidad múltiple.');
        return;
      }
    }

    onSave({
      id: initialData?.id || crypto.randomUUID(),
      ...formData,
      lastActivity: initialData?.lastActivity || new Date().toISOString().split('T')[0],
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now()
    });
    onClose();
  };

  if (!isOpen) return null;

  // Determine the value for the main visibility select
  const visibilityValue = formData.visibility === 'single' ? formData.businessId : formData.visibility;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Nuevo Cliente</h3>
              <p className="text-sm text-slate-500">Ingresa la información básica del contacto.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Icons.X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="new-customer-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Info Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-solutium-blue uppercase tracking-wider border-b border-slate-100 pb-2">Información Personal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Nombre Completo" 
                    placeholder="Ej. Juan Pérez" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                  <Input 
                    label="Email" 
                    type="email"
                    placeholder="juan@empresa.com" 
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                  <Input 
                    label="Teléfono" 
                    placeholder="+54 9 11 1234 5678" 
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                  <Input 
                    label="Cargo / Rol" 
                    placeholder="Ej. Gerente de Marketing" 
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                  />
                </div>
              </div>

              {/* Business Info Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-solutium-blue uppercase tracking-wider border-b border-slate-100 pb-2">{t.labelVisibility}</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">{t.labelVisibility}</label>
                    <select 
                      value={visibilityValue}
                      onChange={(e) => handleVisibilityChange(e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-solutium-blue transition-all duration-200 ease-in-out sm:text-sm shadow-sm border-slate-200"
                    >
                      <optgroup label="Negocios Individuales">
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Opciones Avanzadas">
                        <option value="multiple">{t.visibilityMultiple}</option>
                        <option value="all">{t.visibilityAll}</option>
                      </optgroup>
                    </select>
                  </div>

                  {formData.visibility === 'multiple' && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Negocios Seleccionados</label>
                        <button 
                          type="button" 
                          onClick={handleAddBusiness}
                          className="text-xs text-solutium-blue font-bold hover:underline"
                        >
                          + {t.addBusiness}
                        </button>
                      </div>
                      
                      {/* Ensure at least two dropdowns initially if empty */}
                      {(formData.assignedBusinessIds.length === 0 ? ['', ''] : formData.assignedBusinessIds).map((businessId, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <select
                            value={businessId}
                            onChange={(e) => handleBusinessChange(index, e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-solutium-blue transition-all duration-200 sm:text-sm shadow-sm border-slate-200"
                          >
                            <option value="" disabled>{t.selectBusiness}</option>
                            {projects.map(p => {
                              // Filter out current project and already selected projects (except the one in this dropdown)
                              const isSelectedElsewhere = formData.assignedBusinessIds.some((id, i) => id === p.id && i !== index);
                              if (p.id === currentProjectId || isSelectedElsewhere) return null;
                              return <option key={p.id} value={p.id}>{p.name}</option>;
                            })}
                          </select>
                          {formData.assignedBusinessIds.length > 0 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveBusiness(index)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Icons.X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Company Info Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-solutium-blue uppercase tracking-wider border-b border-slate-100 pb-2">Empresa y Estado</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Empresa" 
                    placeholder="Ej. Tech Solutions SA" 
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Estado</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-solutium-blue transition-all duration-200 ease-in-out sm:text-sm shadow-sm border-slate-200"
                    >
                      <option value="lead">Lead (Potencial)</option>
                      <option value="prospect">Prospecto (En Conversación)</option>
                      <option value="customer">Cliente (Activo)</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Fuente</label>
                    <select 
                      value={formData.source}
                      onChange={(e) => handleChange('source', e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-solutium-blue transition-all duration-200 ease-in-out sm:text-sm shadow-sm border-slate-200"
                    >
                      <option value="Direct">Directo</option>
                      <option value="Website">Sitio Web</option>
                      <option value="Referral">Referido</option>
                      <option value="Social">Redes Sociales</option>
                      <option value="Ads">Publicidad</option>
                      <option value="Other">Otro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-solutium-blue uppercase tracking-wider border-b border-slate-100 pb-2">Notas Adicionales</h4>
                <textarea 
                  placeholder="Escribe notas importantes sobre este cliente..."
                  className="w-full px-4 py-3 rounded-lg border text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-solutium-blue transition-all duration-200 ease-in-out sm:text-sm shadow-sm border-slate-200 min-h-[100px]"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>

            </form>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" form="new-customer-form">
              Guardar Cliente
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
