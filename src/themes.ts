import { Theme } from '../types';

// This is the base color palette for the entire Solutium ecosystem.
// Themes are built by referencing these variables for consistency.
export const SOLUTIUM_COLORS = {
  green: '#005E79',
  violet: '#700AB1',
  blue: '#502FB6',
  deepGray: '#2C2F3A',
  darkGray: '#6E6E74',
  lightGray: '#F2F4F8',
};

// This registry contains all predefined themes available for the user interface.
// The user can select one of these from their profile settings.
export const SOLUTIUM_THEMES: Theme[] = [
  // --- NUEVO TEMA INSIGNIA: SOLUTIUM ZEN ---
  {
    name: 'solutium-light',
    displayName: 'Solutium Zen (Claro)',
    colors: {
      primary: '#4F46E5', // Indigo 600: Vibrante pero profesional, no neón.
      secondary: '#F1F5F9', // Slate 100: Para fondos secundarios sutiles.
      accent: '#818CF8', // Indigo 400: Para detalles y hovers.
      background: '#F8FAFC', // Slate 50: El "lienzo" suave que pediste.
      text: '#334155', // Slate 700: Texto legible pero no agresivo.
      card: '#FFFFFF', // Blanco puro solo para tarjetas (elevación).
      border: '#E2E8F0', // Slate 200: Bordes casi invisibles.
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.75rem', // 12px: Moderno y amigable.
    baseSize: '15px', // Un punto medio perfecto entre 14 y 16.
  },
  {
    name: 'solutium-dark',
    displayName: 'Solutium Zen (Oscuro)',
    colors: {
      primary: '#818CF8', // Indigo 400: Más brillante para fondo oscuro.
      secondary: '#1E293B', // Slate 800
      accent: '#6366F1', // Indigo 500
      background: '#0F172A', // Slate 900: Azul muy oscuro, no negro puro.
      text: '#E2E8F0', // Slate 200
      card: '#1E293B', // Slate 800
      border: '#334155', // Slate 700
    },
    uiTheme: 'dark',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.75rem',
    baseSize: '15px',
  },
  // -----------------------------------------
  // Esmeralda Corporativo (Light Mode)
  {
    name: 'emerald-light',
    displayName: 'Esmeralda Corporativo (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.green,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.blue,
      background: '#FFFFFF',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#E2E8F0',
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem',
    baseSize: '16px',
  },
  // Esmeralda Corporativo (Dark Mode)
  {
    name: 'emerald-dark',
    displayName: 'Esmeralda Corporativo (Oscuro)',
    colors: {
      primary: SOLUTIUM_COLORS.green,
      secondary: SOLUTIUM_COLORS.deepGray,
      accent: SOLUTIUM_COLORS.blue,
      background: SOLUTIUM_COLORS.deepGray,
      text: SOLUTIUM_COLORS.lightGray,
      card: SOLUTIUM_COLORS.deepGray,
      border: '#4A5568',
    },
    uiTheme: 'dark',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem',
    baseSize: '16px',
  },
  // Indigo Creativo (Light Mode)
  {
    name: 'indigo-light',
    displayName: 'Índigo Creativo (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.violet,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.blue,
      background: '#FFFFFF',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#E2E8F0',
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '1rem',
    baseSize: '16px',
  },
  // Indigo Creativo (Dark Mode)
  {
    name: 'indigo-dark',
    displayName: 'Índigo Creativo (Oscuro)',
    colors: {
      primary: SOLUTIUM_COLORS.violet,
      secondary: SOLUTIUM_COLORS.deepGray,
      accent: SOLUTIUM_COLORS.blue,
      background: SOLUTIUM_COLORS.deepGray,
      text: SOLUTIUM_COLORS.lightGray,
      card: SOLUTIUM_COLORS.deepGray,
      border: '#4A5568',
    },
    uiTheme: 'dark',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '1rem',
    baseSize: '16px',
  },
  // Nuevo Tema Azul (Light Mode)
  {
    name: 'blue-light',
    displayName: 'Azul Moderno (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.blue,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.blue,
      background: '#FFFFFF',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#E2E8F0',
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.75rem',
    baseSize: '16px',
  },
  // Nuevo Tema Azul (Dark Mode)
  {
    name: 'blue-dark',
    displayName: 'Azul Moderno (Oscuro)',
    colors: {
      primary: SOLUTIUM_COLORS.blue,
      secondary: SOLUTIUM_COLORS.deepGray,
      accent: SOLUTIUM_COLORS.blue,
      background: SOLUTIUM_COLORS.deepGray,
      text: SOLUTIUM_COLORS.lightGray,
      card: SOLUTIUM_COLORS.deepGray,
      border: '#4A5568',
    },
    uiTheme: 'dark',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.75rem',
    baseSize: '16px',
  },
  // Slate Ejecutivo (Light Mode)
  {
    name: 'slate-light',
    displayName: 'Slate Ejecutivo (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.deepGray,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.blue,
      background: '#FFFFFF',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#E2E8F0',
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.25rem',
    baseSize: '16px',
  },
  // Slate Ejecutivo (Dark Mode)
  {
    name: 'slate-dark',
    displayName: 'Slate Ejecutivo (Oscuro)',
    colors: {
      primary: SOLUTIUM_COLORS.deepGray,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.blue,
      background: SOLUTIUM_COLORS.deepGray,
      text: SOLUTIUM_COLORS.lightGray,
      card: SOLUTIUM_COLORS.deepGray,
      border: '#4A5568',
    },
    uiTheme: 'dark',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.25rem',
    baseSize: '16px',
  },
  // Windows 11 (Fluent Design)
  {
    name: 'fluent-light',
    displayName: 'Sistema Fluent (Windows 11)',
    colors: {
      primary: '#0067C0', // Windows Blue
      secondary: '#F3F3F3', // Mica-like background
      accent: '#60CDFF',
      background: '#F3F3F3', // Very light gray, matching satellite surface/background contrast
      text: '#202020',
      card: '#FFFFFF',
      border: '#E5E5E5',
    },
    uiTheme: 'light',
    fontFamily: 'Segoe UI, sans-serif',
    borderRadius: '1rem',
    baseSize: '14px',
  },
];
