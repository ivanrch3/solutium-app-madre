import React, { useState } from 'react';
import { Icons } from '../constants';
import { Button } from '../components/Button';
import { googleCalendarService } from '../services/googleCalendarService';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'internal' | 'google';
  description?: string;
}

const Calendar: React.FC = () => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const token = await googleCalendarService.connect();
      console.log('Google Token Received:', token);
      setIsConnected(true);
    } catch (error) {
      console.error('Google Connection Failed:', error);
      alert('No se pudo conectar con Google. Verifica tu configuración.');
    } finally {
      setIsConnecting(false);
    }
  };

  const [events] = useState<CalendarEvent[]>([
    { id: '1', title: 'Reunión de Equipo', time: '10:00 AM', type: 'internal', description: 'Sincronización semanal de Solutium' },
    { id: '2', title: 'Cita: Juan Pérez', time: '02:30 PM', type: 'internal', description: 'Demo de SiteCrafter' },
    { id: '3', title: 'Llamada HubSpot', time: '04:00 PM', type: 'google', description: 'Sincronizado desde Google Calendar' },
    { id: '4', title: 'Revisión de Diseño', time: '09:00 AM', type: 'google' },
  ]);

  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <p className="text-solutium-grey mt-2">Gestiona tu agenda interna y sincronizada con Google Calendar.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-100 p-1 rounded-lg mr-4">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                  view === v ? 'bg-white text-solutium-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>
          {!isConnected ? (
            <Button 
              variant="secondary" 
              onClick={handleConnectGoogle}
              isLoading={isConnecting}
              className="border-solutium-blue text-solutium-blue hover:bg-blue-50"
            >
              <Icons.Settings className="w-4 h-4 mr-2" />
              Conectar Google Calendar
            </Button>
          ) : (
            <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 text-xs font-bold">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Google Calendar Conectado
            </div>
          )}
          <Button variant="primary">
            <Icons.Plus className="w-4 h-4 mr-2" /> Nueva Cita
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Mini Calendar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Febrero 2024</h3>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {days.map(d => <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d.charAt(0)}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 28 }, (_, i) => (
                <div key={i} className={`aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer hover:bg-slate-100 ${i + 1 === 24 ? 'bg-solutium-blue text-white font-bold' : 'text-slate-600'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Próximas Citas</h3>
            <div className="space-y-4">
              {events.slice(0, 3).map(event => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${event.type === 'internal' ? 'bg-indigo-600' : 'bg-blue-500'}`}></div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{event.title}</p>
                    <p className="text-[10px] text-slate-500">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Calendarios</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="w-4 h-4 rounded bg-indigo-600 border border-indigo-700"></div>
                <span className="text-sm text-slate-600 group-hover:text-slate-900">Solutium Interno</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="w-4 h-4 rounded bg-blue-500 border border-blue-600"></div>
                <span className="text-sm text-slate-600 group-hover:text-slate-900">Google Calendar</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Calendar View */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-8 border-b border-slate-100">
              <div className="p-4 border-r border-slate-100"></div>
              {days.map((day, idx) => (
                <div key={day} className="p-4 text-center border-r border-slate-100 last:border-r-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</p>
                  <p className={`text-lg font-bold ${idx === 3 ? 'text-solutium-blue' : 'text-slate-900'}`}>{19 + idx}</p>
                </div>
              ))}
            </div>

            <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-slate-50 last:border-b-0 min-h-[80px]">
                  <div className="p-2 text-right border-r border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{hour}</span>
                  </div>
                  {days.map((_, dayIdx) => (
                    <div key={dayIdx} className="p-1 border-r border-slate-100 last:border-r-0 relative">
                      {/* Mock Events */}
                      {dayIdx === 3 && hour === '10:00' && (
                        <div className="absolute inset-x-1 top-1 bottom-1 bg-indigo-50 border-l-4 border-indigo-600 p-2 rounded shadow-sm z-10">
                          <p className="text-[10px] font-bold text-indigo-700 truncate">Reunión Equipo</p>
                          <p className="text-[8px] text-indigo-500">10:00 - 11:00</p>
                        </div>
                      )}
                      {dayIdx === 3 && hour === '14:00' && (
                        <div className="absolute inset-x-1 top-1 bottom-1 bg-blue-50 border-l-4 border-blue-500 p-2 rounded shadow-sm z-10">
                          <p className="text-[10px] font-bold text-blue-700 truncate">Llamada HubSpot</p>
                          <p className="text-[8px] text-blue-500">14:00 - 15:00</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
