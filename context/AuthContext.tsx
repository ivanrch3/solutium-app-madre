import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { UserProfile, Language, Project, TeamMember, ServiceApp, Customer, Product } from '../types';
import { SOLUTIUM_COLORS } from '../src/themes';
import { translations } from '../translations';
import { useNotification } from './NotificationContext';
import { storageService } from '../services/storageService';
import { supabase } from '../services/supabaseClient';
import { appService } from '../services/appService';
import { AVAILABLE_APPS } from '../constants';

interface AuthContextType {
  user: UserProfile | null;
  currentProject: Project | null;
  login: (email: string, name: string) => void;
  guestLogin: () => void;
  logout: () => void;
  
  // Project Methods
  duplicateProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  createProject: (name: string, industry?: string) => void;
  switchProject: (projectId: string) => void;
  updateProject: (projectId: string, data: Partial<Project>) => void;
  toggleProjectMember: (projectId: string, memberId: string) => void;
  
  // User/Team Methods
  updateProfile: (data: Partial<UserProfile>) => void;
  addTeamMember: (name: string, email: string, role: 'editor' | 'viewer' | 'super_admin' | 'support' | 'product_manager' | 'developer') => boolean; // Returns success
  removeTeamMember: (memberId: string) => void;

  installApp: (appId: string) => void; // Installs to CURRENT project
  uninstallApp: (appId: string) => void; // Uninstalls from CURRENT project
  
  registerCustomApp: (app: ServiceApp) => void;
  unregisterCustomApp: (appId: string) => void;
  
  setLanguage: (lang: Language) => void;
  
  t: typeof translations['en']; 
  currentLang: Language;
  isLoading: boolean;
  previewProjectUpdate: (data: Partial<Project>) => void;
  
  localMode: boolean;
  setLocalMode: (enabled: boolean) => void;

  // App Management
  availableApps: ServiceApp[];
  refreshApps: () => Promise<void>;

  // Centralized Customer Management
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string, businessId?: string) => void;
  addCustomersBatch: (customers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[]) => void;

  // Centralized Product Management
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  adminHqProject: Project | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showNotification } = useNotification();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('es'); 
  const [localMode, setLocalModeState] = useState<boolean>(storageService.getLocalMode());
  const [adminCustomApps, setAdminCustomApps] = useState<ServiceApp[]>([]);
  const [cachedAdminHqProject, setCachedAdminHqProject] = useState<Project | null>(null);
  const [availableApps, setAvailableApps] = useState<ServiceApp[]>(AVAILABLE_APPS);

  // --- PERSISTENCE HELPERS ---
  const saveUserToDb = useCallback((userToSave: UserProfile) => {
    storageService.saveToUsersDb(userToSave);
  }, []);

  const getUserFromDb = useCallback((email: string): UserProfile | null => {
    const db = storageService.getUsersDb();
    return db[email] || null;
  }, []);

  const refreshApps = useCallback(async () => {
    const apps = await appService.getApps();
    if (apps.length > 0) {
      setAvailableApps(apps);
    }
  }, []);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    
    if (!localMode) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            // Fetch projects for this user
            const { data: projectsData } = await supabase
              .from('projects')
              .select('*')
              .eq('owner_id', session.user.id);
            
            const mappedProjects: Project[] = (projectsData || []).map(p => ({
              id: p.id,
              name: p.name,
              brandColors: p.brand_colors,
              logoUrl: p.logo_url,
              contactInfo: p.contact_info,
              socials: [],
              installedAppIds: [],
              assignedMemberIds: [],
              createdAt: new Date(p.created_at).getTime(),
              products: []
            }));

            const fullUser: UserProfile = {
              id: session.user.id,
              name: profile.full_name || session.user.email?.split('@')[0] || 'Usuario',
              email: session.user.email || '',
              role: profile.role || (session.user.email === 'admin@solutium.app' ? 'admin' : 'user'),
              language: profile.language || 'es',
              subscriptionPlan: profile.subscription_tier || 'free',
              projects: mappedProjects,
              teamMembers: [],
              onboardingCompleted: true,
              uiStyle: 'windows',
              fontFamily: 'Inter',
              baseSize: '16px',
              borderRadius: '0.5rem',
              themePreference: 'default',
              activeTheme: 'fluent-light',
            };

            setUser(fullUser);
            if (fullUser.language) setLanguageState(fullUser.language as Language);
            
            if (mappedProjects.length > 0) {
              const lastProjectId = storageService.getLastProjectId();
              const projectToLoad = mappedProjects.find(p => p.id === lastProjectId) || mappedProjects[0];
              setCurrentProject(projectToLoad);
            }
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Supabase session check failed, falling back to local storage', error);
      }
    }

    // Fallback to local storage for demo/guest or Local Mode
    const existingUser = storageService.getUser();
    if (existingUser) {
      setUser(existingUser);
      if (existingUser.language) setLanguageState(existingUser.language);
      if (existingUser.projects && existingUser.projects.length > 0) {
        const lastProjectId = storageService.getLastProjectId();
        const projectToLoad = existingUser.projects.find((p: Project) => p.id === lastProjectId) || existingUser.projects[0];
        setCurrentProject(projectToLoad);
      }
    }
    setIsLoading(false);
  }, [localMode]);

  useEffect(() => {
    const loadAdminData = () => {
      const db = storageService.getUsersDb();
      const adminUser = db['admin@solutium.app'];
      if (adminUser) {
        setAdminCustomApps(adminUser.customApps || []);
        const hq = adminUser.projects?.find(p => p.id === 'admin-hq');
        if (hq) setCachedAdminHqProject(hq);
      }
    };
    loadAdminData();
    refreshApps();
    checkSession();

    if (!localMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
         if (session) {
             checkSession();
         } else {
             setUser(null);
             setCurrentProject(null);
         }
      });

      return () => subscription.unsubscribe();
    }
  }, [checkSession, refreshApps, localMode]);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      storageService.setUser(updated);
      saveUserToDb(updated);
      return updated;
    });
  }, [saveUserToDb]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    updateProfile({ language: lang });
  }, [updateProfile]);

  const setLocalMode = useCallback((enabled: boolean) => {
    setLocalModeState(enabled);
    storageService.setLocalMode(enabled);
    if (enabled) {
      showNotification('Modo Local activado: Supabase desactivado', 'info');
    } else {
      showNotification('Modo Servidor activado: Supabase activado', 'info');
    }
  }, [showNotification]);

  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (password && !localMode) {
        // Real Supabase Login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Legacy/Mock Login for dev or Local Mode
        const isExample = email === '';
        const finalEmail = isExample ? 'ejemplo@solutium.app' : email;
        const finalName = isExample ? 'Usuario de Ejemplo' : email.split('@')[0];

        const existingUser = getUserFromDb(finalEmail);
        
        if (existingUser) {
            setUser(existingUser);
            const lastProjectId = storageService.getLastProjectId();
            const projectToLoad = existingUser.projects.find(p => p.id === lastProjectId) || existingUser.projects[0];
            if (projectToLoad) {
                setCurrentProject(projectToLoad);
            }
            storageService.setUser(existingUser);
            setIsLoading(false);
            return;
        }

        const role = finalEmail === 'admin@solutium.app' ? 'admin' : 'user';
        const newUser: UserProfile = {
          id: crypto.randomUUID(),
          name: finalName,
          email: finalEmail,
          role: role,
          language: language,
          subscriptionPlan: role === 'admin' ? 'enterprise' : 'free',
          projects: [], 
          teamMembers: [],
          onboardingCompleted: true,
          uiStyle: 'windows',
          fontFamily: 'Inter',
          baseSize: '16px',
          borderRadius: '0.5rem',
          themePreference: 'default',
          activeTheme: 'fluent-light',
          coloredSidebarIcons: true,
        };
        
        setUser(newUser);
        storageService.setUser(newUser);
        saveUserToDb(newUser);
      }
    } catch (error: any) {
      showNotification(error.message || 'Error al iniciar sesión', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [getUserFromDb, language, saveUserToDb, showNotification]);

  const guestLogin = useCallback(() => {
    const db = storageService.getUsersDb();
    const adminUser = db['admin@solutium.app'];
    const adminCustomApps = adminUser?.customApps || [];

    const demoProject: Project = {
        id: 'demo-project',
        name: 'Proyecto Demo',
        industry: 'Otro',
        brandColors: [
            SOLUTIUM_COLORS.green, 
            SOLUTIUM_COLORS.violet, 
            SOLUTIUM_COLORS.blue, 
            SOLUTIUM_COLORS.deepGray, 
            SOLUTIUM_COLORS.darkGray, 
            SOLUTIUM_COLORS.lightGray
        ],
        socials: [],
        installedAppIds: ['invoicer'],
        assignedMemberIds: [],
        createdAt: Date.now(),
        products: []
    };

    const guestUser: UserProfile = {
      id: 'guest',
      name: 'Invitado',
      email: '',
      role: 'guest',
      language: language,
      subscriptionPlan: 'free',
      projects: [demoProject],
      teamMembers: [],
      onboardingCompleted: true,
      uiStyle: 'windows',
      fontFamily: 'Inter',
      baseSize: '16px',
      borderRadius: '0.5rem',
      themePreference: 'default',
      activeTheme: 'fluent-light',
      coloredSidebarIcons: true,
      customApps: adminCustomApps
    };
    setUser(guestUser);
    setCurrentProject(demoProject);
    storageService.setUser(guestUser);
  }, [language]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentProject(null);
    storageService.setLastProjectId(null);
    storageService.setActiveTab(null);
  }, []);

  const switchProject = useCallback((projectId: string) => {
      setUser(prev => {
          if (!prev) return null;
          const project = prev.projects.find(p => p.id === projectId);
          if (project) {
              setCurrentProject(project);
              storageService.setLastProjectId(project.id);
              showNotification(`${translations[language].projectSwitched || 'Proyecto cambiado'}: ${project.name}`, 'info');
          }
          return prev;
      });
  }, [language, showNotification]);

  const updateProject = useCallback((projectId: string, data: Partial<Project>) => {
      setUser(prev => {
          if (!prev) return null;
          const updatedProjects = prev.projects.map(p => 
              p.id === projectId ? { ...p, ...data } : p
          );
          const updatedUser = { ...prev, projects: updatedProjects };
          storageService.setUser(updatedUser);
          saveUserToDb(updatedUser);

          if (currentProject && currentProject.id === projectId) {
              setCurrentProject(prevProj => prevProj ? { ...prevProj, ...data } : null);
          }
          return updatedUser;
      });
  }, [currentProject, saveUserToDb]);

  const duplicateProject = useCallback((projectId: string) => {
    setUser(prev => {
        if (!prev) return null;
        const projectToDuplicate = prev.projects.find(p => p.id === projectId);
        if (!projectToDuplicate) return prev;

        const newProject: Project = {
          ...projectToDuplicate,
          id: crypto.randomUUID(),
          name: `${projectToDuplicate.name} (Copia)`,
          createdAt: Date.now(),
        };

        const updatedProjects = [...prev.projects, newProject];
        const updatedUser = { ...prev, projects: updatedProjects };
        storageService.setUser(updatedUser);
        saveUserToDb(updatedUser);
        
        setCurrentProject(newProject);
        storageService.setLastProjectId(newProject.id);
        showNotification(`${translations[language].projectDuplicated}: ${newProject.name}`, 'success');
        return updatedUser;
    });
  }, [language, saveUserToDb, showNotification]);

  const deleteProject = useCallback((projectId: string) => {
    setUser(prev => {
        if (!prev) return null;
        const updatedProjects = prev.projects.filter(p => p.id !== projectId);
        const updatedUser = { ...prev, projects: updatedProjects };
        storageService.setUser(updatedUser);
        saveUserToDb(updatedUser);

        if (currentProject && currentProject.id === projectId) {
          const newCurrentProject = updatedProjects.length > 0 ? updatedProjects[0] : null;
          setCurrentProject(newCurrentProject);
          storageService.setLastProjectId(newCurrentProject?.id || null);
        }
        showNotification(translations[language].projectDeleted, 'success');
        return updatedUser;
    });
  }, [currentProject, language, saveUserToDb, showNotification]);

  const createProject = useCallback((name: string, industry?: string) => {
      setUser(prev => {
          if (!prev) return null;
          const masterProject = prev.projects.find(p => p.id === 'admin-hq');
          const newProject: Project = {
              id: crypto.randomUUID(),
              name,
              industry,
              brandColors: masterProject?.brandColors || [
                  SOLUTIUM_COLORS.green, 
                  SOLUTIUM_COLORS.violet, 
                  SOLUTIUM_COLORS.blue, 
                  SOLUTIUM_COLORS.deepGray, 
                  SOLUTIUM_COLORS.darkGray, 
                  SOLUTIUM_COLORS.lightGray
              ],
              logoUrl: masterProject?.logoUrl,
              imageMappings: masterProject?.imageMappings,
              socials: [],
              installedAppIds: [],
              assignedMemberIds: [],
              customers: [],
              createdAt: Date.now()
          };

          const updatedProjects = [...prev.projects, newProject];
          const updatedUser = { ...prev, projects: updatedProjects };
          storageService.setUser(updatedUser);
          saveUserToDb(updatedUser);
          
          setCurrentProject(newProject);
          storageService.setLastProjectId(newProject.id);
          storageService.setActiveTab('project-settings');
          showNotification(translations[language].projectCreated, 'success');
          return updatedUser;
      });
  }, [language, saveUserToDb, showNotification]);

  const addTeamMember = useCallback((name: string, email: string, role: 'editor' | 'viewer' | 'super_admin' | 'support' | 'product_manager' | 'developer') => {
      let success = false;
      setUser(prev => {
          if (!prev) return null;
          const limit = prev.subscriptionPlan === 'free' ? 0 : (prev.subscriptionPlan === 'pro' ? 5 : 999);
          if (prev.teamMembers.length >= limit) return prev;

          const newMember: TeamMember = {
              id: crypto.randomUUID(),
              name,
              email,
              role,
              status: 'pending'
          };

          const updatedMembers = [...prev.teamMembers, newMember];
          const updatedUser = { ...prev, teamMembers: updatedMembers };
          storageService.setUser(updatedUser);
          saveUserToDb(updatedUser);
          success = true;
          return updatedUser;
      });
      return success;
  }, [saveUserToDb]);

  const removeTeamMember = useCallback((memberId: string) => {
      updateProfile({ teamMembers: user?.teamMembers.filter(m => m.id !== memberId) || [] });
  }, [updateProfile, user?.teamMembers]);

  const toggleProjectMember = useCallback((projectId: string, memberId: string) => {
      const project = user?.projects.find(p => p.id === projectId);
      if (!project) return;

      let newMemberIds = [...(project.assignedMemberIds || [])];
      if (newMemberIds.includes(memberId)) {
          newMemberIds = newMemberIds.filter(id => id !== memberId);
      } else {
          newMemberIds.push(memberId);
      }

      updateProject(projectId, { assignedMemberIds: newMemberIds });
  }, [updateProject, user?.projects]);

  const installApp = useCallback((appId: string) => {
    if (!currentProject) return;
    const updatedIds = [...currentProject.installedAppIds, appId];
    updateProject(currentProject.id, { installedAppIds: updatedIds });
  }, [currentProject, updateProject]);

  const uninstallApp = useCallback((appId: string) => {
    if (!currentProject) return;
    const updatedIds = currentProject.installedAppIds.filter(id => id !== appId);
    updateProject(currentProject.id, { installedAppIds: updatedIds });
  }, [currentProject, updateProject]);

  const registerCustomApp = useCallback(async (app: ServiceApp) => {
    if (!user) return;
    
    // Si es admin, registrar globalmente en Supabase
    if (user.role === 'admin') {
      const { error } = await appService.registerApp(app);
      if (!error) {
        showNotification('Aplicación registrada globalmente', 'success');
        refreshApps();
        return;
      }
    }

    // Si no es admin o falló el registro global, registrar localmente para el usuario
    const currentCustom = user.customApps || [];
    if (currentCustom.find(a => a.id === app.id)) return;
    updateProfile({ customApps: [...currentCustom, { ...app, isCustom: true, lifecycleStatus: app.lifecycleStatus || 'development', tags: app.tags || [] }] });
  }, [updateProfile, user, refreshApps, showNotification]);

  const unregisterCustomApp = useCallback(async (appId: string) => {
    if (!user) return;

    // Si es admin, intentar eliminar globalmente
    if (user.role === 'admin') {
      const { error } = await appService.deleteApp(appId);
      if (!error) {
        showNotification('Aplicación eliminada globalmente', 'info');
        refreshApps();
        return;
      }
    }

    const updatedCustom = (user.customApps || []).filter(a => a.id !== appId);
    const updatedProjects = user.projects.map(p => ({
        ...p,
        installedAppIds: p.installedAppIds.filter(id => id !== appId)
    }));
    updateProfile({ projects: updatedProjects, customApps: updatedCustom });
    showNotification(translations[language].appUnregistered || 'Aplicación eliminada del registro', 'info');
  }, [language, showNotification, updateProfile, user, refreshApps]);

  const previewProjectUpdate = useCallback((data: Partial<Project>) => {
    setCurrentProject(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const customers = useMemo((): Customer[] => {
    if (!user || !currentProject) return [];
    const allCustomers = user.projects.flatMap(p => p.customers || []);
    return allCustomers.filter(c => 
      c.businessId === currentProject.id || 
      c.visibility === 'all' || 
      (c.visibility === 'multiple' && c.assignedBusinessIds?.includes(currentProject.id))
    );
  }, [currentProject, user]);

  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentProject) return;
    const newCustomer: Customer = {
      ...customerData,
      id: crypto.randomUUID(),
      businessId: currentProject.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      visibility: customerData.visibility || 'single',
      assignedBusinessIds: customerData.assignedBusinessIds || []
    };
    const updatedCustomers = [...(currentProject.customers || []), newCustomer];
    updateProject(currentProject.id, { customers: updatedCustomers });
    showNotification('Cliente añadido con éxito', 'success');
  }, [currentProject, showNotification, updateProject]);

  const updateCustomer = useCallback((updatedCustomer: Customer) => {
    const ownerProjectId = updatedCustomer.businessId || currentProject?.id;
    if (!ownerProjectId) return;
    const ownerProject = user?.projects.find(p => p.id === ownerProjectId);
    if (!ownerProject) return;
    const updatedCustomers = (ownerProject.customers || []).map(c => 
      c.id === updatedCustomer.id ? { ...updatedCustomer, updatedAt: Date.now() } : c
    );
    updateProject(ownerProjectId, { customers: updatedCustomers });
    showNotification('Cliente actualizado con éxito', 'success');
  }, [currentProject?.id, showNotification, updateProject, user?.projects]);

  const deleteCustomer = useCallback((customerId: string, businessId?: string) => {
    const ownerProjectId = businessId || currentProject?.id;
    if (!ownerProjectId) return;
    const ownerProject = user?.projects.find(p => p.id === ownerProjectId);
    if (!ownerProject) return;
    const updatedCustomers = (ownerProject.customers || []).filter(c => c.id !== customerId);
    updateProject(ownerProjectId, { customers: updatedCustomers });
    showNotification('Cliente eliminado con éxito', 'success');
  }, [currentProject?.id, showNotification, updateProject, user?.projects]);

  const addCustomersBatch = useCallback((customersData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (!currentProject) return;
    const newCustomers: Customer[] = customersData.map(c => ({
      ...c,
      id: crypto.randomUUID(),
      businessId: currentProject.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      visibility: c.visibility || 'single',
      assignedBusinessIds: c.assignedBusinessIds || []
    }));
    const updatedCustomers = [...(currentProject.customers || []), ...newCustomers];
    updateProject(currentProject.id, { customers: updatedCustomers });
    showNotification(`${newCustomers.length} clientes importados con éxito`, 'success');
  }, [currentProject, showNotification, updateProject]);

  const products = useMemo((): Product[] => {
    return currentProject?.products || [];
  }, [currentProject?.products]);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentProject) return;
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      businessId: currentProject.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updatedProducts = [...(currentProject.products || []), newProduct];
    updateProject(currentProject.id, { products: updatedProducts });
    showNotification('Producto/Servicio agregado con éxito', 'success');
  }, [currentProject, showNotification, updateProject]);

  const updateProduct = useCallback((updatedProduct: Product) => {
    if (!currentProject) return;
    const updatedProducts = (currentProject.products || []).map(p => 
      p.id === updatedProduct.id ? { ...updatedProduct, updatedAt: Date.now() } : p
    );
    updateProject(currentProject.id, { products: updatedProducts });
    showNotification('Producto/Servicio actualizado con éxito', 'success');
  }, [currentProject, showNotification, updateProject]);

  const deleteProduct = useCallback((productId: string) => {
    if (!currentProject) return;
    const updatedProducts = (currentProject.products || []).filter(p => p.id !== productId);
    updateProject(currentProject.id, { products: updatedProducts });
    showNotification('Producto/Servicio eliminado', 'info');
  }, [currentProject, showNotification, updateProject]);

  const t = useMemo(() => translations[language], [language]);

  const adminHqProject = useMemo(() => {
    if (user?.role === 'admin') {
      return user.projects.find(p => p.id === 'admin-hq') || null;
    }
    return cachedAdminHqProject;
  }, [user, cachedAdminHqProject]);

  const contextValue = useMemo(() => {
    let effectiveUser = user;
    if (user && user.role !== 'admin') {
      if (adminCustomApps.length > 0) {
        const userCustomApps = user.customApps || [];
        const adminApps = adminCustomApps.filter(adminApp => !userCustomApps.some(c => c.id === adminApp.id));
        effectiveUser = {
          ...user,
          customApps: [...userCustomApps, ...adminApps]
        };
      }
    }

    return {
      user: effectiveUser, 
      currentProject, 
      adminHqProject,
      login, 
      guestLogin, 
      logout, 
      updateProfile, 
      duplicateProject,
      deleteProject,
      createProject,
      switchProject,
      updateProject,
      toggleProjectMember,
      addTeamMember,
      removeTeamMember,
      installApp,
      uninstallApp,
      registerCustomApp,
      unregisterCustomApp,
      availableApps,
      refreshApps,
      setLanguage, 
      t, 
      currentLang: language, 
      isLoading, 
      localMode,
      setLocalMode,
      previewProjectUpdate,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addCustomersBatch,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
    };
  }, [
    user, currentProject, adminHqProject, adminCustomApps, login, guestLogin, logout, updateProfile, duplicateProject,
    deleteProject, createProject, switchProject, updateProject, toggleProjectMember,
    addTeamMember, removeTeamMember, installApp, uninstallApp, registerCustomApp,
    unregisterCustomApp, setLanguage, t, language, isLoading, localMode, setLocalMode, previewProjectUpdate,
    customers, addCustomer, updateCustomer, deleteCustomer, addCustomersBatch,
    products, addProduct, updateProduct, deleteProduct
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};