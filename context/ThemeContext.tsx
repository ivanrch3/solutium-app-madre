import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Theme, Project, UserProfile } from '../types';
import { SOLUTIUM_THEMES } from '../src/themes';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  interfaceTheme: Theme;
  projectTheme: Theme;
  setInterfaceTheme: (theme: Theme) => void;
  setProjectTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, currentProject } = useAuth();
  const [interfaceTheme, setInterfaceTheme] = useState<Theme>(SOLUTIUM_THEMES.find(t => t.name === 'fluent-light') || SOLUTIUM_THEMES[0]);
  const [projectTheme, setProjectTheme] = useState<Theme>(SOLUTIUM_THEMES.find(t => t.name === 'fluent-light') || SOLUTIUM_THEMES[0]);

  const updateThemes = useCallback((project: Project | null, user: UserProfile | null) => {
    // 1. Determine the Base Theme for the Interface
    let baseTheme = SOLUTIUM_THEMES.find(t => t.name === 'fluent-light') || SOLUTIUM_THEMES[0]; // Default fallback to Windows 11

    if (user) {
        // A. Priority: uiStyle (Windows 11 vs Solutium)
        if (user.uiStyle === 'windows') {
            const preset = SOLUTIUM_THEMES.find(t => t.name === 'fluent-light');
            if (preset) baseTheme = preset;
        } 
        // B. Secondary: activeTheme (selected from the grid)
        else if (user.activeTheme) {
            const active = SOLUTIUM_THEMES.find(t => t.name === user.activeTheme);
            if (active) baseTheme = active;
        }
    }

    // 2. Apply Customizations (Colors, Fonts, etc.)
    const isWindowsStyle = (user?.uiStyle || 'windows') === 'windows'; // Default to windows style
    
    const finalInterfaceTheme: Theme = {
        ...baseTheme,
        // Override colors if user has custom preference AND it's NOT Windows 11 style
        colors: (user?.themePreference === 'custom' && !isWindowsStyle && project) ? {
            ...baseTheme.colors,
            primary: project.brandColors?.[0] || baseTheme.colors.primary,
            secondary: project.brandColors?.[1] || baseTheme.colors.secondary,
            accent: project.brandColors?.[2] || baseTheme.colors.accent,
        } : baseTheme.colors,
        // Override style properties if user has them defined
        // Windows 11 style blocks fontFamily and borderRadius, but allows baseSize (as requested)
        fontFamily: (!isWindowsStyle && user?.fontFamily) ? user.fontFamily : baseTheme.fontFamily,
        borderRadius: (!isWindowsStyle && user?.borderRadius) ? user.borderRadius : baseTheme.borderRadius,
        baseSize: user?.baseSize || baseTheme.baseSize,
        uiStyle: user?.uiStyle || 'windows', // Default to windows style
    };

    setInterfaceTheme(finalInterfaceTheme);

    // 3. Update Project Theme (for Satellite apps)
    // By default, satellites follow the global style and theme
    if (project) {
        setProjectTheme(finalInterfaceTheme);
    }
  }, []);

  useEffect(() => {
    updateThemes(currentProject, user);
  }, [currentProject, user, updateThemes]);

  return (
    <ThemeContext.Provider value={{ 
      interfaceTheme, 
      projectTheme, 
      setInterfaceTheme, 
      setProjectTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
