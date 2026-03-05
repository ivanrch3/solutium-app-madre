import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tabs } from '../components/Tabs';
import CRM from './CRM';
import ProductsServices from './ProductsServices';
import Calendar from './Calendar';

const Dashboard: React.FC = () => {
  const { currentProject } = useAuth();
  const [activeTab, setActiveTab] = useState('crm');

  if (!currentProject) {
      return <div>Please create a project to continue.</div>;
  }

  return (
    <div className="flex -m-4 md:-m-8 h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-6 animate-fadeIn">
        
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-solutium-dark">
            Mi Negocio
          </h1>
          <p className="text-solutium-grey mt-2">
            Administra lo más valioso: Clientes, Recursos y Tiempo.
          </p>
        </header>

        <Tabs 
          options={[
            { id: 'crm', label: 'Clientes' },
            { id: 'products', label: 'Productos y servicios' },
            { id: 'calendar', label: 'Agenda y citas' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          style="primary"
          className="mb-8"
        />

        <div className="animate-fadeIn">
          {activeTab === 'crm' && <CRM />}
          {activeTab === 'products' && <ProductsServices />}
          {activeTab === 'calendar' && <Calendar />}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;