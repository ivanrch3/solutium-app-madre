import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { Button } from './Button';
import { Input } from './Input';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product | null;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const { currentProject } = useAuth();
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    unitCost: 0,
    type: 'product',
    sku: '',
    status: 'active',
    businessId: currentProject?.id || 'none'
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        description: '',
        unitCost: 0,
        type: 'product',
        sku: '',
        status: 'active',
        businessId: currentProject?.id || 'none'
      });
    }
  }, [product, isOpen, currentProject]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'unitCost' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Product);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fadeIn">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-solutium-dark">
            {product ? 'Editar Producto/Servicio' : 'Nuevo Producto/Servicio'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input 
                label="Nombre" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                required 
                placeholder="Ej. Diseño de Logotipo"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solutium-blue focus:border-transparent transition-all outline-none text-slate-700 resize-none h-24"
                placeholder="Descripción detallada..."
              />
            </div>

            <div>
              <Input 
                label="Costo Unitario ($)" 
                name="unitCost" 
                type="number"
                step="0.01"
                min="0"
                value={formData.unitCost?.toString() || '0'} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <Input 
                label="Código / SKU" 
                name="sku" 
                value={formData.sku || ''} 
                onChange={handleChange} 
                placeholder="Ej. SRV-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                name="type"
                value={formData.type || 'product'}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solutium-blue focus:border-transparent transition-all outline-none text-slate-700"
              >
                <option value="product">Producto</option>
                <option value="service">Servicio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select
                name="status"
                value={formData.status || 'active'}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solutium-blue focus:border-transparent transition-all outline-none text-slate-700"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {product ? 'Guardar Cambios' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
