import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons, INDUSTRIES } from '../constants';
import { Input } from './Input';

// Add onNavigate prop to allow redirect to settings
interface OnboardingProps {
    onNavigate: (tab: string) => void;
}

const OnboardingWizard: React.FC<OnboardingProps> = ({ onNavigate }) => {
  const { user, updateProfile, createProject, installApp, t, currentLang, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  
  // Industry Selection State
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // GUEST AUTO-FILL LOGIC
  const isGuest = user?.role === 'guest';

  useEffect(() => {
      if (isGuest) {
          setProjectName(t.demoProjectName);
          // Default to Technology or first item if not available
          setSelectedIndustry('Technology'); // Assuming Technology exists in both lang lists or use index
      }
  }, [isGuest, t.demoProjectName]);

  // 1. Create Project Logic
  const handleCreateProject = () => {
      if (!projectName.trim()) return;
      
      const finalIndustry = (selectedIndustry === 'Other' || selectedIndustry === 'Otro') ? customIndustry : selectedIndustry;
      
      createProject(projectName, finalIndustry);

      // GUEST SHORTCUT: Go straight to Portfolio
      if (isGuest) {
          setIsLoading(true);
          setTimeout(() => {
              onNavigate('portfolio');
              updateProfile({ onboardingCompleted: true });
          }, 800);
      } else {
          setStep(2);
      }
  };

  // 2. Install App Logic
  const handleSelectGoalSafe = async (appId: string) => {
    setSelectedGoal(appId);
    setIsLoading(true);

    setTimeout(() => {
        installApp(appId);
        setIsLoading(false);
        setShowConfigModal(true);
    }, 1500);
  };

  const finishOnboarding = (goToSettings: boolean) => {
      // 1. Force navigation first if requested
      if (goToSettings) {
         onNavigate('project-settings');
      }
      
      // 2. Then update profile state which unmounts this component
      // We wrap in timeout to ensure state update in App.tsx might process first or concurrently
      setTimeout(() => {
        updateProfile({ onboardingCompleted: true });
      }, 50);
  };

  const goals = [
    { 
        id: 'web-builder', 
        label: t.wizGoalWeb, 
        icon: Icons.WebBuilder,
        color: 'bg-blue-100 text-blue-600'
    },
    { 
        id: 'invoicer', 
        label: t.wizGoalInvoice, 
        icon: Icons.Invoice,
        color: 'bg-green-100 text-green-600' 
    },
    { 
        id: 'booking', 
        label: t.wizGoalBooking, 
        icon: Icons.Calendar,
        color: 'bg-purple-100 text-purple-600' 
    },
  ];

  if (isLoading) {
      return (
          <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-solutium-blue border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-bold text-solutium-dark animate-pulse">{t.wizSettingUp}</h2>
              <p className="text-solutium-grey mt-2">Solutium.app</p>
          </div>
      );
  }

  // CONFIGURATION MODAL OVERLAY
  if (showConfigModal) {
      return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                  <div className="w-12 h-12 bg-blue-100 text-solutium-blue rounded-full flex items-center justify-center mb-4">
                      <Icons.Settings />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t.configModalTitle}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                      {t.configModalDesc}
                  </p>
                  <div className="flex flex-col space-y-3">
                      <button 
                        onClick={() => finishOnboarding(true)}
                        className="w-full py-3 bg-solutium-blue text-white rounded-lg font-bold hover:bg-solutium-dark transition-colors"
                      >
                          {t.accept}
                      </button>
                      <button 
                        onClick={() => finishOnboarding(false)}
                        className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                      >
                          {t.later}
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/3 bg-solutium-dark text-white p-12 flex-col justify-between relative overflow-hidden">
        
        {/* NEW: Back to Home Button for Guests */}
        <div className="absolute top-6 left-6 z-20">
             <button 
                onClick={logout}
                className="flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium group"
             >
                <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                {t.backToStart}
             </button>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-solutium-blue rounded-full opacity-20 blur-3xl transform translate-x-10 -translate-y-10"></div>
        
        <div className="mt-12">
            <img src="https://solutium.app/solutium-logo-blanco.png" alt="Solutium" className="h-8 w-auto mb-8" />
            <h1 className="text-4xl font-bold mb-4 leading-tight">
                {t.wizWelcome} <br/>
                <span className="text-solutium-yellow">{user?.name.split(' ')[0]}</span>.
            </h1>
            <p className="text-slate-300 text-lg">
                {t.wizSubtitle}
            </p>
        </div>

        <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-slate-400">
                <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-solutium-yellow' : 'bg-slate-600'}`}></div>
                <span className={step === 1 ? 'text-white font-bold' : ''}>{t.wizStep1Title}</span>
            </div>
            {!isGuest && (
                <div className="flex items-center space-x-3 text-sm text-slate-400">
                    <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-solutium-yellow' : 'bg-slate-600'}`}></div>
                    <span className={step === 2 ? 'text-white font-bold' : ''}>{t.wizStep2Title}</span>
                </div>
            )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white relative">
          
          {/* NEW: Mobile Back Button */}
          <div className="lg:hidden absolute top-4 left-4">
               <button 
                  onClick={logout}
                  className="flex items-center text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
               >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  {t.backToStart}
               </button>
          </div>

          <div className="w-full max-w-lg">
              <div className="lg:hidden mb-8 mt-8">
                <h1 className="text-3xl font-bold text-solutium-dark mb-2">
                    {t.wizWelcome} <span className="text-solutium-blue">{user?.name.split(' ')[0]}</span>
                </h1>
              </div>

              {/* STEP 1: CREATE PROJECT */}
              {step === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                      <h2 className="text-2xl font-bold text-slate-900">{t.wizStep1Title}</h2>
                      <p className="text-slate-500">{t.wizStep1Desc}</p>

                      <Input 
                        label={t.labelProjectName}
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder={t.phProjectName}
                        autoFocus
                        disabled={isGuest} // DISABLE FOR GUEST
                        className={isGuest ? 'bg-slate-100 cursor-not-allowed' : ''}
                      />

                      <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                              {t.labelCategory} 
                          </label>
                          <select
                              value={selectedIndustry}
                              onChange={(e) => setSelectedIndustry(e.target.value)}
                              disabled={isGuest} // DISABLE FOR GUEST
                              className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white ${isGuest ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                          >
                              <option value="" disabled>{t.wizSelectIndustry}</option>
                              {INDUSTRIES[currentLang].map((ind) => (
                                  <option key={ind} value={ind}>{ind}</option>
                              ))}
                          </select>
                      </div>

                      {/* Show Text Input if Other is selected */}
                      {(selectedIndustry === 'Other' || selectedIndustry === 'Otro') && (
                          <Input 
                            label={t.wizOtherIndustry}
                            value={customIndustry}
                            onChange={(e) => setCustomIndustry(e.target.value)}
                            placeholder={t.phIndustry}
                            disabled={isGuest}
                          />
                      )}

                      <button
                        onClick={handleCreateProject}
                        disabled={!projectName.trim() || !selectedIndustry || ((selectedIndustry === 'Other' || selectedIndustry === 'Otro') && !customIndustry)}
                        className="w-full px-6 py-3 bg-solutium-blue text-white rounded-lg font-bold hover:bg-solutium-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t.wizNext}
                      </button>
                  </div>
              )}

              {/* STEP 2: SELECT APP (GOAL) - Only shown if not guest */}
              {step === 2 && !isGuest && (
                  <div className="space-y-6 animate-fadeIn">
                      <h2 className="text-2xl font-bold text-slate-900">{t.wizStep2Title}</h2>
                      
                      <div className="grid gap-4">
                          {goals.map((goal) => {
                              const Icon = goal.icon;
                              return (
                                  <button
                                    key={goal.id}
                                    onClick={() => handleSelectGoalSafe(goal.id)}
                                    className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
                                        selectedGoal === goal.id 
                                        ? 'border-solutium-blue bg-blue-50/50' 
                                        : 'border-slate-100 hover:border-solutium-blue/30'
                                    }`}
                                  >
                                      <div className={`p-3 rounded-lg mr-4 ${goal.color}`}>
                                          <Icon />
                                      </div>
                                      <div>
                                          <span className="block font-bold text-slate-800">{goal.label}</span>
                                          <span className="text-xs text-slate-500">Auto-install</span>
                                      </div>
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;