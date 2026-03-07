import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from './Input';
import { Mail, UserPlus, Shield, User } from 'lucide-react';
import { UserRole } from '../types';

const ADMIN_ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: 'super_admin', label: 'Super Administrador', desc: 'Acceso total a todas las funciones.' },
  { id: 'product_manager', label: 'Gerente de Producto', desc: 'Gestión de apps, proyectos y constitución.' },
  { id: 'developer', label: 'Desarrollador', desc: 'Acceso a infraestructura y llaves maestras.' },
  { id: 'editor', label: 'Editor', desc: 'Gestión de contenido y proyectos de clientes.' },
  { id: 'support', label: 'Soporte', desc: 'Gestión de usuarios y visualización de métricas.' },
  { id: 'viewer', label: 'Lector', desc: 'Acceso de solo lectura a métricas y proyectos.' },
];

export const InvitationPanel: React.FC = () => {
  const { inviteUser, currentLang } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [invitationType, setInvitationType] = useState<'admin' | 'user'>('user');
  const [selectedAdminRole, setSelectedAdminRole] = useState<UserRole>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setIsSubmitting(true);
    try {
      const finalRole = invitationType === 'user' ? 'user' : selectedAdminRole;
      await inviteUser(email, name, finalRole as any);
      setEmail('');
      setName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-solutium-blue/10 rounded-lg text-solutium-blue">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {currentLang === 'es' ? 'Invitar al Equipo' : 'Invite to Team'}
            </h3>
            <p className="text-sm text-slate-500">
              {currentLang === 'es' 
                ? 'Envía una invitación formal para unirse a Solutium.' 
                : 'Send a formal invitation to join Solutium.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={currentLang === 'es' ? 'Nombre Completo' : 'Full Name'}
              placeholder="Ej. Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label={currentLang === 'es' ? 'Correo Electrónico' : 'Email Address'}
              type="email"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              {currentLang === 'es' ? 'Tipo de Invitación' : 'Invitation Type'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setInvitationType('user')}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  invitationType === 'user' 
                    ? 'border-solutium-blue bg-solutium-blue/5 ring-1 ring-solutium-blue' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${invitationType === 'user' ? 'bg-solutium-blue text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {currentLang === 'es' ? 'Invitación de Usuario' : 'User Invitation'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentLang === 'es' 
                      ? 'Acceso estándar a proyectos y herramientas asignadas.' 
                      : 'Standard access to assigned projects and tools.'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInvitationType('admin')}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  invitationType === 'admin' 
                    ? 'border-solutium-blue bg-solutium-blue/5 ring-1 ring-solutium-blue' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${invitationType === 'admin' ? 'bg-solutium-blue text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {currentLang === 'es' ? 'Invitación Administrativa' : 'Admin Invitation'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentLang === 'es' 
                      ? 'Acceso a la consola de administración con rol específico.' 
                      : 'Access to the administration console with specific role.'}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {invitationType === 'admin' && (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 animate-fadeIn">
              <label className="block text-sm font-bold text-slate-700 mb-4">
                {currentLang === 'es' ? 'Seleccionar Rol Administrativo' : 'Select Administrative Role'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADMIN_ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedAdminRole(role.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedAdminRole === role.id
                        ? 'bg-white border-solutium-blue shadow-sm ring-1 ring-solutium-blue'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-800">{role.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{role.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-solutium-blue hover:bg-solutium-dark text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              <span>
                {currentLang === 'es' ? 'Enviar Invitación' : 'Send Invitation'}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {currentLang === 'es' ? 'Información Importante' : 'Important Information'}
          </h4>
          <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
            <li>{currentLang === 'es' ? 'El invitado recibirá un correo electrónico con un enlace de confirmación.' : 'The guest will receive an email with a confirmation link.'}</li>
            <li>{currentLang === 'es' ? 'La invitación es válida por 24 horas.' : 'The invitation is valid for 24 hours.'}</li>
            <li>{currentLang === 'es' ? 'El rol se asignará automáticamente una vez que el usuario acepte la invitación.' : 'The role will be automatically assigned once the user accepts the invitation.'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
