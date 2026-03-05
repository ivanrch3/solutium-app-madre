import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../constants';
import { Button } from '../components/Button';
import { NewCustomerModal } from '../components/NewCustomerModal';
import { ImportCustomersModal } from '../components/ImportCustomersModal';
import { Customer } from '../types';
import { Tabs } from '../components/Tabs';
import { exportCustomersToCSV, exportCustomersToExcel, exportCustomersToPDF } from '../utils/exportUtils';

const CRM: React.FC = () => {
  const { user, customers, addCustomer, updateCustomer, deleteCustomer, addCustomersBatch, currentProject } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSaveCustomer = (customerData: Customer) => {
    if (customerToEdit) {
        updateCustomer(customerData);
        setCustomerToEdit(null);
    } else {
        const { id, createdAt, updatedAt, ...newCustomerData } = customerData;
        addCustomer(newCustomerData);
    }
    setIsNewCustomerModalOpen(false);
  };

  const confirmDelete = () => {
      if (customerToDelete) {
          deleteCustomer(customerToDelete.id, customerToDelete.businessId);
          setCustomerToDelete(null);
      }
  };

  const handleDeleteClick = (customer: Customer) => {
      setCustomerToDelete(customer);
      setActiveActionId(null);
  };

  const handleEditCustomer = (customer: Customer) => {
      setCustomerToEdit(customer);
      setIsNewCustomerModalOpen(true);
      setActiveActionId(null);
  };

  const handleContactCustomer = (customer: Customer) => {
      window.location.href = `mailto:${customer.email}`;
      setActiveActionId(null);
  };

  const handleImportCustomers = (importedCustomers: Customer[]) => {
    const cleanedCustomers = importedCustomers.map(customer => {
        const { id, createdAt, updatedAt, ...newCustomerData } = customer;
        return newCustomerData;
    });
    addCustomersBatch(cleanedCustomers);
    setIsImportModalOpen(false);
  };

  const handleExportCSV = () => {
    exportCustomersToCSV(customers);
    setIsExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    exportCustomersToExcel(customers);
    setIsExportMenuOpen(false);
  };

  const handleExportPDF = () => {
    exportCustomersToPDF(customers);
    setIsExportMenuOpen(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn" onClick={() => isExportMenuOpen && setIsExportMenuOpen(false)}>
      <header className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <p className="text-solutium-grey mt-2">Gestión centralizada de clientes y prospectos de todas tus aplicaciones.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            <Icons.Upload className="w-4 h-4 mr-2" /> Importar
          </Button>
          
          <div className="relative">
            <Button 
              variant="secondary" 
              onClick={(e) => {
                e.stopPropagation();
                setIsExportMenuOpen(!isExportMenuOpen);
              }}
            >
              <Icons.Download className="w-4 h-4 mr-2" /> Exportar
            </Button>
            
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-20 overflow-hidden animate-scaleIn">
                <div className="py-1">
                  <button 
                    onClick={handleExportExcel}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 flex items-center"
                  >
                    <Icons.FileText className="w-4 h-4 mr-2" /> Excel (.xlsx)
                  </button>
                  <button 
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center"
                  >
                    <Icons.Code className="w-4 h-4 mr-2" /> CSV (.csv)
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 flex items-center"
                  >
                    <Icons.FileText className="w-4 h-4 mr-2" /> PDF (.pdf)
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button variant="primary" onClick={() => setIsNewCustomerModalOpen(true)}>
            <Icons.Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Clientes</p>
          <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-blue-500 uppercase mb-1">Prospectos</p>
          <p className="text-2xl font-bold text-slate-900">{customers.filter(c => c.status === 'prospect').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-green-500 uppercase mb-1">Clientes Activos</p>
          <p className="text-2xl font-bold text-slate-900">{customers.filter(c => c.status === 'customer').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-amber-500 uppercase mb-1">Leads Nuevos</p>
          <p className="text-2xl font-bold text-slate-900">{customers.filter(c => c.status === 'lead').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Icons.Grid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar por nombre o empresa..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-solutium-blue focus:border-transparent outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Tabs 
              options={[
                { id: 'all', label: 'Todos' },
                { id: 'customer', label: 'Clientes' },
                { id: 'prospect', label: 'Prospectos' },
                { id: 'lead', label: 'Leads' }
              ]}
              activeTab={statusFilter}
              onChange={setStatusFilter}
              style="secondary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-5 font-semibold">Cliente</th>
                <th className="px-6 py-5 font-semibold">Empresa</th>
                <th className="px-6 py-5 font-semibold">Estado</th>
                <th className="px-6 py-5 font-semibold">Fuente</th>
                <th className="px-6 py-5 font-semibold">Última Actividad</th>
                <th className="px-6 py-5 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 italic bg-slate-50/30">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-300">
                            <Icons.Users className="w-6 h-6" />
                        </div>
                        <p>No se encontraron clientes.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{customer.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500">{customer.company || '-'}</td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border ${
                        customer.status === 'customer' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        customer.status === 'prospect' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        customer.status === 'lead' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        {customer.source === 'HubSpot' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                        <span className="text-xs text-slate-500 font-medium">{customer.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-400">{customer.lastActivity}</td>
                    <td className="px-6 py-5 text-right relative">
                      <button 
                        className="text-slate-300 hover:text-solutium-blue p-2 rounded-lg hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionId(activeActionId === customer.id ? null : customer.id);
                        }}
                      >
                        <Icons.Settings className="w-4 h-4" />
                      </button>
                      
                      {activeActionId === customer.id && (
                          <div className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 animate-scaleIn overflow-hidden">
                              <div className="py-1">
                                  <button 
                                      onClick={() => handleEditCustomer(customer)}
                                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-solutium-blue flex items-center"
                                  >
                                      <Icons.Settings className="w-3 h-3 mr-2" /> Editar
                                  </button>
                                  <button 
                                      onClick={() => handleContactCustomer(customer)}
                                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 flex items-center"
                                  >
                                      <Icons.Users className="w-3 h-3 mr-2" /> Contactar
                                  </button>
                                  <div className="border-t border-slate-100 my-1"></div>
                                  <button 
                                      onClick={() => handleDeleteClick(customer)}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                  >
                                      <Icons.Trash className="w-3 h-3 mr-2" /> Eliminar
                                  </button>
                              </div>
                          </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isNewCustomerModalOpen && (
        <NewCustomerModal 
          isOpen={isNewCustomerModalOpen} 
          onClose={() => {
              setIsNewCustomerModalOpen(false);
              setCustomerToEdit(null);
          }} 
          onSave={handleSaveCustomer} 
          initialData={customerToEdit}
          currentProjectId={currentProject?.id || 'admin-hq'}
          projects={user?.projects || []}
        />
      )}

      {isImportModalOpen && (
        <ImportCustomersModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportCustomers}
        />
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                          <Icons.Trash className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Eliminar Cliente</h3>
                      <p className="text-slate-500 mt-2">
                          ¿Estás seguro de que quieres eliminar a <span className="font-bold text-slate-900">{customerToDelete.name}</span>? Esta acción no se puede deshacer.
                      </p>
                  </div>
                  <div className="flex space-x-3 justify-end">
                      <Button variant="ghost" onClick={() => setCustomerToDelete(null)}>
                          Cancelar
                      </Button>
                      <Button 
                          variant="primary" 
                          className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                          onClick={confirmDelete}
                      >
                          Eliminar
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CRM;
