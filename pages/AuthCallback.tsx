import React, { useEffect } from 'react';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    // Extraer el token del hash de la URL (#access_token=...)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      
      if (token && window.opener) {
        // Enviar el token a la ventana principal
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token }, window.location.origin);
        window.close();
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Conectando con Solutium...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
