import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Input } from '../components/Input';
import { SocialLink, ThemeName } from '../types';
import { extractPaletteFromImage } from '../utils/colorUtils';
import { Button } from '../components/Button';
import { SOLUTIUM_COLORS, SOLUTIUM_THEMES } from '../src/themes';
import { INDUSTRIES } from '../constants';
import { Tabs } from '../components/Tabs';

const ProjectSettings: React.FC = () => {
  const { currentProject, user, updateProject, updateProfile, t, logout, previewProjectUpdate, deleteProject } = useAuth();
  const { setHasUnsavedChanges } = useNavigation();
  
  const isMasterApp = currentProject?.id === 'admin-hq';

  const [activeTab, setActiveTab] = useState<'identity' | 'info' | 'admin' | 'preferences'>(isMasterApp ? 'preferences' : 'info');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  
  // State for all fields
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customIndustryInput, setCustomIndustryInput] = useState('');
  
  // Logo
  const [logoMode, setLogoMode] = useState<'url' | 'upload'>('url');
  const [logoUrl, setLogoUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Colors
  const [colors, setColors] = useState<string[]>([]);
  const [uiStyle, setUiStyle] = useState<'windows' | 'solutium'>('windows');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  
  // WhatsApp
  const [countryCode, setCountryCode] = useState('+1');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  
  // Web & Email
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  
  // Socials
  const [socials, setSocials] = useState<SocialLink[]>([]);
  
  // Address
  const [address, setAddress] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  useEffect(() => {
      setHasUnsavedChanges(isDirty);
      
      // @ts-ignore
      window.onSaveUnsavedChanges = () => {
          if (user?.role === 'guest') {
              setShowGuestWarning(true);
              return;
          }
          
          if (!currentProject) return;
          
          const fullWebsite = website ? `https://${website}` : '';
          
          updateProject(currentProject.id, {
              name,
              industry,
              logoUrl,
              brandColors: colors,
              uiStyle,
              whatsapp: `${countryCode} ${whatsAppNumber}`,
              website: fullWebsite,
              email,
              address,
              socials,
          });
          setIsDirty(false);
      };

      return () => {
          // @ts-ignore
          window.onSaveUnsavedChanges = undefined;
          setHasUnsavedChanges(false);
      };
  }, [isDirty, name, industry, logoUrl, colors, uiStyle, countryCode, whatsAppNumber, website, email, address, socials, currentProject?.id, updateProject, user?.role, setHasUnsavedChanges]);

  useEffect(() => {
      if (currentProject && currentProject.id !== loadedProjectId) {
          setName(currentProject.name || '');
          const ind = currentProject.industry || '';
          setIndustry(ind);
          
          if (ind && !INDUSTRIES.es.includes(ind) && ind !== 'Otro') {
              setSelectedCategory('Otro');
              setCustomIndustryInput(ind);
          } else {
              setSelectedCategory(ind);
              setCustomIndustryInput('');
          }

          setLogoUrl(currentProject.logoUrl || '');
          
          if (currentProject.brandColors) {
              setColors(currentProject.brandColors);
          } else {
              setColors(isMasterApp 
                  ? [SOLUTIUM_COLORS.green, SOLUTIUM_COLORS.violet, SOLUTIUM_COLORS.blue, SOLUTIUM_COLORS.deepGray, SOLUTIUM_COLORS.darkGray, SOLUTIUM_COLORS.lightGray]
                  : [SOLUTIUM_COLORS.green, SOLUTIUM_COLORS.violet, SOLUTIUM_COLORS.blue]
              );
          }
          
          setWebsite(currentProject.website?.replace('https://', '') || '');
          setEmail(currentProject.email || '');
          setAddress(currentProject.address || '');
          
          if (currentProject.whatsapp) {
              const parts = currentProject.whatsapp.split(' ');
              if (parts.length > 1) {
                  setCountryCode(parts[0]);
                  setWhatsAppNumber(parts.slice(1).join(' '));
              } else {
                  setWhatsAppNumber(currentProject.whatsapp);
              }
          }

          setUiStyle(currentProject.uiStyle || 'windows');
          setSocials(currentProject.socials || []);
          setIsDirty(false);
          setLoadedProjectId(currentProject.id);
      }
  }, [currentProject, loadedProjectId, isMasterApp, user]);

  if (!currentProject) return null;

  const handleChange = (setter: React.Dispatch<any>, value: any, fieldName?: string) => {
    setter(value);
    setIsDirty(true);
    setIsSaved(false);
    if (fieldName && fieldName in currentProject) {
      previewProjectUpdate({ [fieldName]: value });
    }
  };

  const handleColorChange = (index: number, val: string) => {
    const newColors = [...colors];
    newColors[index] = val;
    setColors(newColors);
    setIsDirty(true);
    setIsSaved(false);
    previewProjectUpdate({ brandColors: newColors });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (!file.type.startsWith('image/')) {
              alert("Error: Solo se permiten archivos de imagen.");
              return;
          }
          if (file.size > 5 * 1024 * 1024) {
              alert("Error: El límite es 5MB.");
              return;
          }
          
          const reader = new FileReader();
          reader.onload = (event) => {
              const url = event.target?.result as string;
              handleChange(setLogoUrl, url);
              // Update preview immediately
              previewProjectUpdate({ logoUrl: url });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleExtractColors = async () => {
      if (!logoUrl) return;
      setIsExtracting(true);
      try {
          const palette = await extractPaletteFromImage(logoUrl);
          if (palette && palette.length > 0) {
              const newColors = [...colors];
              palette.forEach((color, idx) => {
                  if (idx < (isMasterApp ? 6 : 3)) newColors[idx] = color;
              });
              setColors(newColors);
              setIsDirty(true);
              previewProjectUpdate({ brandColors: newColors });
          }
      } catch (error) {
          console.error("Error extracting palette", error);
      } finally {
          setIsExtracting(false);
      }
  };

  const handleAddSocial = () => {
      if (socials.length < 5) { 
          const newSocials = [...socials, { platform: 'facebook', username: '' }];
          // @ts-ignore
          setSocials(newSocials);
          setIsDirty(true);
      }
  };

  const handleSocialChange = (index: number, field: keyof SocialLink, value: string) => {
      const newSocials = [...socials];
      newSocials[index] = { ...newSocials[index], [field]: value };
      setSocials(newSocials);
      setIsDirty(true);
  };

  const handleRemoveSocial = (index: number) => {
      const newSocials = socials.filter((_, i) => i !== index);
      setSocials(newSocials);
      setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (user?.role === 'guest') {
          setShowGuestWarning(true);
          return;
      }
      
      const fullWebsite = website ? `https://${website}` : '';
      
      updateProject(currentProject.id, {
          name,
          industry,
          logoUrl,
          brandColors: colors,
          uiStyle,
          whatsapp: `${countryCode} ${whatsAppNumber}`,
          website: fullWebsite,
          email,
          address,
          socials,
      });
      setIsSaved(true);
      setIsDirty(false);
      setTimeout(() => setIsSaved(false), 3000);
  };

  const handleGuestCreateAccount = () => {
      setHasUnsavedChanges(false);
      logout();
  };

  const countryOptions = [
      { code: '+54', flag: '🇦🇷', name: 'Argentina' },
      { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
      { code: '+55', flag: '🇧🇷', name: 'Brazil' },
      { code: '+56', flag: '🇨🇱', name: 'Chile' },
      { code: '+57', flag: '🇨🇴', name: 'Colombia' },
      { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
      { code: '+53', flag: '🇨🇺', name: 'Cuba' },
      { code: '+1', flag: '🇩🇴', name: 'Dom. Rep.' },
      { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
      { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
      { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
      { code: '+504', flag: '🇭🇳', name: 'Honduras' },
      { code: '+52', flag: '🇲🇽', name: 'Mexico' },
      { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
      { code: '+507', flag: '🇵🇦', name: 'Panama' },
      { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
      { code: '+51', flag: '🇵🇪', name: 'Peru' },
      { code: '+1', flag: '🇵🇷', name: 'Puerto Rico' },
      { code: '+1', flag: '🇺🇸', name: 'USA' },
      { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
      { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
      { code: '+34', flag: '🇪🇸', name: 'Spain' },
  ];

  const currentFlag = countryOptions.find(c => c.code === countryCode)?.flag || '🇺🇸';

  return (
    <div className="max-w-4xl animate-fadeIn relative">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-solutium-blue uppercase tracking-widest">
                {t.labelProjectName}
            </label>
            <input 
                type="text"
                value={name}
                onChange={(e) => handleChange(setName, e.target.value)}
                placeholder={t.phProjectName}
                className="block w-full text-4xl font-bold text-solutium-dark border-0 focus:ring-0 px-0 py-0 bg-transparent transition-all placeholder-slate-300"
            />
          </div>
          
          <Tabs 
            options={!isMasterApp ? [
              { id: 'info', label: t.infoTab },
              { id: 'identity', label: t.identityTab }
            ] : [
              { id: 'preferences', label: 'Preferencias' },
              { id: 'admin', label: t.adminTab }
            ]}
            activeTab={activeTab}
            onChange={(id: string) => setActiveTab(id as any)}
            style="primary"
            className="mt-6"
          />
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
            {activeTab === 'identity' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
                    <h3 className="text-lg font-bold text-solutium-text mb-6 border-b border-solutium-border pb-2">{t.projIdentity}</h3>

                    {isMasterApp ? (
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-4">
                            <p className="leading-relaxed">La identidad visual de la App Maestra (Logo y Colores) se configura en la pestaña "Identidad" de tu Perfil Administrativo.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-4">
                                    <label className="block text-sm font-medium text-solutium-text mb-2">{t.labelLogo}</label>
                                    <div className="flex space-x-2 text-sm mb-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setLogoMode('url')}
                                            className={`px-4 py-1.5 rounded-full font-medium transition-colors ${logoMode === 'url' ? 'bg-solutium-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            URL
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setLogoMode('upload')}
                                            className={`px-4 py-1.5 rounded-full font-medium transition-colors ${logoMode === 'upload' ? 'bg-solutium-blue text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            {t.uploadImage}
                                        </button>
                                    </div>

                                    <div className={`w-full h-40 rounded-lg border-2 border-dashed border-solutium-border flex items-center justify-center overflow-hidden relative ${logoUrl ? 'bg-transparent' : 'bg-solutium-bg'}`}>
                                        {logoUrl ? (
                                            <>
                                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleChange(setLogoUrl, '');
                                                    }}
                                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-slate-400 text-sm">{t.noLogo}</span>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {logoMode === 'url' ? (
                                            <input 
                                                type="text" 
                                                placeholder={t.phUrl}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-solutium-blue outline-none"
                                                value={logoUrl}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleChange(setLogoUrl, val);
                                                    previewProjectUpdate({ logoUrl: val });
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <label className="w-full cursor-pointer bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-200 text-center text-slate-600 transition-colors">
                                                    {t.uploadImage}
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={handleImageUpload} 
                                                    />
                                                </label>
                                            </div>
                                        )}

                                        {logoUrl && (
                                            <button
                                                type="button"
                                                onClick={handleExtractColors}
                                                disabled={isExtracting}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                            >
                                                <svg className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656l-1.172 1.172" />
                                                </svg>
                                                {isExtracting ? 'Extrayendo...' : 'Obtener colores del logo'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex-1 space-y-8">
                                    <div className="w-full md:w-64 flex flex-col">
                                        <label className="block text-sm font-medium text-solutium-text mb-4">
                                            Colores del Proyecto (3 colores)
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {colors.slice(0, 3).map((color, idx) => (
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
                        </>
                    )}
                </div>
            )}

            {activeTab === 'info' && !isMasterApp && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                         <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">{t.projContact}</h3>
                         
                         <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Negocio (Industria)</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedCategory(val);
                                    if (val === 'Otro') {
                                        handleChange(setIndustry, customIndustryInput, 'industry');
                                    } else {
                                        handleChange(setIndustry, val, 'industry');
                                        setCustomIndustryInput('');
                                    }
                                }}
                                className="block w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-solutium-blue transition-all duration-200 ease-in-out sm:text-sm shadow-sm"
                            >
                                <option value="">Selecciona una categoría...</option>
                                {INDUSTRIES.es.map((ind) => (
                                    <option key={ind} value={ind}>{ind}</option>
                                ))}
                            </select>
                            
                            {selectedCategory === 'Otro' && (
                                <div className="mt-3 animate-fadeIn">
                                    <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Especifica tu industria</label>
                                    <input
                                        type="text"
                                        value={customIndustryInput}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomIndustryInput(val);
                                            handleChange(setIndustry, val, 'industry');
                                        }}
                                        placeholder="Ej: Consultoría de IA, Venta de Artesanías..."
                                        className="block w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-solutium-blue transition-all duration-200 ease-in-out sm:text-sm shadow-sm"
                                    />
                                </div>
                            )}
                         </div>

                         <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t.labelWhatsApp}</label>
                            <div className="flex relative">
                                <div className="absolute left-0 top-0 bottom-0 min-w-[5rem] px-3 bg-slate-50 border border-slate-300 rounded-l-lg flex items-center justify-center text-sm z-0">
                                    <span className="mr-2 text-lg">{currentFlag}</span>
                                    <span className="text-slate-600 font-medium">{countryCode}</span>
                                </div>
                                <select 
                                    value={countryCode}
                                    onChange={(e) => handleChange(setCountryCode, e.target.value)}
                                    className="h-full px-2 py-2 opacity-0 cursor-pointer z-10 absolute left-0 min-w-[5rem]"
                                >
                                    {countryOptions.map(opt => (
                                        <option key={opt.name} value={opt.code}>{opt.flag} {opt.name} ({opt.code})</option>
                                    ))}
                                </select>
                                <div className="flex-1 flex ml-[5rem]">
                                    <input 
                                        type="tel"
                                        value={whatsAppNumber}
                                        onChange={(e) => handleChange(setWhatsAppNumber, e.target.value)}
                                        placeholder="999 999 9999"
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                         </div>

                         <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t.labelWebsite}</label>
                            <div className="flex items-center">
                                <span className="bg-slate-100 border border-slate-300 border-r-0 rounded-l-lg px-3 py-2 text-slate-500 text-sm">https://</span>
                                <input 
                                    type="text"
                                    value={website}
                                    onChange={(e) => handleChange(setWebsite, e.target.value)}
                                    placeholder={t.phWebsite}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                         </div>

                         <Input 
                            label={t.labelEmail} 
                            value={email} 
                            onChange={(e) => handleChange(setEmail, e.target.value)} 
                            type="email"
                            placeholder={t.phEmail}
                         />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                            <h3 className="text-lg font-bold text-slate-800">{t.projSocial}</h3>
                            {socials.length < 5 && (
                                 <button type="button" onClick={handleAddSocial} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-medium">
                                     + {t.addSocial}
                                 </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            {socials.map((social, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select
                                        value={social.platform}
                                        onChange={(e) => handleSocialChange(index, 'platform', e.target.value as any)}
                                        className="w-32 px-2 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                                    >
                                        <option value="facebook">Facebook</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="x">X</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="tiktok">TikTok</option>
                                    </select>
                                    <input 
                                        type="text"
                                        value={social.username}
                                        onChange={(e) => handleSocialChange(index, 'username', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder={t.phUser}
                                    />
                                    <button type="button" onClick={() => handleRemoveSocial(index)} className="text-red-400 hover:text-red-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">{t.projLocation}</h3>
                        <div className="flex gap-2">
                             <div className="flex-1">
                                <Input 
                                    label={t.labelAddress} 
                                    value={address} 
                                    onChange={(e) => handleChange(setAddress, e.target.value)}
                                    placeholder="Dirección completa"
                                    className="mb-0"
                                />
                             </div>
                             <div className="flex items-end mb-4">
                                <button 
                                    type="button" 
                                    onClick={() => address && setShowMapModal(true)}
                                    disabled={!address}
                                    className="h-[42px] px-4 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                                >
                                    {t.viewOnMap}
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'preferences' && (
                <div className="space-y-8 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">Preferencias de Interfaz</h3>
                        <p className="text-sm text-slate-500 mb-6">Personaliza cómo se ve la plataforma. {isMasterApp ? 'Estos cambios afectan tu vista administrativa.' : 'Estos cambios afectan a esta aplicación satélite.'}</p>
                        
                        {/* 1. UI Style Selector (Windows vs Solutium) */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-solutium-text mb-3 uppercase tracking-tight">
                                Estilo de Interfaz
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange(setUiStyle, 'windows', 'uiStyle');
                                        if (isMasterApp) updateProfile({ uiStyle: 'windows' });
                                    }}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        (isMasterApp ? user?.uiStyle : uiStyle) === 'windows' 
                                        ? 'border-solutium-blue bg-blue-50/50 ring-1 ring-solutium-blue' 
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-900">Windows 11 (Nativo)</span>
                                        {(isMasterApp ? user?.uiStyle : uiStyle) === 'windows' && <div className="w-3 h-3 rounded-full bg-solutium-blue"></div>}
                                    </div>
                                    <p className="text-xs text-slate-500">Estilo limpio, moderno y familiar. Optimizado para productividad.</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        handleChange(setUiStyle, 'solutium', 'uiStyle');
                                        if (isMasterApp) updateProfile({ uiStyle: 'solutium' });
                                    }}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        (isMasterApp ? user?.uiStyle : uiStyle) === 'solutium' 
                                        ? 'border-solutium-blue bg-blue-50/50 ring-1 ring-solutium-blue' 
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-900">Solutium (Creativo)</span>
                                        {(isMasterApp ? user?.uiStyle : uiStyle) === 'solutium' && <div className="w-3 h-3 rounded-full bg-solutium-blue"></div>}
                                    </div>
                                    <p className="text-xs text-slate-500">Estilo personalizado con temas de color y tipografías flexibles.</p>
                                </button>
                            </div>
                        </div>

                        {/* 2. Theme Selection (Only visible if Solutium style) */}
                        {(isMasterApp ? user?.uiStyle : uiStyle) === 'solutium' && (
                            <div className="mb-8 animate-fadeIn">
                                <label className="block text-sm font-bold text-solutium-text mb-3 uppercase tracking-tight">
                                    Selección de Tema
                                </label>
                                
                                <div className="flex bg-slate-100 p-1 rounded-lg w-fit mb-4">
                                    <button 
                                        type="button"
                                        onClick={() => setThemeMode('light')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${themeMode === 'light' ? 'bg-white shadow text-solutium-blue' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Claros
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setThemeMode('dark')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${themeMode === 'dark' ? 'bg-white shadow text-solutium-blue' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Oscuros
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
                                            if (isMasterApp) updateProfile({ activeTheme: theme.name as ThemeName });
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

                        {/* 3. Typography (Only visible if Solutium style) */}
                        {(isMasterApp ? user?.uiStyle : uiStyle) === 'solutium' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-solutium-text mb-3 uppercase tracking-tight">
                                        Tipografía
                                    </label>
                                    <select
                                        value={user?.fontFamily || 'Inter'}
                                        onChange={(e) => {
                                            if (isMasterApp) updateProfile({ fontFamily: e.target.value });
                                        }}
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
                                        onChange={(e) => {
                                            if (isMasterApp) updateProfile({ coloredSidebarIcons: e.target.checked });
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-solutium-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-solutium-blue"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'admin' && (
                <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 animate-fadeIn">
                    <h3 className="text-lg font-bold text-red-600">{t.dangerZone}</h3>
                    <p className="text-sm text-slate-500 mt-1">{t.dangerZoneDesc}</p>
                    <Button 
                        onClick={() => setIsDeleteModalOpen(true)} 
                        variant="danger" 
                        className="mt-4"
                        type="button"
                        disabled={isMasterApp}
                    >
                        {t.deleteProject}
                    </Button>
                </div>
            )}

            <div className="flex items-center justify-between pt-8">
                    <span className={`text-sm text-green-600 font-medium transition-opacity ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                        {t.saved}
                    </span>
                    <button type="submit" className="px-8 py-3 bg-solutium-blue text-white rounded-lg hover:bg-solutium-dark font-bold shadow-md transform active:scale-95 transition-all">
                        {t.save}
                    </button>
                </div>
        </form>

        {showMapModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-4 h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900">{t.mapModalTitle}</h3>
                        <button onClick={() => setShowMapModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            style={{border:0}} 
                            loading="lazy" 
                            allowFullScreen 
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={() => setShowMapModal(false)}
                            className="px-6 py-2 bg-solutium-blue text-white rounded-lg hover:bg-solutium-dark"
                        >
                            {t.confirmLocation}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {showGuestWarning && (
            <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 border-t-4 border-solutium-blue">
                    <div className="flex flex-col items-center text-center mb-6">
                        <h3 className="text-xl font-bold text-solutium-dark">{t.guestSaveTitle}</h3>
                        <p className="text-slate-500 text-sm mt-2">{t.guestSaveMsg}</p>
                    </div>
                    <div className="flex flex-col space-y-3">
                        <Button variant="primary" onClick={handleGuestCreateAccount} className="w-full justify-center">{t.guestCreateAccount}</Button>
                        <Button variant="ghost" onClick={() => setShowGuestWarning(false)} className="w-full justify-center">{t.cancel}</Button>
                    </div>
                </div>
            </div>
        )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold">{t.confirmDeleteTitle}</h2>
            <p className="text-slate-600 mt-2">{t.confirmDeleteDesc}</p>
            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>{t.cancel}</Button>
              <Button variant="danger" onClick={() => {
                if(currentProject) deleteProject(currentProject.id);
                setIsDeleteModalOpen(false);
              }}>{t.confirmDelete}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSettings;
