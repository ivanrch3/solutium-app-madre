import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../constants';
import { Button } from '../components/Button';
import { Product } from '../types';
import { NewProductModal } from '../components/NewProductModal';

const ProductsServices: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleSaveProduct = (productData: Product) => {
    if (productToEdit) {
        updateProduct(productData);
        setProductToEdit(null);
    } else {
        const { id, createdAt, updatedAt, ...newProductData } = productData;
        addProduct(newProductData);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
      if (productToDelete) {
          deleteProduct(productToDelete.id);
          setProductToDelete(null);
      }
  };

  const handleDeleteClick = (product: Product) => {
      setProductToDelete(product);
      setActiveActionId(null);
  };

  const handleEditClick = (product: Product) => {
      setProductToEdit(product);
      setIsModalOpen(true);
      setActiveActionId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 gap-4">
        <div>
          <p className="text-solutium-grey mt-2">Gestiona tu catálogo de productos y servicios.</p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <Button variant="primary" onClick={() => { setProductToEdit(null); setIsModalOpen(true); }}>
            <Icons.Plus className="w-4 h-4 mr-2" /> Nuevo
          </Button>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="relative w-full md:w-96">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                  type="text" 
                  placeholder="Buscar por nombre, SKU o descripción..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-solutium-blue focus:border-transparent transition-all outline-none text-slate-700"
              />
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
          </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Icons.Grid className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-solutium-dark mb-1">Catálogo Vacío</h4>
            <p className="text-solutium-grey mb-6 max-w-sm">Aún no has registrado ningún producto o servicio. Comienza agregando uno nuevo.</p>
            <Button variant="primary" onClick={() => { setProductToEdit(null); setIsModalOpen(true); }}>
               <Icons.Plus className="w-4 h-4 mr-2" /> Agregar Producto
            </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                            <th className="p-4">Nombre</th>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Costo Unitario</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                <td className="p-4">
                                    <div className="font-medium text-solutium-dark">{product.name}</div>
                                    {product.description && (
                                        <div className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xs">{product.description}</div>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-slate-600">
                                    {product.sku || '-'}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        product.type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                    }`}>
                                        {product.type === 'product' ? 'Producto' : 'Servicio'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm font-medium text-solutium-dark">
                                    ${product.unitCost.toFixed(2)}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                    }`}>
                                        {product.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="p-4 text-right relative">
                                    <button 
                                        onClick={() => setActiveActionId(activeActionId === product.id ? null : product.id)}
                                        className="p-2 text-slate-400 hover:text-solutium-blue rounded-lg hover:bg-solutium-blue/10 transition-colors"
                                    >
                                        <Icons.MoreVertical className="w-5 h-5" />
                                    </button>

                                    {activeActionId === product.id && (
                                        <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-10 animate-fadeIn">
                                            <button 
                                                onClick={() => handleEditClick(product)}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-solutium-blue flex items-center"
                                            >
                                                <Icons.Edit className="w-4 h-4 mr-2" /> Editar
                                            </button>
                                            <div className="h-px bg-slate-100 my-1"></div>
                                            <button 
                                                onClick={() => handleDeleteClick(product)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                            >
                                                <Icons.Trash className="w-4 h-4 mr-2" /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No se encontraron productos que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
                      <Icons.AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-solutium-dark mb-2">¿Eliminar Producto?</h3>
                  <p className="text-center text-slate-500 mb-6">
                      Estás a punto de eliminar <strong>{productToDelete.name}</strong>. Esta acción no se puede deshacer.
                  </p>
                  <div className="flex space-x-3">
                      <Button variant="secondary" className="flex-1" onClick={() => setProductToDelete(null)}>
                          Cancelar
                      </Button>
                      <Button variant="danger" className="flex-1" onClick={confirmDelete}>
                          Sí, eliminar
                      </Button>
                  </div>
              </div>
          </div>
      )}

      <NewProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={productToEdit}
      />
    </div>
  );
};

export default ProductsServices;
