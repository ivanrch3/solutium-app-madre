import { ServiceApp, ImageMapping, BrandImage, ImageLocation, AppCategory, CategoryTheme, IconName } from './types';

// --- APP CATEGORIES ---
export const APP_CATEGORIES: Record<AppCategory, CategoryTheme> = {
  'Productividad': {
    dominant: '#005e79',
    accent: null,
  },
  'Finanzas': {
    dominant: '#700ab1',
    accent: null,
  },
  'Marketing y Ventas': {
    dominant: '#502fb6',
    accent: null,
  },
  'Operaciones': {
    dominant: '#2c2f3a',
    accent: null,
  },
  'Recursos Humanos': {
    dominant: '#6e6e74',
    accent: null,
  },
  'Automatización y Digitalización': {
    dominant: '#005e79',
    accent: '#502fb6',
  },
  'Estrategia y Crecimiento': {
    dominant: '#700ab1',
    accent: '#005e79',
  },
};

// --- MASTER DESIGN MEMORY ---
// Centralized source of truth for UI consistency.
// All components should reference these classes via strict components.

export const THEME_CLASSES = {
  button: {
    base: "inline-flex items-center justify-center px-4 py-2 border rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
    variants: {
      primary: "border-transparent text-white bg-solutium-blue hover:bg-solutium-dark focus:ring-solutium-blue",
      secondary: "border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-indigo-500",
      danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
      ghost: "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700",
      accent: "border-transparent text-solutium-dark bg-solutium-yellow hover:bg-yellow-300 focus:ring-yellow-400"
    },
    sizes: {
      sm: "text-xs px-2.5 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3",
      icon: "p-2",
    }
  },
  input: {
    base: "block w-full px-4 py-3 rounded-lg border text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-0 transition-all duration-200 ease-in-out sm:text-sm shadow-sm",
    label: "block text-sm font-medium text-slate-700 mb-2 ml-1",
    error: "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 bg-red-50"
  },
  card: {
    base: "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
  },
  layout: {
    pageHeader: "mb-8 border-b border-slate-200 pb-4"
  }
};

// --- ICONS ---
export const Icons: Record<IconName, ({ className }: { className?: string }) => JSX.Element> = {
  Grid: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  WebBuilder: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Invoice: ({ className = "w-6 h-6" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Calendar: ({ className = "w-6 h-6" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Code: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Settings: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  BarChart: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  LogOut: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Plus: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  User: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Users: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  MessageSquare: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  X: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Check: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Copy: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0H8m0 0a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2h-6z" /></svg>,
  ChevronDown: ({ className = "w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ChevronUp: ({ className = "w-4 h-4" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
  Trash: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Search: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  ExternalLink: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  FileText: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Upload: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Download: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  AlertCircle: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Store: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Link: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  MoreVertical: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>,
  Edit: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  AlertTriangle: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Folder: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Menu: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  ChevronLeft: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Box: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Zap: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Activity: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
};

// --- INDUSTRIES ---
export const INDUSTRIES = {
  en: [
    'Agriculture & Livestock',
    'Food & Beverage',
    'Art & Design',
    'Automotive',
    'Beauty & Aesthetics',
    'Real Estate',
    'Personal Blog / Influencer',
    'E-commerce',
    'Construction & Renovation',
    'Consulting & Coaching',
    'Education & Courses',
    'Entertainment & Events',
    'Finance & Insurance',
    'Fitness & Sports',
    'Photography & Video',
    'Gastronomy / Restaurants',
    'Legal (Lawyers)',
    'Marketing & Advertising',
    'Pets & Veterinary',
    'Fashion & Clothing',
    'NGO / Non-profit',
    'Health & Medicine',
    'Cleaning Services',
    'Professional Services',
    'Technology & Software',
    'Transport & Logistics',
    'Tourism & Hospitality',
    'Other'
  ],
  es: [
    'Agricultura y Ganadería',
    'Alimentación y Bebidas',
    'Arte y Diseño',
    'Automotriz',
    'Belleza y Estética',
    'Bienes Raíces (Inmobiliaria)',
    'Blog Personal / Influencer',
    'Comercio Electrónico (E-commerce)',
    'Construcción y Reformas',
    'Consultoría y Coaching',
    'Educación y Cursos',
    'Entretenimiento y Eventos',
    'Finanzas y Seguros',
    'Fitness y Deportes',
    'Fotografía y Video',
    'Gastronomía / Restaurantes',
    'Legal (Abogados)',
    'Marketing y Publicidad',
    'Mascotas y Veterinaria',
    'Moda y Ropa',
    'ONG / Sin Fines de Lucro',
    'Salud y Medicina',
    'Servicios de Limpieza',
    'Servicios Profesionales',
    'Tecnología y Software',
    'Transporte y Logística',
    'Turismo y Hospitalidad',
    'Otro'
  ]
};

// --- DOMAINS & PORTS CONFIGURATION ---
// Determines the URL based on the current environment.

// 1. Detect if we are running locally or in a development environment
const IS_LOCALHOST = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('ais-dev') || // AI Studio Dev Environment
    window.location.port !== ''
);

// 2. Detect if we are in the staging environment
const IS_STAGING = typeof window !== 'undefined' && window.location.hostname.includes('staging');

export const DOMAINS = {
    // If Localhost: Point to Ports 3001, 3002, etc.
    // If Staging: Point to *.staging.solutium.app
    // If Prod: Point to *.solutium.app
    INVOICER: IS_LOCALHOST 
        ? 'http://localhost:3001'
        : (IS_STAGING ? 'https://invoice.staging.solutium.app' : 'https://invoice.solutium.app'),
        
    WEB_BUILDER: IS_LOCALHOST 
        ? 'http://localhost:3002' 
        : (IS_STAGING ? 'https://builder.staging.solutium.app' : 'https://builder.solutium.app'),
        
    BOOKING: IS_LOCALHOST 
        ? 'http://localhost:3003' 
        : (IS_STAGING ? 'https://booking.staging.solutium.app' : 'https://booking.solutium.app'),

    CONSTRUCTOR_WEB: IS_LOCALHOST 
        ? 'http://localhost:3004' 
        : (IS_STAGING ? 'https://constructor.staging.solutium.app' : 'https://constructor.solutium.app'),

    DEV_SATELLITE: 'http://localhost:3001'
};

// --- AVAILABLE APPS REGISTRY ---


export const BRAND_IMAGES: BrandImage[] = [
  { name: 'imagotipoBlanco', displayName: 'Imagotipo Blanco', url: 'https://solutium.app/solutium-imagotipo-blanco.png' },
  { name: 'imagotipoColor', displayName: 'Imagotipo Color', url: 'https://solutium.app/solutium-imagotipo.png' },
  { name: 'isotipoBlanco', displayName: 'Isotipo Blanco', url: 'https://solutium.app/solutium-isotipo-blanco.png' },
  { name: 'isotipoColor', displayName: 'Isotipo Color', url: 'https://solutium.app/solutium-isotipo.png' },
  { name: 'favicon', displayName: 'Favicon', url: 'https://solutium.app/solutium-favicon.png' },
];

export const DEFAULT_IMAGE_MAPPING: ImageMapping[] = [
  { location: ImageLocation.MobileHeaderLogo, imageName: 'imagotipoBlanco' },
  { location: ImageLocation.SidebarLogo, imageName: 'imagotipoBlanco' },
  { location: ImageLocation.Favicon, imageName: 'favicon' },
  // Add other default mappings as needed
];

export const AVAILABLE_APPS: ServiceApp[] = [
  {
    id: 'invoicer',
    name: 'Creador de proformas',
    description: 'Gestión de facturas, presupuestos y gastos.',
    icon: 'Invoice',
    url: 'http://localhost:3001',
    category: 'Finanzas',
    status: 'active',
    lifecycleStatus: 'active',
    requiresPro: false
  },
  {
    id: 'web-constructor',
    name: 'Constructor Web',
    description: 'Crea sitios web y landing pages con IA y módulos inteligentes.',
    icon: 'WebBuilder',
    url: 'http://localhost:3004',
    category: 'Marketing y Ventas',
    status: 'beta',
    lifecycleStatus: 'development',
    requiresPro: true
  }
];
