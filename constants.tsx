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
  Layers: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  LayoutGrid: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Library: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Gem: ({ className = "w-5 h-5" }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3h12l4 6-10 13L2 9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3l-4 6 5 13" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 3l4 6-5 13" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 9h20" /></svg>,
  ElaborateLayers: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear)" stroke="#0ea5e9" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="paint0_linear" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#0284c7" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  ElaborateLayoutGrid: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="2" fill="url(#grid_paint0)" stroke="#a855f7" strokeWidth="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="2" fill="url(#grid_paint1)" stroke="#d946ef" strokeWidth="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="2" fill="url(#grid_paint2)" stroke="#a855f7" strokeWidth="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="2" fill="url(#grid_paint3)" stroke="#8b5cf6" strokeWidth="1.5"/>
      <defs>
        <linearGradient id="grid_paint0" x1="3" y1="3" x2="10" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#9333ea" stopOpacity="0.8"/>
        </linearGradient>
        <linearGradient id="grid_paint1" x1="14" y1="3" x2="21" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e879f9" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#c026d3" stopOpacity="0.8"/>
        </linearGradient>
        <linearGradient id="grid_paint2" x1="14" y1="14" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#9333ea" stopOpacity="0.8"/>
        </linearGradient>
        <linearGradient id="grid_paint3" x1="3" y1="14" x2="10" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  ElaborateStore: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8L4.5 3H19.5L21 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 8C3 9.65685 4.34315 11 6 11C7.65685 11 9 9.65685 9 8C9 9.65685 10.3431 11 12 11C13.6569 11 15 9.65685 15 8C15 9.65685 16.3431 11 18 11C19.6569 11 21 9.65685 21 8" fill="url(#store_paint0)" stroke="#10b981" strokeWidth="1.5"/>
      <path d="M4 11V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V11" fill="url(#store_paint1)" stroke="#059669" strokeWidth="1.5"/>
      <path d="M10 21V14H14V21" stroke="#047857" strokeWidth="1.5" fill="#a7f3d0"/>
      <defs>
        <linearGradient id="store_paint0" x1="3" y1="8" x2="21" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#059669" stopOpacity="0.8"/>
        </linearGradient>
        <linearGradient id="store_paint1" x1="12" y1="11" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" stopOpacity="0.4"/>
          <stop offset="1" stopColor="#10b981" stopOpacity="0.4"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  ElaborateGem: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3H18L22 9L12 22L2 9L6 3Z" fill="url(#gem_paint0)" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 22L16 9M12 22L8 9M2 9H22M6 3L8 9M18 3L16 9" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="gem_paint0" x1="12" y1="3" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" stopOpacity="0.9"/>
          <stop offset="1" stopColor="#ea580c" stopOpacity="0.9"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  ElaborateSettings: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="url(#set_paint0)" stroke="#475569" strokeWidth="1.5"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" fill="url(#set_paint1)" stroke="#334155" strokeWidth="1.5"/>
      <defs>
        <linearGradient id="set_paint0" x1="9" y1="9" x2="15" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#94a3b8"/>
          <stop offset="1" stopColor="#475569"/>
        </linearGradient>
        <linearGradient id="set_paint1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#cbd5e1" stopOpacity="0.5"/>
          <stop offset="1" stopColor="#64748b" stopOpacity="0.5"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  ElaborateActivity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="url(#act_paint0)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#e11d48" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="act_paint0" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb7185"/>
          <stop offset="0.5" stopColor="#e11d48"/>
          <stop offset="1" stopColor="#9f1239"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  ElaborateUser: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" fill="url(#usr_paint0)" stroke="#4338ca" strokeWidth="1.5"/>
      <path d="M4 21C4 16.5817 7.58172 13 12 13C16.4183 13 20 16.5817 20 21" fill="url(#usr_paint1)" stroke="#4338ca" strokeWidth="1.5" strokeLinecap="round"/>
      <defs>
        <linearGradient id="usr_paint0" x1="8" y1="3" x2="16" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" stopOpacity="0.9"/>
          <stop offset="1" stopColor="#4f46e5" stopOpacity="0.9"/>
        </linearGradient>
        <linearGradient id="usr_paint1" x1="4" y1="13" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5b4fc" stopOpacity="0.6"/>
          <stop offset="1" stopColor="#4338ca" stopOpacity="0.6"/>
        </linearGradient>
      </defs>
    </svg>
  ),
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
    id: 'test-app',
    name: 'App de prueba',
    description: 'Aplicación de demostración para verificar la integración de la matriz y la tienda.',
    icon: 'Box',
    url: 'http://localhost:3005',
    category: 'Productividad',
    status: 'active',
    lifecycleStatus: 'active',
    requiresPro: false,
    tags: ['demo', 'test'],
    scopes: ['profile', 'projectData']
  }
];
