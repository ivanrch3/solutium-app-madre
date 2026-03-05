/**
 * Global Config Service
 * Maneja la persistencia de las llaves de API y configuraciones maestras
 */

const STORAGE_KEY = 'solutium_global_config';

export interface GlobalConfig {
  googleClientId: string;
  googleApiKey: string;
  hubspotApiKey: string;
  stagingUrl: string;
}

const defaultConfig: GlobalConfig = {
  googleClientId: '',
  googleApiKey: '',
  hubspotApiKey: '',
  stagingUrl: ''
};

export const globalConfigService = {
  getConfig: (): GlobalConfig => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultConfig;
    try {
      return { ...defaultConfig, ...JSON.parse(saved) };
    } catch {
      return defaultConfig;
    }
  },

  saveConfig: (config: Partial<GlobalConfig>) => {
    const current = globalConfigService.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Disparar un evento personalizado para que otros componentes se enteren del cambio
    window.dispatchEvent(new Event('solutium_config_updated'));
    return updated;
  }
};
