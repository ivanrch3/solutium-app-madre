import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, TrendingUp, ArrowUpRight } from 'lucide-react';

const Statistics: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const { user, t } = useAuth();
  const [activeUsers, setActiveUsers] = useState(124);

  // Simulate real-time user fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
        setActiveUsers(prev => {
            const change = Math.floor(Math.random() * 5) - 2; 
            return Math.max(100, prev + change);
        });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (user?.role !== 'admin') {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM7 20h10a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Acceso Restringido</h2>
            <p className="text-slate-500 mt-2 max-w-md">Esta sección contiene métricas sensibles del ecosistema y solo es accesible para administradores de Solutium.</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {!hideHeader && (
        <header className="border-b border-slate-200 pb-6">
          <h2 className="text-3xl font-bold text-solutium-dark flex items-center">
            <TrendingUp className="w-8 h-8 text-indigo-600 mr-3" />
            {t.statistics || 'Estadísticas del Ecosistema'}
          </h2>
          <p className="text-solutium-grey mt-2">Métricas de rendimiento y adopción de usuarios en tiempo real.</p>
        </header>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Users className="w-6 h-6" />
                  </div>
                  <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      12%
                  </span>
              </div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t.totalUsers}</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">1,204</p>
              <p className="text-xs text-slate-400 mt-2">Usuarios registrados</p>
          </div>

          {/* Active Users */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-green-600 uppercase">Live</span>
                  </div>
              </div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t.activeUsersNow || 'Usuarios Activos'}</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">{activeUsers}</p>
              <p className="text-xs text-slate-400 mt-2">Sesiones concurrentes</p>
          </div>

          {/* Projects Created */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      8%
                  </span>
              </div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Proyectos Totales</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">458</p>
              <p className="text-xs text-slate-400 mt-2">Ecosistemas activos</p>
          </div>

          {/* Satellites Deployed */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <span className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      Stable
                  </span>
              </div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Satélites Desplegados</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">12</p>
              <p className="text-xs text-slate-400 mt-2">Apps personalizadas</p>
          </div>
      </div>

      {/* Growth Chart Placeholder */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Crecimiento Mensual</h3>
          <div className="h-64 w-full bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Visualización de tendencia en desarrollo...</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Statistics;
