/**
 * Storage Service
 * Centralizes all localStorage interactions to ensure consistency and type safety.
 */

import { UserProfile } from '../types';

const KEYS = {
  USER: 'solutium_user',
  USERS_DB: 'solutium_users_db',
  LAST_PROJECT: 'solutium_last_project',
  ACTIVE_TAB: 'solutium_active_tab',
  GENERATED_KITS: 'solutium_generated_kits',
  APP_LOGO: (appId: string) => `solutium_app_logo_${appId}`,
  APP_DESCRIPTION: (appId: string) => `solutium_app_description_${appId}`,
  APP_SCOPES: (appId: string) => `solutium_app_scopes_${appId}`,
  SATELLITE_URL: (appId: string) => `solutium_satellite_url_${appId}`,
  APP_STATUS: (appId: string) => `solutium_app_status_${appId}`,
  APP_BOOT_OBSERVER: (appId: string) => `solutium_app_boot_observer_${appId}`,
  SATELLITE_DATA: (projectId: string, appId: string) => `solutium_satellite_data_${projectId}_${appId}`,
  SATELLITE_DATA_INDEX: 'solutium_satellite_data_index',
};

export const storageService = {
  // User & Auth
  getUser: (): UserProfile | null => {
    const stored = localStorage.getItem(KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },
  setUser: (user: UserProfile | null) => {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  },

  // Users Database (Persistent across sessions)
  getUsersDb: (): Record<string, UserProfile> => {
    const stored = localStorage.getItem(KEYS.USERS_DB);
    return stored ? JSON.parse(stored) : {};
  },
  saveToUsersDb: (user: UserProfile) => {
    const db = storageService.getUsersDb();
    const key = user.role === 'guest' ? 'guest' : user.email;
    db[key] = user;
    localStorage.setItem(KEYS.USERS_DB, JSON.stringify(db));
  },

  // Project Tracking
  getLastProjectId: () => localStorage.getItem(KEYS.LAST_PROJECT),
  setLastProjectId: (id: string | null) => {
    if (id) {
      localStorage.setItem(KEYS.LAST_PROJECT, id);
    } else {
      localStorage.removeItem(KEYS.LAST_PROJECT);
    }
  },

  // Navigation
  getActiveTab: () => localStorage.getItem(KEYS.ACTIVE_TAB),
  setActiveTab: (tab: string | null) => {
    if (tab) {
      localStorage.setItem(KEYS.ACTIVE_TAB, tab);
    } else {
      localStorage.removeItem(KEYS.ACTIVE_TAB);
    }
  },

  // Satellite App Customizations
  getAppCustomizations: (appId: string) => {
    const bootObserverStr = localStorage.getItem(KEYS.APP_BOOT_OBSERVER(appId));
    return {
      logo: localStorage.getItem(KEYS.APP_LOGO(appId)),
      description: localStorage.getItem(KEYS.APP_DESCRIPTION(appId)),
      scopes: localStorage.getItem(KEYS.APP_SCOPES(appId)) 
        ? JSON.parse(localStorage.getItem(KEYS.APP_SCOPES(appId))!) 
        : null,
      customUrl: localStorage.getItem(KEYS.SATELLITE_URL(appId)),
      lifecycleStatus: localStorage.getItem(KEYS.APP_STATUS(appId)),
      enableBootObserver: bootObserverStr ? JSON.parse(bootObserverStr) : true // Default to true
    };
  },
  setAppLogo: (appId: string, url: string) => localStorage.setItem(KEYS.APP_LOGO(appId), url),
  setAppDescription: (appId: string, desc: string) => localStorage.setItem(KEYS.APP_DESCRIPTION(appId), desc),
  setAppScopes: (appId: string, scopes: string[]) => localStorage.setItem(KEYS.APP_SCOPES(appId), JSON.stringify(scopes)),
  setSatelliteUrl: (appId: string, url: string) => localStorage.setItem(KEYS.SATELLITE_URL(appId), url),
  setAppStatus: (appId: string, status: string) => localStorage.setItem(KEYS.APP_STATUS(appId), status),
  setAppBootObserver: (appId: string, enabled: boolean) => localStorage.setItem(KEYS.APP_BOOT_OBSERVER(appId), JSON.stringify(enabled)),
  
  // Satellite Data Storage (From Satellite to Mother)
  getSatelliteData: (projectId: string, appId: string) => {
    const stored = localStorage.getItem(KEYS.SATELLITE_DATA(projectId, appId));
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Handle legacy format (direct data) vs new format (wrapped with timestamp)
    return parsed.data || parsed;
  },
  saveSatelliteData: (projectId: string, appId: string, data: any, metadata?: any) => {
    const record = {
      timestamp: Date.now(),
      data: data,
      ...metadata
    };
    const key = KEYS.SATELLITE_DATA(projectId, appId);
    localStorage.setItem(key, JSON.stringify(record));

    // Update index
    const indexStr = localStorage.getItem(KEYS.SATELLITE_DATA_INDEX);
    const index: string[] = indexStr ? JSON.parse(indexStr) : [];
    if (!index.includes(key)) {
      index.push(key);
      localStorage.setItem(KEYS.SATELLITE_DATA_INDEX, JSON.stringify(index));
    }
  },

  deleteSatelliteData: (projectId: string, appId: string) => {
    const key = KEYS.SATELLITE_DATA(projectId, appId);
    localStorage.removeItem(key);

    // Update index
    const indexStr = localStorage.getItem(KEYS.SATELLITE_DATA_INDEX);
    if (indexStr) {
      const index: string[] = JSON.parse(indexStr);
      const newIndex = index.filter(k => k !== key);
      localStorage.setItem(KEYS.SATELLITE_DATA_INDEX, JSON.stringify(newIndex));
    }
  },
  
  // Retrieve all assets from all satellites, optionally filtered by project IDs
  getAllAssets: (allowedProjectIds?: string[]) => {
    const assets: any[] = [];
    
    // Fallback/Migration: If index doesn't exist, build it once
    let indexStr = localStorage.getItem(KEYS.SATELLITE_DATA_INDEX);
    let index: string[] = [];

    if (!indexStr) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('solutium_satellite_data_')) {
          index.push(key);
        }
      }
      localStorage.setItem(KEYS.SATELLITE_DATA_INDEX, JSON.stringify(index));
    } else {
      index = JSON.parse(indexStr);
    }

    // Iterate only over the indexed keys
    for (const key of index) {
      const parts = key.replace('solutium_satellite_data_', '').split('_');
      
      // Handle legacy keys (only projectId) vs new keys (projectId_appId)
      let projectId = parts[0];
      
      // Filter by project ID if provided
      if (allowedProjectIds && !allowedProjectIds.includes(projectId)) {
        continue;
      }

      let appId = parts.length > 1 ? parts.slice(1).join('_') : 'unknown-app';

      try {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          const raw = JSON.parse(itemStr);
          // Normalize structure
          if (raw.data && raw.timestamp) {
            assets.push({ projectId, appId, ...raw });
          } else {
            // Legacy/Fallback
            assets.push({ projectId, appId, data: raw, timestamp: Date.now() });
          }
        }
      } catch (e) {
        console.error('Error parsing asset', key, e);
      }
    }
    
    return assets.sort((a, b) => b.timestamp - a.timestamp);
  },

  // Kits
  getGeneratedKits: () => {
    const stored = localStorage.getItem(KEYS.GENERATED_KITS);
    return stored ? JSON.parse(stored) : [];
  },
  setGeneratedKits: (kits: any[]) => localStorage.setItem(KEYS.GENERATED_KITS, JSON.stringify(kits)),
  clearGeneratedKits: () => localStorage.removeItem(KEYS.GENERATED_KITS),
};
