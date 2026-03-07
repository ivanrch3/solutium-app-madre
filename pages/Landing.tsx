import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthView } from '../types';
import { Input } from '../components/Input';

const Landing: React.FC = () => {
  const { login, loginWithGoogle, register, guestLogin, setLanguage, t, currentLang, localMode, setLocalMode } = useAuth();
  const [view, setView] = useState<AuthView>(AuthView.LOGIN);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@solutium.app');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Example User Login (Empty credentials)
    if (view === AuthView.LOGIN && email === '' && password === '') {
      await login(''); 
      return;
    }

    if (view === AuthView.REGISTER) {
      if (!name) {
        alert('Por favor, ingresa tu nombre');
        return;
      }
      if (!email || !password) {
        alert('Por favor, ingresa correo y contraseña');
        return;
      }
      await register(email, password, name);
    } else {
      // Login
      await login(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans overflow-x-hidden">
      <style>{`
        html, body {
            max-width: 100%;
            overflow-x: hidden;
        }
      `}</style>
      {/* Left: Brand/Marketing */}
      <div className="lg:w-1/2 bg-solutium-dark p-12 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Abstract shapes for branding */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-solutium-blue opacity-20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-solutium-yellow opacity-10 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
             {/* Logo instead of Text */}
             <img 
                src="https://solutium.app/solutium-imagotipo-blanco.png" 
                alt="Solutium Logo" 
                className="h-10 w-auto mb-6" 
             />
             
            <div className="flex space-x-2">
                 <button 
                   onClick={() => setLocalMode(!localMode)} 
                   className={`text-[10px] px-2 py-1 rounded border transition-all flex items-center gap-1.5 ${
                     localMode 
                     ? 'bg-solutium-blue border-solutium-blue text-white' 
                     : 'border-slate-500 text-slate-400 hover:border-slate-300'
                   }`}
                   title={localMode ? 'Modo Local Activado (Supabase Bypass)' : 'Modo Servidor Activado (Supabase)'}
                 >
                   <div className={`w-1.5 h-1.5 rounded-full ${localMode ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
                   {localMode ? 'LOCAL' : 'SERVER'}
                 </button>
                 <button onClick={() => setLanguage('es')} className={`text-xs px-2 py-1 rounded ${currentLang === 'es' ? 'bg-solutium-yellow text-solutium-dark' : 'text-slate-400'}`}>ES</button>
                 <button onClick={() => setLanguage('en')} className={`text-xs px-2 py-1 rounded ${currentLang === 'en' ? 'bg-solutium-yellow text-solutium-dark' : 'text-slate-400'}`}>EN</button>
            </div>
          </div>
         
          <div className="mt-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
               {t.landingTitle}
            </h2>
            <p className="text-xl text-slate-300 max-w-md leading-relaxed">
                {t.landingSubtitle}
            </p>
          </div>
        </div>
        
        <div className="relative z-10 space-y-4 mt-12">
          <div className="flex items-center space-x-4 group">
            <div className="w-10 h-10 rounded-full bg-solutium-blue text-white flex items-center justify-center font-bold border border-solutium-grey/50 group-hover:border-solutium-yellow transition-colors">1</div>
            <p className="text-slate-300 group-hover:text-white transition-colors">{t.feature1}</p>
          </div>
          <div className="flex items-center space-x-4 group">
            <div className="w-10 h-10 rounded-full bg-solutium-blue text-white flex items-center justify-center font-bold border border-solutium-grey/50 group-hover:border-solutium-yellow transition-colors">2</div>
            <p className="text-slate-300 group-hover:text-white transition-colors">{t.feature2}</p>
          </div>
          <div className="flex items-center space-x-4 group">
            <div className="w-10 h-10 rounded-full bg-solutium-blue text-white flex items-center justify-center font-bold border border-solutium-grey/50 group-hover:border-solutium-yellow transition-colors">3</div>
            <p className="text-slate-300 group-hover:text-white transition-colors">{t.feature3}</p>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-solutium-grey mt-12">
          {t.copyright}
        </div>
      </div>

      {/* Right: Auth Forms */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          
          <div className="flex justify-center mb-8 border-b border-slate-100 pb-4">
             <button 
              onClick={() => setView(AuthView.LOGIN)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${view === AuthView.LOGIN ? 'text-solutium-blue border-b-2 border-solutium-blue' : 'text-slate-400'}`}
             >
               {t.login}
             </button>
             <button 
              onClick={() => setView(AuthView.REGISTER)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${view === AuthView.REGISTER ? 'text-solutium-blue border-b-2 border-solutium-blue' : 'text-slate-400'}`}
             >
               {t.register}
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === AuthView.REGISTER && (
              <Input 
                label={t.labelName} 
                placeholder={t.phNameAuth} 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <div className="relative">
              <Input 
                label={t.labelEmail} 
                type="email" 
                placeholder="admin@solutium.app" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email === 'admin@solutium.app' && (
                <div className="absolute top-0 right-0 -mt-1">
                  <span className="bg-solutium-blue text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                    {t.masterAccessDetected || 'ACCESO MAESTRO DETECTADO'}
                  </span>
                </div>
              )}
            </div>
            <Input 
              label={t.labelPassword} 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button 
              type="submit" 
              className="w-full py-3 bg-solutium-blue hover:bg-solutium-dark text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {view === AuthView.LOGIN ? t.signIn : t.createAccount}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-xs text-slate-400 uppercase tracking-wide">Or</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => loginWithGoogle()}
              className="w-full py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{currentLang === 'es' ? 'Continuar con Google' : 'Continue with Google'}</span>
            </button>

            <button 
              onClick={guestLogin}
              className="w-full py-3 bg-white border border-slate-300 text-solutium-dark font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
            >
               <svg className="w-5 h-5 text-solutium-grey" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
               </svg>
               <span>{t.guest}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;