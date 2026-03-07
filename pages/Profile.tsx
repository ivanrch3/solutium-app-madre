import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Input } from '../components/Input';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Tabs } from '../components/Tabs';
import { InvitationPanel } from '../components/InvitationPanel';
import { TeamManagementPanel } from '../components/TeamManagementPanel';
import { SOLUTIUM_THEMES, SOLUTIUM_COLORS } from '../src/themes';
import { ThemeName, ImageLocation, ImageMapping } from '../types';
import { Icons, BRAND_IMAGES, DEFAULT_IMAGE_MAPPING } from '../constants';

const Profile: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, updateProfile, t, setLanguage, currentLang, currentProject, updateProject, previewProjectUpdate, deleteProject, duplicateProject, switchProject } = useAuth();
  const { setHasUnsavedChanges } = useNavigation();
  const [activeTab, setActiveTab] = useState<'general' | 'preferences' | 'team' | 'identidad' | 'administrar'>('general');
  const [teamSubTab, setTeamSubTab] = useState<'invitations' | 'roles'>('invitations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  
  // Account Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    newPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Identity Form State (for Master App)
  const [logoUrl, setLogoUrl] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [imageMappings, setImageMappings] = useState<ImageMapping[]>(DEFAULT_IMAGE_MAPPING);
  const [isIdentitySaved, setIsIdentitySaved] = useState(false);

  useEffect(() => {
      if (currentProject?.id === 'admin-hq') {
          setLogoUrl(currentProject.logoUrl || '');
          if (currentProject.brandColors) {
              setColors(currentProject.brandColors);
          } else {
              setColors([SOLUTIUM_COLORS.green, SOLUTIUM_COLORS.violet, SOLUTIUM_COLORS.blue, SOLUTIUM_COLORS.deepGray, SOLUTIUM_COLORS.darkGray, SOLUTIUM_COLORS.lightGray]);
          }
          if (currentProject.imageMappings) {
              setImageMappings(currentProject.imageMappings);
          }
      }
  }, [currentProject]);

  const handleIdentityChange = (setter: React.Dispatch<any>, value: any, fieldName?: string) => {
      setter(value);
      setIsIdentitySaved(false);
      setIsDirty(true);
      if (fieldName && fieldName in currentProject!) {
          previewProjectUpdate({ [fieldName]: value });
      }
  };

  const handleImageMappingChange = (location: ImageLocation, imageName: string) => {
      const newMappings = [...imageMappings];
      const existingIndex = newMappings.findIndex(m => m.location === location);
      if (existingIndex >= 0) {
          newMappings[existingIndex].imageName = imageName;
      } else {
          newMappings.push({ location, imageName });
      }
      setImageMappings(newMappings);
      setIsIdentitySaved(false);
      previewProjectUpdate({ imageMappings: newMappings });
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (currentProject) {
          updateProject(currentProject.id, {
              logoUrl,
              brandColors: colors,
              imageMappings
          });
          setIsIdentitySaved(true);
          setIsDirty(false);
          setTimeout(() => setIsIdentitySaved(false), 3000);
      }
  };

  const handleColorChange = (index: number, newColor: string) => {
      const newColors = [...colors];
      newColors[index] = newColor;
      handleIdentityChange(setColors, newColors, 'brandColors');
  };

  // Team Form State
  const [isSaved, setIsSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
      setHasUnsavedChanges(isDirty);
      
      // @ts-ignore
      window.onSaveUnsavedChanges = () => {
          if (activeTab === 'general') {
              updateProfile({ name: formData.name, phone: formData.phone, avatarUrl: avatarPreview });
          } else if (activeTab === 'identidad' && currentProject) {
              updateProject(currentProject.id, {
                  logoUrl,
                  brandColors: colors,
                  imageMappings
              });
          }
          setIsDirty(false);
      };

      return () => {
          // @ts-ignore
          window.onSaveUnsavedChanges = undefined;
          setHasUnsavedChanges(false);
      };
  }, [isDirty, activeTab, formData, logoUrl, colors, imageMappings, currentProject?.id, updateProfile, updateProject, setHasUnsavedChanges]);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setIsSaved(false);
    setIsDirty(true);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: formData.name, phone: formData.phone, avatarUrl: avatarPreview });
    // Password change logic would be API call here
    setIsSaved(true);
    setIsDirty(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isAdmin = user?.role && ['admin', 'super_admin', 'product_manager', 'developer', 'editor', 'viewer', 'support'].includes(user.role);

  return (
    <>
      <div className="max-w-5xl">
      <header className="mb-8">
          <h2 className="text-3xl font-bold text-solutium-dark">{t.profile}</h2>
          <p className="text-solutium-grey mt-1">{t.accountOverview}</p>
      </header>

      <Tabs 
        options={[
          { id: 'general', label: t.generalTab || 'Perfil' },
          ...(isAdmin ? [
            { id: 'identidad', label: t.identityTab || 'Identidad' },
            { id: 'team', label: t.teamTab || 'Equipo' }
          ] : []),
          ...(!isAdmin ? [
            { id: 'preferences', label: t.preferencesTab || 'Preferencias' },
            { id: 'administrar', label: 'Administrar' }
          ] : [])
        ]}
        activeTab={activeTab}
        onChange={(id: string) => setActiveTab(id as any)}
        style="primary"
        className="mb-8"
      />

      {activeTab === 'general' ? (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <form onSubmit={handleAccountSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* Avatar Upload Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-100">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <Icons.User className="w-10 h-10 text-slate-300" />
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                        <Icons.Upload className="w-6 h-6" />
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </label>
                </div>
                <div className="text-center md:text-left">
                    <h4 className="font-bold text-slate-800">{t.profilePhoto || 'Foto de Perfil'}</h4>
                    <p className="text-xs text-slate-500 mt-1">{t.profilePhotoDesc || 'Sube una imagen cuadrada para mejores resultados.'}</p>
                    <div className="flex gap-4 mt-3">
                        <label className="text-xs font-bold text-solutium-blue hover:underline cursor-pointer">
                            {t.changePhoto || 'Cambiar foto'}
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </label>
                        {avatarPreview && (
                            <button 
                                type="button"
                                onClick={() => {
                                    setAvatarPreview('');
                                    setIsDirty(true);
                                }}
                                className="text-xs font-bold text-red-500 hover:underline"
                            >
                                {t.removePhoto || 'Eliminar'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                label={t.labelName} 
                name="name" 
                value={formData.name} 
                onChange={handleAccountChange} 
                />
                <Input 
                label={t.labelPhone} 
                name="phone" 
                value={formData.phone} 
                onChange={handleAccountChange} 
                placeholder="+1 (555) 000-0000"
                />
                <Input 
                label={t.labelEmail} 
                name="email" 
                type="email"
                value={formData.email} 
                readOnly 
                className="bg-slate-100 cursor-not-allowed"
                />
                 {/* Language Selector */}
                 <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t.lang}
                    </label>
                    <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        <button 
                            type="button"
                            onClick={() => setLanguage('es')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentLang === 'es' ? 'bg-white shadow text-solutium-blue' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Español
                        </button>
                        <button 
                            type="button"
                            onClick={() => setLanguage('en')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentLang === 'en' ? 'bg-white shadow text-solutium-blue' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            English
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">{t.security}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                        label={t.currentPassword} 
                        name="password" 
                        type="password"
                        placeholder="••••••"
                        value={formData.password}
                        onChange={handleAccountChange}
                    />
                    <Input 
                        label={t.newPassword} 
                        name="newPassword" 
                        type="password"
                        placeholder="••••••"
                        value={formData.newPassword}
                        onChange={handleAccountChange}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-4">
                    <span className={`text-sm text-green-600 font-medium transition-opacity ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                    {t.saved}
                    </span>
                </div>
                <button 
                type="submit"
                className="px-6 py-2 bg-solutium-blue hover:bg-solutium-dark text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                {t.save}
                </button>
            </div>
            </form>
          </div>
        </div>
      ) : activeTab === 'preferences' ? (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">{t.uiPreferences || 'Preferencias de Interfaz'}</h3>
                <p className="text-sm text-slate-500 mb-6">{t.uiPreferencesDesc || 'Personaliza cómo se ve tu plataforma Solutium. Estos cambios solo afectan a tu vista personal.'}</p>
                
                {/* 1. UI Style Selector (Windows vs Solutium) */}
                <div className="mb-8">
                    <label className="block text-sm font-bold text-solutium-text mb-3 uppercase tracking-tight">
                        {t.uiStyleLabel || 'Estilo de Interfaz'}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => updateProfile({ uiStyle: 'windows' })}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                user?.uiStyle === 'windows' 
                                ? 'border-solutium-blue bg-blue-50/50 ring-1 ring-solutium-blue' 
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-900">{t.uiStyleWindows || 'Windows 11 (Nativo)'}</span>
                                {user?.uiStyle === 'windows' && <div className="w-3 h-3 rounded-full bg-solutium-blue"></div>}
                            </div>
                            <p className="text-xs text-slate-500">Estilo limpio, moderno y familiar. Optimizado para productividad.</p>
                        </button>

                        <button
                            onClick={() => updateProfile({ uiStyle: 'solutium' })}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                user?.uiStyle === 'solutium' 
                                ? 'border-solutium-blue bg-blue-50/50 ring-1 ring-solutium-blue' 
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-900">{t.uiStyleSolutium || 'Solutium (Creativo)'}</span>
                                {user?.uiStyle === 'solutium' && <div className="w-3 h-3 rounded-full bg-solutium-blue"></div>}
                            </div>
                            <p className="text-xs text-slate-500">Estilo personalizado con temas de color y tipografías flexibles.</p>
                        </button>
                    </div>
                </div>

                {/* 2. Theme Selection (Only visible if NOT Windows style) */}
                {user?.uiStyle === 'solutium' && (
                    <div className="mb-8 animate-fadeIn">
                        <label className="block text-sm font-bold text-solutium-text mb-3 uppercase tracking-tight">
                            {t.themeSelection || 'Selección de Tema'}
                        </label>
                        
                        {/* Theme Mode Selector */}
                        <div className="flex bg-slate-100 p-1 rounded-lg w-fit mb-4">
                            <button 
                                onClick={() => setThemeMode('light')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${themeMode === 'light' ? 'bg-white shadow text-solutium-blue' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t.themeLight || 'Claros'}
                            </button>
                            <button 
                                onClick={() => setThemeMode('dark')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${themeMode === 'dark' ? 'bg-white shadow text-solutium-blue' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {t.themeDark || 'Oscuros'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {SOLUTIUM_THEMES.filter(t => t.uiTheme === themeMode).map((theme) => {
                            const isActive = user?.activeTheme === theme.name;
                            return (
                                <button
                                key={theme.name}
                                type="button"
                                onClick={() => {
                                    updateProfile({ activeTheme: theme.name as ThemeName });
                                }}
                                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                                    isActive 
                                    ? 'border-solutium-blue ring-2 ring-solutium-blue/20' 
                                    : 'border-slate-100 hover:border-slate-200'
                                }`}
                                style={{
                                    backgroundColor: isActive 
                                    ? theme.colors.card 
                                    : (theme.uiTheme === 'dark' ? SOLUTIUM_COLORS.deepGray : theme.colors.card),
                                    color: isActive 
                                    ? '#FFFFFF' 
                                    : theme.colors.text 
                                }}
                                >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold leading-tight">{theme.displayName}</span>
                                    {isActive && (
                                    <div className="bg-solutium-blue text-white rounded-full p-0.5">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    )}
                                </div>
                                <div className="space-y-2 opacity-80">
                                    <div className="flex gap-1">
                                    <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                                    <div className="h-1.5 w-3 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
                                    </div>
                                    <div className="h-6 w-full rounded" style={{ backgroundColor: theme.colors.background, border: `1px solid ${theme.colors.border}` }}></div>
                                </div>
                                </button>
                            );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. Typography (Only visible if NOT Windows style) */}
                {user?.uiStyle === 'solutium' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-bold text-solutium-text mb-3 uppercase tracking-tight">
                                {t.typographyLabel || 'Tipografía'}
                            </label>
                            <select
                                value={user?.fontFamily || 'Inter'}
                                onChange={(e) => updateProfile({ fontFamily: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-solutium-blue outline-none"
                            >
                                <option value="Inter">Inter (Estándar)</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Open Sans">Open Sans</option>
                                <option value="Lato">Lato</option>
                                <option value="Montserrat">Montserrat</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* 4. Sidebar Icons Color Toggle */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                    <label className="block text-sm font-bold text-solutium-text mb-3 uppercase tracking-tight">
                        Iconos del Panel Lateral
                    </label>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <div>
                            <p className="font-bold text-slate-900">Iconos Elaborados</p>
                            <p className="text-xs text-slate-500">Muestra los iconos del menú lateral con un diseño más detallado, colorido y moderno en lugar de la versión minimalista en gris.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={user?.coloredSidebarIcons !== false}
                                onChange={(e) => updateProfile({ coloredSidebarIcons: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-solutium-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solutium-blue"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
      ) : activeTab === 'identidad' && user?.role === ('admin' as any) ? (
        <div className="space-y-8 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Identidad de la App Maestra</h3>
                
                <form onSubmit={handleIdentitySubmit} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <label className="block text-sm font-medium text-solutium-text mb-4">Logos y Recursos Gráficos</label>
                            <div className="space-y-4">
                                {BRAND_IMAGES.map((img) => (
                                    <div key={img.name} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg bg-slate-50">
                                        <div className="w-16 h-16 bg-transparent rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <img src={img.url} alt={img.displayName} className="max-w-full max-h-full object-contain p-1" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{img.displayName}</p>
                                            <a href={img.url} target="_blank" rel="noopener noreferrer" className="text-xs text-solutium-blue hover:underline truncate block">
                                                {img.url}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex-1 space-y-8">
                            <div className="w-full flex flex-col">
                                <label className="block text-sm font-medium text-solutium-text mb-4">
                                    Paleta Maestra (6 colores)
                                </label>
                                <div className="grid grid-cols-6 gap-4">
                                    {colors.slice(0, 6).map((color, idx) => (
                                        <div key={idx} className="flex flex-col items-center">
                                            <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shadow-sm relative group cursor-pointer hover:border-solutium-blue transition-colors">
                                                <input 
                                                    type="color" 
                                                    value={color || '#000000'}
                                                    onChange={(e) => handleColorChange(idx, e.target.value)}
                                                    className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] p-0 border-0 cursor-pointer"
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-2 uppercase font-mono font-bold">{color}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">CONFIGURACIÓN DE IMÁGENES DE MARCA</h4>
                        <div className="space-y-4">
                            {Object.values(ImageLocation).map((location) => {
                                const currentMapping = imageMappings.find(m => m.location === location);
                                const currentImageName = currentMapping?.imageName || '';
                                const currentImage = BRAND_IMAGES.find(img => img.name === currentImageName);
                                
                                // Format label from camelCase to Title Case
                                const label = location.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                return (
                                    <div key={location} className="flex items-center gap-4">
                                        <label className="w-48 text-sm font-medium text-slate-700">{label}</label>
                                        <select
                                            value={currentImageName}
                                            onChange={(e) => handleImageMappingChange(location, e.target.value)}
                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solutium-blue outline-none bg-white"
                                        >
                                            <option value="">Seleccionar Imagen</option>
                                            {BRAND_IMAGES.map(img => (
                                                <option key={img.name} value={img.name}>{img.displayName}</option>
                                            ))}
                                        </select>
                                        <div className="w-12 h-12 border border-slate-200 rounded-lg flex items-center justify-center bg-transparent overflow-hidden flex-shrink-0">
                                            {currentImage ? (
                                                <img src={currentImage.url} alt={currentImage.displayName} className="max-w-full max-h-full object-contain p-1" />
                                            ) : (
                                                <span className="text-xs text-slate-300">N/A</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className={`text-sm text-green-600 font-medium transition-opacity ${isIdentitySaved ? 'opacity-100' : 'opacity-0'}`}>
                            {t.saved}
                        </span>
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-solutium-blue hover:bg-solutium-dark text-white font-medium rounded-lg shadow-sm transition-colors"
                        >
                            {t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      ) : activeTab === 'team' ? (
        <div className="space-y-8 animate-fadeIn">
            <Tabs 
                options={[
                    { id: 'invitations', label: t.invitationTab || 'Invitaciones' },
                    { id: 'roles', label: 'Roles' }
                ]}
                activeTab={teamSubTab}
                onChange={(id: string) => setTeamSubTab(id as any)}
                style="secondary"
                className="mb-6"
            />
            {teamSubTab === 'invitations' && <InvitationPanel />}
            {teamSubTab === 'roles' && <TeamManagementPanel />}
        </div>
      ) : activeTab === 'administrar' && user?.role !== ('admin' as any) ? (
        <div className="space-y-8 animate-fadeIn">
            {/* Section 1: Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Proyectos</h3>
                
                {(!user?.projects || user.projects.length === 0) ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-400 text-sm">No tienes proyectos creados.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {user.projects.map(project => (
                            <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <div>
                                    <h5 className="font-bold text-slate-800">{project.name}</h5>
                                    <p className="text-xs text-slate-500">ID: {project.id}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => {
                                            onNavigate('project-settings');
                                            switchProject(project.id);
                                        }}
                                        className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Configurar"
                                    >
                                        <Icons.Settings className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => duplicateProject(project.id)}
                                        className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Duplicar"
                                    >
                                        <Icons.Copy className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setProjectToDelete(project.id);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar"
                                    >
                                        <Icons.Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 2: Account Danger Zone */}
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 md:p-8">
                <h3 className="text-lg font-bold text-red-600 mb-2 border-b border-red-100 pb-2">Zona de peligro</h3>
                <p className="text-sm text-slate-500 mb-6">Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.</p>
                
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                    <div>
                        <h5 className="font-bold text-red-800">Eliminar Cuenta</h5>
                        <p className="text-xs text-red-600/80">Eliminar permanentemente tu cuenta y todos sus datos asociados.</p>
                    </div>
                    <button 
                        onClick={() => {
                            if (window.confirm('¿Estás absolutamente seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y se perderán todos tus datos.')) {
                                // Add delete account logic here
                                alert('Funcionalidad de eliminar cuenta pendiente de implementación en el backend.');
                            }
                        }}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
                    >
                        Eliminar Cuenta
                    </button>
                </div>
            </div>
        </div>
      ) : null}
    </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          if (projectToDelete) {
            deleteProject(projectToDelete);
            setIsModalOpen(false);
          }
        }}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.`}
      />
    </>
  );

};

export default Profile;
