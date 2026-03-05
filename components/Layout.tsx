import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

import { Icons, INDUSTRIES, BRAND_IMAGES } from '../constants';
import { ImageLocation } from '../types';
import { Input } from './Input';
import { Button } from './Button';
import ManageProjectsModal from './ManageProjectsModal';
import { VersionDisplay } from './VersionDisplay';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate }) => {
  const { user, currentProject, adminHqProject, switchProject, createProject, logout, t, currentLang } = useAuth();
  const { interfaceTheme } = useTheme();
  const { hasUnsavedChanges: isDirty, setHasUnsavedChanges } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('solutium_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isManageProjectsModalOpen, setIsManageProjectsModalOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Scroll into view when expanded in non-collapsed sidebar
      if (!isSidebarCollapsed && dropdownRef.current) {
        setTimeout(() => {
          dropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, isSidebarCollapsed]);
  
  // Memoize branding images to avoid repeated localStorage access and parsing
  const brandingImages = React.useMemo(() => {
    let sourceProject = currentProject;

    // If we are not in admin-hq, we should fetch the admin-hq project to use its branding
    if (currentProject?.id !== 'admin-hq' && adminHqProject) {
      sourceProject = adminHqProject;
    }

    const getUrl = (location: ImageLocation): string => {
      // 1. Check source project's explicit mappings
      if (sourceProject?.imageMappings) {
        const mapping = sourceProject.imageMappings.find((m: any) => m.location === location);
        if (mapping && mapping.imageName) {
          const img = BRAND_IMAGES.find(i => i.name === mapping.imageName);
          if (img) return img.url;
        }
      }

      // 2. Check source project's legacy logoUrl
      if ((location === ImageLocation.MobileHeaderLogo || location === ImageLocation.SidebarLogo) && sourceProject?.logoUrl) {
          return sourceProject.logoUrl;
      }

      // 3. Fallback
      if (location === ImageLocation.MobileHeaderLogo) {
        // Always use colored logo for the white mobile header
        return BRAND_IMAGES.find(img => img.name === 'imagotipoColor')?.url || '';
      }
      if (location === ImageLocation.SidebarLogo) {
        return interfaceTheme.uiTheme === 'dark' 
          ? BRAND_IMAGES.find(img => img.name === 'imagotipoBlanco')?.url || '' 
          : BRAND_IMAGES.find(img => img.name === 'imagotipoColor')?.url || '';
      }
      if (location === ImageLocation.Favicon) {
        return BRAND_IMAGES.find(img => img.name === 'favicon')?.url || '';
      }
      return BRAND_IMAGES.find(img => img.name === 'imagotipoBlanco')?.url || '';
    };

    return {
      sidebarLogo: getUrl(ImageLocation.SidebarLogo),
      mobileLogo: getUrl(ImageLocation.MobileHeaderLogo),
      favicon: getUrl(ImageLocation.Favicon)
    };
  }, [currentProject, adminHqProject, interfaceTheme.uiTheme]);

  const getImageSrc = (location: ImageLocation): string => {
    if (location === ImageLocation.SidebarLogo) return brandingImages.sidebarLogo;
    if (location === ImageLocation.MobileHeaderLogo) return brandingImages.mobileLogo;
    if (location === ImageLocation.Favicon) return brandingImages.favicon;
    return brandingImages.sidebarLogo;
  };

  React.useEffect(() => {
    const faviconUrl = brandingImages.favicon;
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [brandingImages.favicon]);

  // Navigation Protection State
  const [pendingNavigation, setPendingNavigation] = useState<{ type: 'tab' | 'project' | 'logout', target: string } | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIndustry, setNewProjectIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('solutium_sidebar_collapsed', String(newState));
  };

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Icons.Grid },
    { id: 'my-apps', label: t.myApps, icon: Icons.Box },
    { id: 'assets', label: t.digitalAssets, icon: Icons.Folder },
    { id: 'portfolio', label: t.portfolio, icon: Icons.Store },
  ];

  if (user?.role === ('admin' as any)) {
    // Integrations moved to My Apps > Integrations tab
    navItems.push({ id: 'administration', label: t.administration || 'Administración', icon: Icons.Settings });
    navItems.push({ id: 'statistics', label: t.statistics || 'Estadísticas', icon: Icons.Activity });
  }

  const executeNavigation = (type: 'tab' | 'project' | 'logout', target: string) => {
      if (type === 'tab') {
          onNavigate(target);
      } else if (type === 'project') {
          switchProject(target);
      } else if (type === 'logout') {
          logout();
          localStorage.removeItem('solutium_active_tab');
      }
      setIsMobileMenuOpen(false);
      setIsProjectMenuOpen(false);
      setShowUnsavedModal(false);
      setPendingNavigation(null);
  };

  const handleDiscardAndNavigate = () => {
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
        executeNavigation(pendingNavigation.type, pendingNavigation.target);
    }
  };

  const handleSaveAndNavigate = async () => {
    // @ts-ignore
    if (typeof window.onSaveUnsavedChanges === 'function') {
      try {
        // @ts-ignore
        await window.onSaveUnsavedChanges();
      } catch (e) {
        console.error("Error saving changes", e);
      }
    }
    
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
        executeNavigation(pendingNavigation.type, pendingNavigation.target);
    }
  };

  const attemptNavigation = (type: 'tab' | 'project' | 'logout', target: string) => {
      if (isDirty) {
          setPendingNavigation({ type, target });
          setShowUnsavedModal(true);
      } else {
          executeNavigation(type, target);
      }
  };

  const handleCreateProjectClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (user?.role === ('admin' as any)) {
          alert(currentLang === 'es' ? "La cuenta maestra no puede crear proyectos adicionales." : "The master account cannot create additional projects.");
          return;
      }

      if (isDirty) {
          if(confirm(t.unsavedChanges)) {
             setHasUnsavedChanges(false);
             setShowCreateModal(true);
             setIsProjectMenuOpen(false);
          }
      } else {
          setShowCreateModal(true);
          setIsProjectMenuOpen(false);
      }
  };

  const handleCreateConfirm = () => {
      if (user?.subscriptionPlan === 'free' && user.projects.length >= 3) {
          alert(t.projectLimit + ". " + t.upgradeForMore);
          return;
      }

      if(!newProjectName.trim() || !newProjectIndustry) return;
      const finalIndustry = newProjectIndustry === 'Other' || newProjectIndustry === 'Otro' ? customIndustry : newProjectIndustry;
      createProject(newProjectName, finalIndustry);
      
      setNewProjectName('');
      setNewProjectIndustry('');
      setCustomIndustry('');
      setShowCreateModal(false);
      
      onNavigate('project-settings');
  };

  return (
    <div className={`h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 overflow-hidden ${interfaceTheme.uiStyle === 'windows' ? 'p-3 gap-3' : ''}`}
      style={{
        '--solutium-primary': interfaceTheme.colors.primary,
        '--solutium-secondary': interfaceTheme.colors.secondary,
        '--solutium-accent': interfaceTheme.colors.accent,
        '--solutium-bg': interfaceTheme.colors.background,
        '--solutium-text': interfaceTheme.colors.text,
        '--solutium-card': interfaceTheme.colors.card,
        '--solutium-border': interfaceTheme.colors.border,
        '--solutium-font': interfaceTheme.fontFamily || 'Inter, sans-serif',
        '--solutium-radius': interfaceTheme.borderRadius || '0.5rem',
        '--solutium-size': interfaceTheme.baseSize || '16px',
        '--sidebar-width': isSidebarCollapsed ? '80px' : '256px',
      } as React.CSSProperties}>
      <style>{`
        html, body {
            max-width: 100%;
            overflow-x: hidden;
        }
        body { 
            background-color: var(--solutium-bg); 
            color: var(--solutium-text); 
            font-family: var(--solutium-font);
            font-size: var(--solutium-size);
        }
        .rounded-lg, .rounded-xl, .rounded-md, .rounded-2xl {
            border-radius: var(--solutium-radius) !important;
        }
        .bg-solutium-dark { background-color: var(--solutium-primary) !important; }
        .text-solutium-dark { color: #1a1a1a !important; } /* Always dark for contrast on yellow/light backgrounds */
        .text-solutium-grey { color: var(--solutium-text) !important; opacity: 0.8; }
        .bg-solutium-blue { background-color: var(--solutium-primary) !important; }
        .text-solutium-blue { color: var(--solutium-primary) !important; }
        .border-solutium-blue { border-color: var(--solutium-primary) !important; }
        .hover\:bg-solutium-dark:hover { filter: brightness(0.8); }
        .bg-solutium-yellow { background-color: var(--solutium-accent) !important; }
        .text-solutium-yellow { color: var(--solutium-accent) !important; }

        /* Dynamic Theme Overrides */
        .bg-white { background-color: var(--solutium-card) !important; }
        .bg-slate-50 { background-color: var(--solutium-bg) !important; }
        .text-slate-900 { color: var(--solutium-text) !important; }
        .text-slate-800 { color: var(--solutium-text) !important; }
        .text-slate-700 { color: var(--solutium-text) !important; }
        .text-slate-600 { color: var(--solutium-text) !important; opacity: 0.9; }
        .text-slate-500 { color: var(--solutium-text) !important; opacity: 0.8; }
        .text-slate-400 { color: var(--solutium-text) !important; opacity: 0.7; }
        .text-slate-300 { color: var(--solutium-text) !important; opacity: 0.6; }
        .border-slate-200 { border-color: var(--solutium-border) !important; }
        .border-slate-100 { border-color: var(--solutium-border) !important; }
        
        /* Buttons and Inputs */
        button.bg-solutium-blue, button.bg-indigo-600 { 
            background-color: var(--solutium-primary) !important; 
            border-radius: var(--solutium-radius) !important;
        }
        input, select, textarea {
            border-radius: var(--solutium-radius) !important;
            font-family: var(--solutium-font) !important;
        }
        
        /* Ensure sidebar items have correct contrast in dark mode */
        .sidebar-item-active { color: #1a1a1a !important; }
        .sidebar-item-inactive { color: rgba(255, 255, 255, 0.7) !important; }
        .sidebar-item-inactive:hover { color: #ffffff !important; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1); }
      `}</style>

      {/* Mobile Header */}
      <div className="md:hidden bg-white text-slate-800 p-4 flex justify-between items-center shadow-sm border-b border-slate-200 z-30">
        <div className="flex items-center space-x-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <img 
                src={getImageSrc(ImageLocation.MobileHeaderLogo)} 
                alt="Logo" 
                className="h-8 w-auto object-contain" 
            />
        </div>
      </div>

      {/* Main Content Area (Sidebar + Main) */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Sidebar */}
        <aside 
          className={`fixed md:relative z-20 ${interfaceTheme.uiStyle === 'windows' ? 'bg-white text-slate-700 rounded-2xl shadow-sm' : 'bg-solutium-dark text-white h-full'} transition-all duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col ${interfaceTheme.uiStyle === 'windows' ? '' : 'shadow-2xl'} overflow-visible`}
          style={{ width: 'var(--sidebar-width)' }}
        >
          {/* Collapse Button */}
          <button 
            onClick={toggleSidebar}
            className={`hidden md:flex absolute -right-3 top-10 z-50 p-1 rounded-full border shadow-md transition-colors ${
              interfaceTheme.uiStyle === 'windows' 
                ? 'bg-white border-slate-200 text-slate-400 hover:text-solutium-blue' 
                : 'bg-solutium-dark border-white/20 text-white/60 hover:text-white'
            }`}
          >
            {isSidebarCollapsed ? <Icons.ChevronRight className="w-4 h-4" /> : <Icons.ChevronLeft className="w-4 h-4" />}
          </button>

        {/* Scrollable Content Wrapper */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col pb-20 md:pb-0">
          <div className={`hidden md:flex p-6 ${interfaceTheme.uiStyle === 'windows' ? 'border-b border-slate-100' : 'border-b border-white/10'} items-center justify-center min-h-[100px]`}>
            <div className={`flex-1 flex justify-center ${isSidebarCollapsed ? '' : 'md:justify-start'} overflow-hidden transition-all duration-300`}>
               <img 
                  src={getImageSrc(isSidebarCollapsed ? ImageLocation.Favicon : ImageLocation.SidebarLogo)} 
                  alt="Logo" 
                  className={`${isSidebarCollapsed ? 'h-8' : 'h-14'} w-auto object-contain max-w-full transition-all duration-300`} 
               />
            </div>
          </div>

          {/* Project Switcher */}
          <div className={`px-4 py-4 ${interfaceTheme.uiStyle === 'windows' ? 'border-b border-slate-100' : 'border-b border-white/10'} relative z-50`}>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <button 
                      onClick={() => {
                          if (user?.role !== ('admin' as any) && !isSidebarCollapsed) {
                              setIsProjectMenuOpen(!isProjectMenuOpen);
                          }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors border ${
                          interfaceTheme.uiStyle === 'windows' 
                            ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700' 
                            : `border-white/10 ${user?.role === ('admin' as any) ? 'bg-white/5 cursor-default' : 'bg-white/10 hover:bg-white/20 cursor-pointer'}`
                      }`}
                    >
                        <div className="flex items-center space-x-2 overflow-hidden">
                            <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${interfaceTheme.uiStyle === 'windows' ? 'bg-solutium-blue text-white' : 'bg-solutium-yellow text-solutium-dark'}`}>
                                {currentProject?.name.charAt(0).toUpperCase() || '+'}
                            </div>
                            {!isSidebarCollapsed && <span className="text-sm font-medium truncate text-left">{currentProject?.name || t.createProject}</span>}
                        </div>
                        {user?.role !== ('admin' as any) && !isSidebarCollapsed && (
                            <svg className={`w-4 h-4 shrink-0 ${interfaceTheme.uiStyle === 'windows' ? 'text-slate-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isProjectMenuOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                        )}
                    </button>

                    {isProjectMenuOpen && user?.role !== ('admin' as any) && !isSidebarCollapsed && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-30 ring-1 ring-black/5">
                          <div className="max-h-48 overflow-y-auto">
                            {user?.projects.map(p => (
                                <div key={p.id} className="group flex items-center justify-between text-left w-full px-4 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
                                    <button onClick={() => attemptNavigation('project', p.id)} className={`flex-1 truncate ${currentProject?.id === p.id ? 'font-bold text-solutium-blue' : ''}`}>
                                        {p.name}
                                    </button>
                                </div>
                            ))}
                          </div>
                          {user?.role !== ('admin' as any) && (
                            <div className="border-t border-slate-200 p-2 space-y-1">
                                <button 
                                  type="button"
                                  onClick={handleCreateProjectClick}
                                  className="w-full text-left px-3 py-1.5 text-sm text-solutium-blue font-medium hover:bg-blue-50 rounded-md flex items-center"
                                >
                                    <span className="mr-2">+</span> Nuevo proyecto
                                </button>
                            </div>
                          )}
                      </div>
                    )}
                </div>

                {!isSidebarCollapsed && (
                  <button 
                      onClick={() => attemptNavigation('tab', 'project-settings')}
                      className={`p-2.5 rounded-lg border transition-colors ${
                          interfaceTheme.uiStyle === 'windows'
                          ? (activeTab === 'project-settings' ? 'bg-[#0e7490] text-white border-[#0e7490]' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600')
                          : (activeTab === 'project-settings' ? 'bg-solutium-yellow text-solutium-dark border-solutium-yellow' : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20 hover:text-white')
                      }`}
                      title={t.projectSettings}
                  >
                      <Icons.Settings />
                  </button>
                )}
            </div>
        </div>

        <nav className="p-4 space-y-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            // Windows 11 Style Logic
            if (interfaceTheme.uiStyle === 'windows') {
                return (
                  <button
                    key={item.id}
                    onClick={() => attemptNavigation('tab', item.id)}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                      ? 'bg-[#0e7490] text-white shadow-md font-medium' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <div className="flex items-center space-x-3">
                        <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          <Icon />
                        </div>
                        {!isSidebarCollapsed && <span className="font-medium tracking-wide whitespace-nowrap">{item.label}</span>}
                    </div>
                    {isActive && !isSidebarCollapsed && (
                        <svg className="w-4 h-4 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                  </button>
                );
            }

            // Default Style Logic
            return (
              <button
                key={item.id}
                onClick={() => attemptNavigation('tab', item.id)}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                  ? 'bg-solutium-blue sidebar-item-active md:shadow-lg border-l-4 border-solutium-yellow' 
                  : 'sidebar-item-inactive md:hover:bg-white/5'
                }`}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <div className={`${isActive ? 'text-solutium-yellow' : 'opacity-60 group-hover:opacity-100'}`}>
                  <Icon />
                </div>
                {!isSidebarCollapsed && <span className="font-medium tracking-wide whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

          <div ref={dropdownRef} className={`p-4 ${interfaceTheme.uiStyle === 'windows' ? 'border-t border-slate-100 bg-slate-50' : 'border-t border-white/10 bg-black/20'} relative mt-auto`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-1'}`}>
                <div 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`flex-1 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-2 py-2 rounded-lg cursor-pointer transition-colors group ${
                        interfaceTheme.uiStyle === 'windows'
                        ? (activeTab === 'profile' || isProfileDropdownOpen ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-white hover:shadow-sm hover:border hover:border-slate-200 border border-transparent')
                        : (activeTab === 'profile' || isProfileDropdownOpen ? 'bg-white/10' : 'hover:bg-white/5')
                    }`}
                    title={isSidebarCollapsed ? user?.name : ''}
                >
                    <div className="w-9 h-9 rounded-full bg-slate-600 border border-slate-400 flex items-center justify-center text-sm font-bold text-white relative shrink-0 shadow-inner overflow-hidden">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.name.charAt(0).toUpperCase()
                        )}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-600 z-10"></div>
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="overflow-hidden flex flex-col justify-center">
                          <p className={`text-sm font-bold truncate transition-colors leading-tight ${interfaceTheme.uiStyle === 'windows' ? 'text-slate-700 group-hover:text-[#0e7490]' : 'text-white group-hover:text-solutium-yellow'}`}>{user?.name}</p>
                          <p className={`text-[10px] truncate font-medium leading-tight mt-0.5 ${interfaceTheme.uiStyle === 'windows' ? 'text-slate-400' : 'text-white/70'}`}>{user?.email}</p>
                      </div>
                    )}
                </div>
                
                {!isSidebarCollapsed && (
                  <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileDropdownOpen(!isProfileDropdownOpen);
                      }}
                      className={`p-2 rounded-lg transition-all ${
                          interfaceTheme.uiStyle === 'windows'
                          ? (isProfileDropdownOpen ? 'bg-slate-200 text-[#0e7490]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600')
                          : (isProfileDropdownOpen ? 'bg-white/20 text-solutium-yellow scale-110' : 'text-white/40 hover:bg-white/10 hover:text-white')
                      }`}
                      title="Opciones de cuenta"
                  >
                      <svg className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                  </button>
                )}
            </div>

            {/* Profile Options Accordion (Expanded Sidebar) */}
            <AnimatePresence>
                {!isSidebarCollapsed && isProfileDropdownOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="mt-3 space-y-1 border-t border-white/5 pt-2 overflow-hidden"
                    >
                        <button 
                            onClick={() => {
                                setIsProfileDropdownOpen(false);
                                attemptNavigation('tab', 'profile');
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors font-medium ${
                                interfaceTheme.uiStyle === 'windows'
                                ? 'text-slate-600 hover:bg-white hover:shadow-sm'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icons.User className="w-4 h-4" />
                            <span>Mi Perfil</span>
                        </button>
                        <button 
                            onClick={() => {
                                setIsProfileDropdownOpen(false);
                                attemptNavigation('logout', 'logout');
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors font-bold ${
                                interfaceTheme.uiStyle === 'windows'
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-red-400 hover:bg-red-500/10'
                            }`}
                        >
                            <Icons.LogOut className="w-4 h-4" />
                            <span>{t.signOut}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Options Popover (Collapsed Sidebar) */}
            <AnimatePresence>
                {isSidebarCollapsed && isProfileDropdownOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-full ml-2 w-64 mb-0 bg-white rounded-xl shadow-2xl overflow-hidden z-[100] border border-slate-200 ring-1 ring-black/10"
                    >
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center space-x-3">
                            {user?.avatarUrl && (
                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <div className="py-1">
                            <button 
                                onClick={() => {
                                    setIsProfileDropdownOpen(false);
                                    attemptNavigation('tab', 'profile');
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                            >
                                <Icons.User className="w-4 h-4" />
                                <span>Mi Perfil</span>
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button 
                                onClick={() => {
                                    setIsProfileDropdownOpen(false);
                                    attemptNavigation('logout', 'logout');
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                            >
                                <Icons.LogOut className="w-4 h-4" />
                                <span>{t.signOut}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Version Display */}
            {!isSidebarCollapsed && (
              <div className={`mt-3 pt-2 ${interfaceTheme.uiStyle === 'windows' ? 'border-t border-slate-200' : 'border-t border-white/5'} flex justify-center`}>
                  <VersionDisplay className={interfaceTheme.uiStyle === 'windows' ? 'text-slate-400 hover:text-slate-600' : 'text-white/30 hover:text-white/60'} />
              </div>
            )}
          </div>
        </div>
      </aside>

      <ManageProjectsModal 
        isOpen={isManageProjectsModalOpen} 
        onClose={() => setIsManageProjectsModalOpen(false)} 
        onNavigate={onNavigate} 
      />

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative ${interfaceTheme.uiStyle === 'windows' ? 'bg-white rounded-2xl shadow-sm' : 'bg-slate-50'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-solutium-blue/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-solutium-dark/80 z-10 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{t.createProject}</h3>
                
                {user?.subscriptionPlan === 'free' && user.projects.length >= 3 && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 flex items-start">
                        <span className="text-xl mr-2">⚠️</span>
                        <div className="text-sm text-amber-800">
                            <strong>{t.projectLimit}</strong><br/>
                            {t.upgradeForMore}
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <Input 
                        label={t.labelProjectName}
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder={t.phProjectName}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                              {t.labelCategory}
                        </label>
                        <select
                              value={newProjectIndustry}
                              onChange={(e) => setNewProjectIndustry(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                              <option value="" disabled>{t.wizSelectIndustry}</option>
                              {INDUSTRIES[currentLang].map((ind) => (
                                  <option key={ind} value={ind}>{ind}</option>
                              ))}
                        </select>
                    </div>
                    {(newProjectIndustry === 'Other' || newProjectIndustry === 'Otro') && (
                          <Input 
                            label={t.wizOtherIndustry}
                            value={customIndustry}
                            onChange={(e) => setCustomIndustry(e.target.value)}
                            placeholder={t.phIndustry}
                          />
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button 
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {t.cancel}
                    </button>
                    <button 
                        onClick={handleCreateConfirm}
                        disabled={!newProjectName.trim() || !newProjectIndustry || (user?.subscriptionPlan === 'free' && user.projects.length >= 3)}
                        className="px-4 py-2 bg-solutium-blue text-white rounded-lg hover:bg-solutium-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.create}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* UNSAVED CHANGES MODAL - REDESIGNED */}
      {showUnsavedModal && (
          <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 animate-scaleIn border-t-4 border-amber-400">
                  <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                      </div>
                      <h3 className="text-xl font-bold text-solutium-dark">
                          {t.unsavedTitle}
                      </h3>
                      <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                          {t.unsavedChanges}
                      </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                      <Button 
                          variant="primary"
                          onClick={handleSaveAndNavigate}
                          className="w-full justify-center"
                          size="lg"
                      >
                          {t.saveChanges}
                      </Button>
                      <Button 
                          variant="ghost"
                          onClick={() => setShowUnsavedModal(false)}
                          className="w-full justify-center border border-slate-200"
                          size="md"
                      >
                          {t.keepEditing}
                      </Button>
                      <Button 
                          variant="ghost"
                          onClick={handleDiscardAndNavigate}
                          className="w-full justify-center text-red-500 hover:text-red-700 hover:bg-red-50"
                          size="md"
                      >
                          {t.discardChanges}
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Layout;