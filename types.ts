import React from 'react';

export type Language = 'en' | 'es';
export type IconName = 
  | 'Grid' 
  | 'WebBuilder' 
  | 'Invoice' 
  | 'Calendar' 
  | 'Code' 
  | 'Settings' 
  | 'BarChart' 
  | 'LogOut' 
  | 'Plus' 
  | 'User'
  | 'Users' 
  | 'MessageSquare' 
  | 'X' 
  | 'Check' 
  | 'Copy' 
  | 'ChevronDown' 
  | 'ChevronUp'
  | 'Trash'
  | 'Search'
  | 'ExternalLink'
  | 'FileText'
  | 'Upload'
  | 'Download'
  | 'AlertCircle'
  | 'Store'
  | 'Link'
  | 'MoreVertical'
  | 'Edit'
  | 'AlertTriangle'
  | 'Folder'
  | 'Menu'
  | 'ChevronLeft'
  | 'ChevronRight'
  | 'Box'
  | 'Zap'
  | 'Activity'
  | 'Layers'
  | 'LayoutGrid'
  | 'Library'
  | 'Gem'
  | 'ElaborateLayers'
  | 'ElaborateLayoutGrid'
  | 'ElaborateStore'
  | 'ElaborateGem'
  | 'ElaborateSettings'
  | 'ElaborateActivity'
  | 'ElaborateUser';

export interface TagDefinition {
  id: string;
  label: string;
  desc: string;
  color: string;
  isCustom?: boolean;
}

export interface CategoryTheme {
  dominant: string;
  accent: string | null;
}
export type NotificationType = 'success' | 'error' | 'info';
export type UserRole = 
  | 'user' 
  | 'admin'
  | 'guest'
  | 'super_admin' 
  | 'product_manager' 
  | 'developer' 
  | 'editor' 
  | 'viewer' 
  | 'support';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'active' | 'pending';
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'x' | 'tiktok';
  username: string;
}

export type ThemeName = 
  | 'solutium-light'
  | 'solutium-dark'
  | 'emerald-light' 
  | 'emerald-dark' 
  | 'indigo-light' 
  | 'indigo-dark' 
  | 'blue-light' 
  | 'blue-dark' 
  | 'slate-light' 
  | 'slate-dark' 
  | 'fluent-light'
  | 'default';

export interface Theme {
  name: ThemeName;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    card: string;
    border: string;
  };
  uiTheme: 'light' | 'dark' | 'alt';
  // New style properties
  fontFamily?: string;
  borderRadius?: string;
  baseSize?: string;
  uiStyle?: 'windows' | 'solutium';
}

export enum ImageLocation {
    MobileHeaderLogo = 'mobileHeaderLogo',
    SidebarLogo = 'sidebarLogo',
    AuthBackground = 'authBackground',
    EmailHeader = 'emailHeader',
    Favicon = 'favicon',
}

export interface BrandImage {
    name: string;
    displayName: string;
    url: string;
}

export interface ImageMapping {
    location: ImageLocation;
    imageName: string; // Refers to the name in BRAND_IMAGES array
}

export interface Project {
  id: string;
  name: string;
  industry?: string;
  createdAt: number;
  
  // Project Identity (Public facing data)
  logoUrl?: string;
  brandColors: string[]; // Array of colors for the project
  uiStyle?: 'windows' | 'solutium'; // Style for the satellite app
  website?: string;
  email?: string; // Public contact email
  whatsapp?: string; // Stored as full string, UI handles split
  address?: string;
  location?: { lat: number; lng: number }; // For Map selection
  imageMappings?: ImageMapping[]; // For Master App identity
  
  socials: SocialLink[]; // Dynamic array

  // Resources
  installedAppIds: string[];
  assignedMemberIds: string[];
  customers?: Customer[];
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unitCost: number;
  type: 'product' | 'service';
  sku?: string;
  code?: string;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'archived' | 'draft';
  businessId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: Language;
  preferredTheme?: ThemeName; // User's personal UI preference
  phone?: string; 
  avatarUrl?: string;
  
  // Global UI Preferences
  uiStyle: 'windows' | 'solutium';
  fontFamily: string;
  baseSize: string;
  borderRadius: string;
  themePreference: 'default' | 'custom';
  activeTheme: ThemeName;
  coloredSidebarIcons?: boolean;
  
  // Account Owner Data
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  onboardingCompleted: boolean; 
  
  // Multi-project & Team architecture
  projects: Project[]; 
  teamMembers: TeamMember[]; 
  customApps?: ServiceApp[]; // User-added custom satellites

  integrations?: {
    emailItId?: string;
  }
}

export interface ServiceApp {
  id: string;
  name: string;
  description: string;
  icon: IconName | React.ReactNode; 
  url: string; 
  logoUrl?: string; // Imagotipo (Full logo)
  isoUrl?: string; // Isotipo (Icon only)
  status: 'active' | 'beta' | 'coming_soon' | 'offline';
  lifecycleStatus: 'active' | 'development' | 'inactive';
  requiresPro: boolean;
  category?: AppCategory;
  isCustom?: boolean;
  scopes?: string[];
  tags?: string[];
  sipEnabled?: boolean;
}

export enum AuthView {
  LOGIN,
  REGISTER,
  GUEST
}

// --- SATELLITE APP TYPES ---

export type ViewMode = 'design' | 'client_preview' | 'invoice_edit' | 'invoice_readonly' | 'catalog_edit';
export type UiSize = 'small' | 'medium' | 'large';

export type AppCategory = 
  | 'Productividad'
  | 'Finanzas'
  | 'Marketing y Ventas'
  | 'Operaciones'
  | 'Recursos Humanos'
  | 'Automatización y Digitalización'
  | 'Estrategia y Crecimiento';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  status: 'lead' | 'customer' | 'prospect' | 'inactive';
  source: string; // e.g., 'Direct', 'Web Builder', 'Invoicer'
  sourceAppId?: string; // ID of the app that created this customer
  businessId?: string; // ID of the project/business this customer belongs to (Legacy/Primary)
  visibility: 'single' | 'multiple' | 'all';
  assignedBusinessIds: string[]; // List of business IDs if visibility is 'multiple'
  lastActivity: string;
  notes?: string;
  // Flexible metadata for satellite apps to store their specific data
  appData?: Record<string, any>; 
  createdAt: number;
  updatedAt: number;
}
