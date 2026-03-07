import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

type Permission = 
  | 'manage_users' 
  | 'manage_billing' 
  | 'manage_apps' 
  | 'manage_infrastructure' 
  | 'manage_master_keys' 
  | 'manage_projects' 
  | 'manage_constitution' 
  | 'view_analytics';

type Role = 'super_admin' | 'product_manager' | 'developer' | 'editor' | 'viewer' | 'support';

interface RolePermissions {
  [role: string]: {
    [perm in Permission]: boolean;
  };
}

const defaultPermissions: RolePermissions = {
  super_admin: {
    manage_users: true, manage_billing: true, manage_apps: true, manage_infrastructure: true, manage_master_keys: true, manage_projects: true, manage_constitution: true, view_analytics: true
  },
  product_manager: {
    manage_users: false, manage_billing: false, manage_apps: true, manage_infrastructure: false, manage_master_keys: false, manage_projects: true, manage_constitution: true, view_analytics: true
  },
  developer: {
    manage_users: false, manage_billing: false, manage_apps: true, manage_infrastructure: true, manage_master_keys: true, manage_projects: false, manage_constitution: false, view_analytics: true
  },
  editor: {
    manage_users: false, manage_billing: false, manage_apps: false, manage_infrastructure: false, manage_master_keys: false, manage_projects: true, manage_constitution: false, view_analytics: false
  },
  viewer: {
    manage_users: false, manage_billing: false, manage_apps: false, manage_infrastructure: false, manage_master_keys: false, manage_projects: false, manage_constitution: false, view_analytics: true
  },
  support: {
    manage_users: true, manage_billing: false, manage_apps: false, manage_infrastructure: false, manage_master_keys: false, manage_projects: false, manage_constitution: false, view_analytics: true
  }
};

const permissionLabels: Record<Permission, { es: string, en: string }> = {
  manage_users: { es: 'Gestionar Usuarios', en: 'Manage Users' },
  manage_billing: { es: 'Gestionar Facturación', en: 'Manage Billing' },
  manage_apps: { es: 'Gestionar Aplicaciones', en: 'Manage Apps' },
  manage_infrastructure: { es: 'Infraestructura (Despliegue)', en: 'Infrastructure (Deployment)' },
  manage_master_keys: { es: 'Llaves Maestras (API Keys)', en: 'Master Keys (API Keys)' },
  manage_projects: { es: 'Gestionar Proyectos', en: 'Manage Projects' },
  manage_constitution: { es: 'Editar Constitución', en: 'Edit Constitution' },
  view_analytics: { es: 'Ver Estadísticas', en: 'View Analytics' }
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
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          {currentLang === 'es' ? 'Roles y Permisos' : 'Roles & Permissions'}
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Actualizado</span>
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
