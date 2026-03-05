import { supabase } from './supabaseClient';
import { ServiceApp, IconName, AppCategory } from '../types';

export const appService = {
  /**
   * Obtiene todas las aplicaciones registradas en la base de datos
   */
  async getApps(): Promise<ServiceApp[]> {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching apps from Supabase:', error);
      return [];
    }

    // Mapear los nombres de las columnas de la DB (snake_case) a las propiedades del objeto (camelCase)
    return (data || []).map(app => ({
      id: app.id,
      name: app.name,
      description: app.description,
      icon: (app.icon as IconName) || 'Code',
      url: app.url,
      category: (app.category as AppCategory) || 'Productividad',
      status: (app.status as ServiceApp['status']) || 'active',
      lifecycleStatus: (app.lifecycle_status as ServiceApp['lifecycleStatus']) || 'development',
      requiresPro: app.requires_pro || false,
      logoUrl: app.logo_url
    }));
  },

  /**
   * Registra una nueva aplicación en la base de datos
   */
  async registerApp(app: ServiceApp): Promise<{ data: any; error: any }> {
    const dbApp = {
      id: app.id,
      name: app.name,
      description: app.description,
      icon: typeof app.icon === 'string' ? app.icon : 'Code',
      url: app.url,
      category: app.category,
      status: app.status,
      lifecycle_status: app.lifecycleStatus,
      requires_pro: app.requiresPro,
      logo_url: app.logoUrl
    };

    return await supabase
      .from('apps')
      .insert([dbApp]);
  },

  /**
   * Elimina una aplicación de la base de datos
   */
  async deleteApp(id: string): Promise<{ error: any }> {
    return await supabase
      .from('apps')
      .delete()
      .eq('id', id);
  }
};
