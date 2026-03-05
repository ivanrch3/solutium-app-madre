import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthView } from '../types';
import { Input } from '../components/Input';

const Landing: React.FC = () => {
  const { login, guestLogin, setLanguage, t, currentLang } = useAuth();
  const [view, setView] = useState<AuthView>(AuthView.LOGIN);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@solutium.app');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Example User Login (Empty credentials)
    if (view === AuthView.LOGIN && email === '' && password === '') {
      login('', 'Usuario de Ejemplo'); // Use a distinct name for clarity
      return;
    }

    if (view === AuthView.REGISTER && !name) {
      alert('Por favor, ingresa tu nombre');
      return;
    }
    
    // If user enters specific admin email, they get admin role (simulated)
    const finalName = email === 'admin@solutium.app' ? 'Super Administrador' : (name || 'Usuario');
    login(email, finalName);
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
  );
};

export default Landing;