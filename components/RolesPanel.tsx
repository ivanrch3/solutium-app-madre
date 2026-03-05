import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Permission = 'manage_users' | 'manage_billing' | 'manage_apps' | 'view_analytics' | 'edit_content' | 'view_content' | 'manage_settings';
type Role = 'super_admin' | 'product_manager' | 'developer' | 'editor' | 'viewer' | 'support';

interface RolePermissions {
  [role: string]: {
    [perm in Permission]: boolean;
  };
}

const defaultPermissions: RolePermissions = {
  super_admin: {
    manage_users: true, manage_billing: true, manage_apps: true, view_analytics: true, edit_content: true, view_content: true, manage_settings: true
  },
  product_manager: {
    manage_users: false, manage_billing: false, manage_apps: true, view_analytics: true, edit_content: true, view_content: true, manage_settings: true
  },
  developer: {
    manage_users: false, manage_billing: false, manage_apps: true, view_analytics: true, edit_content: true, view_content: true, manage_settings: false
  },
  editor: {
    manage_users: false, manage_billing: false, manage_apps: false, view_analytics: false, edit_content: true, view_content: true, manage_settings: false
  },
  viewer: {
    manage_users: false, manage_billing: false, manage_apps: false, view_analytics: false, edit_content: false, view_content: true, manage_settings: false
  },
  support: {
    manage_users: false, manage_billing: false, manage_apps: false, view_analytics: true, edit_content: false, view_content: true, manage_settings: false
  }
};

const permissionLabels: Record<Permission, { es: string, en: string }> = {
  manage_users: { es: 'Gestionar Usuarios', en: 'Manage Users' },
  manage_billing: { es: 'Gestionar Facturación', en: 'Manage Billing' },
  manage_apps: { es: 'Gestionar Aplicaciones', en: 'Manage Apps' },
  view_analytics: { es: 'Ver Estadísticas', en: 'View Analytics' },
  edit_content: { es: 'Editar Contenido', en: 'Edit Content' },
  view_content: { es: 'Ver Contenido', en: 'View Content' },
  manage_settings: { es: 'Gestionar Configuración', en: 'Manage Settings' }
};

const roleLabels: Record<Role, { es: string, en: string }> = {
  super_admin: { es: 'Super Administrador', en: 'Super Admin' },
  product_manager: { es: 'Gerente de Producto', en: 'Product Manager' },
  developer: { es: 'Desarrollador', en: 'Developer' },
  editor: { es: 'Editor', en: 'Editor' },
  viewer: { es: 'Lector', en: 'Viewer' },
  support: { es: 'Soporte', en: 'Support' }
};

export const RolesPanel: React.FC = () => {
  const { currentLang } = useAuth();
  const [permissions, setPermissions] = useState<RolePermissions>(defaultPermissions);

  const togglePermission = (role: Role, perm: Permission) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm]
      }
    }));
  };

  const roles = Object.keys(defaultPermissions) as Role[];
  const perms = Object.keys(permissionLabels) as Permission[];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 md:p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6">
          {currentLang === 'es' ? 'Roles y Permisos' : 'Roles & Permissions'}
        </h3>
        <p className="text-slate-600 mb-8">
          {currentLang === 'es' 
            ? 'Configura los permisos para cada rol. Estos roles influyen en la creación o inclusión de personas en el equipo de la aplicación maestra y en los nuevos usuarios.' 
            : 'Configure permissions for each role. These roles influence the creation or inclusion of people in the master application team and new users.'}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-3 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                  {currentLang === 'es' ? 'Permiso' : 'Permission'}
                </th>
                {roles.map(role => (
                  <th key={role} className="p-3 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 text-center">
                    {roleLabels[role][currentLang]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perms.map(perm => (
                <tr key={perm} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 border-b border-slate-100 text-sm font-medium text-slate-800">
                    {permissionLabels[perm][currentLang]}
                  </td>
                  {roles.map(role => (
                    <td key={role} className="p-3 border-b border-slate-100 text-center">
                      <input
                        type="checkbox"
                        checked={permissions[role][perm]}
                        onChange={() => togglePermission(role, perm)}
                        className="w-4 h-4 text-solutium-blue rounded border-slate-300 focus:ring-solutium-blue cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
