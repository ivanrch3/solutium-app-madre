import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { storageService } from './services/storageService';
import { listenForSatelliteSave } from './utils/satelliteConnection';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import MyApps from './pages/MyApps';
import Portfolio from './pages/Portfolio';
import Integrations from './pages/Integrations';
import CRM from './pages/CRM';
import Calendar from './pages/Calendar';
import TechRoadmap from './pages/TechRoadmap';
import ProjectSettings from './pages/ProjectSettings';
import Profile from './pages/Profile';
import Administration from './pages/Administration';
import Statistics from './pages/Statistics';
import Assets from './pages/Assets';
import AuthCallback from './pages/AuthCallback';
import EmptyState from './pages/EmptyState';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

const MotherApp = () => {
  const { user, isLoading } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('assets');

  // Listen for Satellite Saves
  useEffect(() => {
    const cleanup = listenForSatelliteSave((projectId, appId, data, metadata) => {
      storageService.saveSatelliteData(projectId, appId, data, metadata);
      showNotification(`Diseño guardado para ${projectId} (${appId})`, 'success');
    });
    return cleanup;
  }, [showNotification]);

  // Load active tab from local storage or set default based on role
  useEffect(() => {
      const stored = storageService.getActiveTab();
      if (stored) {
          setActiveTab(stored);
      } else if (user) {
          const defaultTab = 'assets';
          setActiveTab(defaultTab);
          storageService.setActiveTab(defaultTab);
      }
  }, [user]);

  const handleNavigate = (tab: string) => {
      setActiveTab(tab);
      storageService.setActiveTab(tab);
  };

  if (isLoading) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-solutium-blue animate-spin" />
          </div>
      );
  }

  if (!user) return <Landing />;

  // Special route for OAuth callbacks that doesn't need the full Layout
  if (window.location.pathname === '/auth-callback') {
      return <AuthCallback />;
  }

  // Show Empty State for users with no projects
  if (user.role === 'user' && (!user.projects || user.projects.length === 0)) {
      return <EmptyState />;
  }

  return (
    <Layout activeTab={activeTab} onNavigate={handleNavigate}>
      <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
        <Dashboard />
      </div>
      <div className={activeTab === 'my-apps' ? 'block' : 'hidden'}>
        <MyApps onNavigate={handleNavigate} />
      </div>
      <div className={activeTab === 'portfolio' ? 'block' : 'hidden'}>
        <Portfolio />
      </div>
      <div className={activeTab === 'assets' ? 'block' : 'hidden'}>
        <Assets />
      </div>
      <div className={activeTab === 'crm' ? 'block' : 'hidden'}>
        <CRM />
      </div>
      <div className={activeTab === 'calendar' ? 'block' : 'hidden'}>
        <Calendar />
      </div>
      <div className={activeTab === 'integrations' ? 'block' : 'hidden'}>
        <Integrations />
      </div>
      <div className={activeTab === 'tech-roadmap' ? 'block' : 'hidden'}>
        <TechRoadmap />
      </div>
      <div className={activeTab === 'project-settings' ? 'block' : 'hidden'}>
        <ProjectSettings />
      </div>
      <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
        <Profile onNavigate={handleNavigate} />
      </div>
      <div className={activeTab === 'administration' ? 'block' : 'hidden'}>
        <Administration onNavigate={handleNavigate} />
      </div>
      <div className={activeTab === 'statistics' ? 'block' : 'hidden'}>
        <Statistics />
      </div>
    </Layout>
  );
};

import { NavigationProvider } from './context/NavigationContext';

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ThemeProvider>
          <NavigationProvider>
            <MotherApp />
          </NavigationProvider>
        </ThemeProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;