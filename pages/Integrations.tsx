import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../constants';
import { Button } from '../components/Button';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected';
  category: 'calendar' | 'crm' | 'marketing' | 'communication';
  adminState?: 'active' | 'available' | 'new';
}

interface IntegrationsProps {
  hideHeader?: boolean;
}

const Integrations: React.FC<IntegrationsProps> = ({ hideHeader }) => {
  const { t, user, currentProject } = useAuth();
  
  const isAdminHQ = user?.role === 'admin' && currentProject?.id === 'admin-hq';

  const [adminTab, setAdminTab] = useState<'active' | 'available' | 'new'>('active');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sincroniza tus eventos y citas bidireccionalmente.',
      icon: 'Calendar',
      status: 'disconnected',
      category: 'calendar',
      adminState: 'active'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Conecta tu base de datos de clientes y prospectos.',
      icon: 'Users',
      status: 'disconnected',
      category: 'crm',
      adminState: 'available'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Envía notificaciones y recordatorios automáticos.',
      icon: 'MessageSquare',
      status: 'disconnected',
      category: 'communication',
      adminState: 'new'
    }
  ]);

  const handleToggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'connected' ? 'disconnected' : 'connected';
        if (newStatus === 'connected') {
          if (id === 'google-calendar') {
            alert('Iniciando flujo de OAuth con Google...');
          } else {
            alert(`Conectando con ${item.name}...`);
          }
        }
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const renderIcon = (iconName: string) => {
    // @ts-ignore
    const IconComp = Icons[iconName] || Icons.Code;
    return <IconComp className="w-6 h-6" />;
  };

  const activeUserIntegrations = integrations.filter(i => i.status === 'connected');
  const availableUserIntegrations = integrations.filter(i => i.status === 'disconnected');

  return (
    <div className={`space-y-8 animate-fadeIn`}>
      {!hideHeader && (
        <header className="border-b border-slate-200 pb-6">
          <h2 className="text-3xl font-bold text-solutium-dark">{t.integrations}</h2>
          <p className="text-solutium-grey mt-2">Conecta Solutium con tus herramientas favoritas para un flujo de trabajo unificado.</p>
        </header>
      )}

      {isAdminHQ ? (
        // Admin View
        <div>
          <div className="flex space-x-6 border-b border-slate-200 mb-6">
            <button
              onClick={() => setAdminTab('active')}
              className={`pb-2 text-sm font-medium transition-colors relative ${
                adminTab === 'active' ? 'text-solutium-blue' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Activas
              {adminTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-solutium-blue rounded-t-full" />}
            </button>
            <button
              onClick={() => setAdminTab('available')}
              className={`pb-2 text-sm font-medium transition-colors relative ${
                adminTab === 'available' ? 'text-solutium-blue' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Disponibles
              {adminTab === 'available' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-solutium-blue rounded-t-full" />}
            </button>
            <button
              onClick={() => setAdminTab('new')}
              className={`pb-2 text-sm font-medium transition-colors relative ${
                adminTab === 'new' ? 'text-solutium-blue' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Nuevas
              {adminTab === 'new' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-solutium-blue rounded-t-full" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.filter(i => i.adminState === adminTab).map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400`}>
                    {renderIcon(item.icon)}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-100 text-slate-500`}>
                    {item.adminState === 'active' ? 'Activa' : item.adminState === 'available' ? 'Disponible' : 'En Desarrollo'}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.name}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-1">{item.description}</p>
                
                <Button variant="secondary" className="w-full justify-center">
                  Configurar
                </Button>
              </div>
            ))}
            {integrations.filter(i => i.adminState === adminTab).length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No hay integraciones en esta categoría.
              </div>
            )}
          </div>
        </div>
      ) : (
        // User/Guest View
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Mis Integraciones</h3>
            <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
              Nueva Integración
            </Button>
          </div>

          {activeUserIntegrations.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                <Icons.Link className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Sin integraciones activas</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Conecta tus herramientas favoritas para sincronizar datos y automatizar tu flujo de trabajo.
              </p>
              <Button variant="primary" className="mt-6" onClick={() => setIsDrawerOpen(true)}>
                Explorar Integraciones
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeUserIntegrations.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
                      {renderIcon(item.icon)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-green-100 text-green-700">
                      Conectado
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-slate-500 mb-6 flex-1">{item.description}</p>
                  
                  <Button 
                    variant="ghost"
                    onClick={() => handleToggleConnection(item.id)}
                    className="w-full justify-center"
                  >
                    Desconectar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Drawer for Available Integrations */}
          {isDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
              <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideInRight">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Integraciones Disponibles</h3>
                  <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <Icons.X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                  {availableUserIntegrations.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 flex-shrink-0">
                        {renderIcon(item.icon)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                      </div>
                      <Button variant="secondary" onClick={() => handleToggleConnection(item.id)}>
                        Conectar
                      </Button>
                    </div>
                  ))}
                  {availableUserIntegrations.length === 0 && (
                    <div className="text-center text-slate-500 py-8">
                      No hay más integraciones disponibles.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Integrations;
