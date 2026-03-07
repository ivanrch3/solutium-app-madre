import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types';
import { Users, Mail, ChevronDown } from 'lucide-react';

const ROLE_LABELS: Partial<Record<UserRole, string>> = {
  super_admin: 'Super Administrador',
  product_manager: 'Gerente de Producto',
  developer: 'Desarrollador',
  editor: 'Editor',
  support: 'Soporte',
  viewer: 'Lector',
  user: 'Usuario',
  admin: 'Administrador'
};

const ROLE_COLORS: Partial<Record<UserRole, string>> = {
  super_admin: 'bg-purple-100 text-purple-700 border-purple-200',
  product_manager: 'bg-blue-100 text-blue-700 border-blue-200',
  developer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  editor: 'bg-amber-100 text-amber-700 border-amber-200',
  support: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  viewer: 'bg-slate-100 text-slate-700 border-slate-200',
  user: 'bg-slate-50 text-slate-500 border-slate-100',
  admin: 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export const TeamManagementPanel: React.FC = () => {
  const { currentLang, updateUserRole } = useAuth();
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      // In a real app, we'd join with auth.users to get email
      // For this demo, we'll fetch profiles where role is not 'user'
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'user');

      if (error) throw error;
      
      // Mocking emails for the demo since we can't easily fetch auth.users from client
      const adminsWithEmails = (data || []).map((admin: any) => ({
        ...admin,
        email: admin.email || `${admin.full_name?.toLowerCase().replace(' ', '.')}@solutium.app`
      }));

      setAdmins(adminsWithEmails);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      // Update local state
      setAdmins(prev => prev.map(admin => 
        admin.id === userId ? { ...admin, role: newRole } : admin
      ));
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-solutium-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {currentLang === 'es' ? 'Equipo Administrativo' : 'Administrative Team'}
          </h3>
          <p className="text-sm text-slate-500">
            {currentLang === 'es' 
              ? 'Gestiona los roles y accesos de los administradores del sistema.' 
              : 'Manage roles and access for system administrators.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>{admins.length} {currentLang === 'es' ? 'Miembros' : 'Members'}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="p-4 border-b border-slate-100 font-bold text-slate-600 text-sm">
                {currentLang === 'es' ? 'Administrador' : 'Administrator'}
              </th>
              <th className="p-4 border-b border-slate-100 font-bold text-slate-600 text-sm">
                {currentLang === 'es' ? 'Rol Actual' : 'Current Role'}
              </th>
              <th className="p-4 border-b border-slate-100 font-bold text-slate-600 text-sm">
                {currentLang === 'es' ? 'Acciones' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-solutium-blue/10 flex items-center justify-center text-solutium-blue font-bold border border-solutium-blue/20">
                      {admin.avatar_url ? (
                        <img src={admin.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        admin.full_name?.charAt(0) || 'A'
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{admin.full_name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {admin.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${ROLE_COLORS[admin.role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {ROLE_LABELS[admin.role] || admin.role}
                  </span>
                </td>
                <td className="p-4">
                  <div className="relative group inline-block">
                    <select
                      value={admin.role}
                      disabled={updatingId === admin.id}
                      onChange={(e) => handleRoleChange(admin.id, e.target.value as UserRole)}
                      className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-solutium-blue/20 focus:border-solutium-blue cursor-pointer disabled:opacity-50"
                    >
                      {Object.entries(ROLE_LABELS).filter(([key]) => key !== 'user').map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      {updatingId === admin.id ? (
                        <div className="w-3 h-3 border-2 border-solutium-blue border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {admins.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Users className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium">No se encontraron otros administradores.</p>
        </div>
      )}
    </div>
  );
};
