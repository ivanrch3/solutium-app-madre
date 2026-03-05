# CONTEXTO DEL PROYECTO: SATÉLITE SOLUTIUM (CONSTRUCTOR WEB)

Este archivo contiene el código fuente base para el "Solutium Satellite Starter Kit".
Úsalo como contexto para generar la aplicación "Constructor Web".

## 1. package.json
```json
{
  "name": "solutium-satellite-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "dev:local": "tsx server.ts --port 3004",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview --port 3004 --host",
    "update-sdk": "node scripts/update-solutium.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.344.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "framer-motion": "^11.0.8"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.6",
    "tsx": "^4.7.1"
  }
}
```

## 2. vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000, 
    strictPort: false, 
    host: true, 
    middlewareMode: true, 
    cors: true 
  }
})
```

## 3. server.ts
```typescript
import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';

async function startServer() {
  const app = express();

  // Use CORS middleware to allow cross-origin requests
  app.use(cors());

  // Explicit route for manifest.json to ensure CORS and correct data
  app.get('/manifest.json', (req, res) => {
    res.json({
      "id": "web-constructor",
      "name": "Constructor Web",
      "description": "Crea sitios web y landing pages con IA y módulos inteligentes.",
      "version": "1.0.0",
      "sdkVersion": "1.1.0",
      "category": "Marketing y Ventas",
      "icon": "Code",
      "scopes": ["profile", "crm", "products"],
      "url": "http://localhost:3004",
      "logoUrl": ""
    });
  });

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Use Vite's middleware
  app.use(vite.middlewares);

  // Robust Port Parsing
  const args = process.argv;
  let port = 3000; // Default fallback

  console.log('[Server] Arguments:', args); // Debug log

  // 1. Try --port 3004
  const portIndex = args.indexOf('--port');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const p = parseInt(args[portIndex + 1], 10);
    if (!isNaN(p)) {
      port = p;
      console.log('[Server] Port detected from flag:', port);
    }
  }

  // 2. Try --port=3004
  const portEquals = args.find(a => a.startsWith('--port='));
  if (portEquals) {
    const p = parseInt(portEquals.split('=')[1], 10);
    if (!isNaN(p)) {
      port = p;
      console.log('[Server] Port detected from flag (equals):', port);
    }
  }

  // 3. Environment variable (Only if not set by flag)
  if (process.env.PORT && port === 3000) {
     const p = parseInt(process.env.PORT, 10);
     if (!isNaN(p)) {
        port = p;
        console.log('[Server] Port detected from env:', port);
     }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 Satellite server running at: http://localhost:${port}`);
    console.log(`   (Ensure this URL matches the one in Solutium Dashboard)\n`);
  });
}

startServer();
```

## 4. src/lib/solutium-sdk.ts (CRÍTICO: NO MODIFICAR LÓGICA DE CONEXIÓN)
```typescript
/**
 * SOLUTIUM SATELLITE SDK
 * Version: 1.1.0
 * Protocol: S.I.P. v2
 */
import { useEffect, useState } from 'react';

export interface SolutiumPayload {
    userId: string;
    projectId: string;
    role: string;
    timestamp: number;
    scopes: string[]; // Scopes requested by this satellite
    // New: Bridge Configurations
    crmConfig?: {
        apiUrl: string;
        authToken: string;
    };
    productsConfig?: {
        apiUrl: string;
        authToken: string;
    };
    calendarConfig?: {
        apiUrl: string;
        authToken: string;
    };
    enableBootObserver?: boolean;
    data?: {
        profile?: {
            name: string;
            email: string;
            avatar?: string;
        };
        // Legacy data support (optional)
        crm?: {
            customersCount: number;
            recentLeads: any[];
        };
        invoices?: {
            pendingCount: number;
            totalRevenue: number;
        };
        calendar?: {
            nextEvents: any[];
        };
    };
    projectData?: {
        name: string;
        colors: string[];
        logoUrl?: string;
        fontFamily?: string;
        baseSize?: string;
        borderRadius?: string;
        themePreset?: string;
        contact?: {
            email: string;
            phone: string;
            address: string;
            website?: string;
            socials?: { facebook?: string, instagram?: string, linkedin?: string };
        };
    };
}

export const useSolutium = () => {
    const [config, setConfig] = useState<SolutiumPayload | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isBooting, setIsBooting] = useState(false);
    const [bootLogs, setBootLogs] = useState<{msg: string, type: 'info' | 'success'}[]>([]);

    // Capabilities (Latent Data Flags)
    const capabilities = {
        canAccessCRM: !!config?.crmConfig,
        canAccessProducts: !!config?.productsConfig,
        canAccessCalendar: !!config?.calendarConfig,
        canAccessProfile: !!config?.data?.profile,
        canAccessProject: !!config?.projectData
    };

    useEffect(() => {
        // 1. Listen for Handshake from Mother App
        const handler = async (event: MessageEvent) => {
            if (event.data && event.data.type === 'SOLUTIUM_CONFIG') {
                console.log('[Satellite] Received Config:', event.data.payload);
                const payload = event.data.payload as SolutiumPayload;
                
                if (payload.enableBootObserver !== false) {
                    setIsBooting(true);
                    setBootLogs([{msg: 'Conexión establecida con Solutium OS.', type: 'success'}]);
                    
                    await new Promise(r => setTimeout(r, 500));
                    setBootLogs(prev => [...prev, {msg: 'Recibiendo Perfil de Usuario...', type: 'info'}]);
                    await new Promise(r => setTimeout(r, 400));
                    
                    if (payload.projectData) {
                        setBootLogs(prev => [...prev, {msg: 'Recibiendo Datos del Proyecto (Theme, Logo)...', type: 'info'}]);
                        await new Promise(r => setTimeout(r, 400));
                        applyTheme(
                            payload.projectData.colors, 
                            payload.projectData.fontFamily, 
                            payload.projectData.baseSize,
                            payload.projectData.borderRadius,
                            payload.projectData.themePreset
                        );
                    }
                    
                    if (payload.crmConfig) {
                        setBootLogs(prev => [...prev, {msg: 'Recibiendo Contrato: Customer (CRM)...', type: 'info'}]);
                        await new Promise(r => setTimeout(r, 400));
                    }
                    
                    if (payload.productsConfig) {
                        setBootLogs(prev => [...prev, {msg: 'Recibiendo Contrato: Products...', type: 'info'}]);
                        await new Promise(r => setTimeout(r, 400));
                    }

                    if (payload.calendarConfig) {
                        setBootLogs(prev => [...prev, {msg: 'Recibiendo Contrato: Calendar...', type: 'info'}]);
                        await new Promise(r => setTimeout(r, 400));
                    }
 
                    setBootLogs(prev => [...prev, {msg: 'Desencriptando payload y verificando firmas...', type: 'info'}]);
                    await new Promise(r => setTimeout(r, 600));
                    setBootLogs(prev => [...prev, {msg: 'Sistema inicializado correctamente.', type: 'success'}]);
                    await new Promise(r => setTimeout(r, 800));
                } else {
                    // Fast boot
                    if (payload.projectData) {
                        applyTheme(
                            payload.projectData.colors, 
                            payload.projectData.fontFamily, 
                            payload.projectData.baseSize,
                            payload.projectData.borderRadius,
                            payload.projectData.themePreset
                        );
                    }
                }

                setConfig(payload);
                setIsBooting(false);
                setIsReady(true);

                // Send ACK
                if (event.source) {
                    (event.source as Window).postMessage({
                        type: 'SOLUTIUM_ACK',
                        payload: {
                            status: 'connected',
                            receivedDataSummary: {
                                projectId: payload.projectId,
                                name: payload.projectData?.name
                            }
                        }
                    }, event.origin as any);
                }
            }
        };

        window.addEventListener('message', handler);

        // 3. Signal Mother App that Satellite is ready
        const signalReady = () => {
            const message = { type: 'SOLUTIUM_SATELLITE_INIT', payload: { version: '1.0.0', timestamp: Date.now() } };
            if (window.parent !== window) {
                window.parent.postMessage(message, '*');
            } else if (window.opener) {
                window.opener.postMessage(message, '*');
            }
        };

        signalReady();

        // 2. Check URL Params (Legacy/Direct Link Support)
        const params = new URLSearchParams(window.location.search);
        let token = params.get('token');
        
        if (!token && window.location.hash.includes('token=')) {
            const hashParts = window.location.hash.split('?');
            if (hashParts.length > 1) {
                const hashParams = new URLSearchParams(hashParts[1]);
                token = hashParams.get('token');
            } else {
                const match = window.location.hash.match(/[#&]token=([^&]+)/);
                if (match) token = match[1];
            }
        }

        if (token) {
            try {
                const cleanToken = token.replace(/%3D/g, '=').replace(/%2F/g, '/').replace(/%2B/g, '+');
                const decoded = JSON.parse(decodeURIComponent(escape(window.atob(cleanToken))));
                handler({ data: { type: 'SOLUTIUM_CONFIG', payload: decoded } } as MessageEvent);
            } catch (e) {
                console.error('Invalid Token in URL');
            }
        }

        return () => window.removeEventListener('message', handler);
    }, []);

    const simulateConnection = () => {
        const mockPayload: SolutiumPayload = {
            userId: 'dev-user-1',
            projectId: 'dev-project-1',
            role: 'admin',
            timestamp: Date.now(),
            scopes: ['profile'],
            data: {
                profile: { name: 'Dev User', email: 'dev@example.com' }
            },
            projectData: {
                name: 'Development Mode',
                colors: ['#3b82f6', '#1e293b', '#f59e0b'],
                fontFamily: 'Inter',
                baseSize: '16px',
                borderRadius: '0.5rem',
                themePreset: 'default',
                contact: {
                    email: 'contact@dev.com',
                    phone: '+1234567890',
                    address: '123 Dev St'
                }
            }
        };
        window.postMessage({ type: 'SOLUTIUM_CONFIG', payload: mockPayload }, '*');
    };

    const saveData = (data: any, metadata?: { status?: string, tags?: string[], author?: string, updatedAt?: number }) => {
        if (!config?.projectId) {
            console.error('[Solutium SDK] Cannot save: No Project ID configured.');
            return;
        }
        
        const message = {
            type: 'SOLUTIUM_SAVE',
            payload: {
                projectId: config.projectId,
                appId: 'web-constructor', // Identificador de la App
                timestamp: Date.now(),
                data: data,
                metadata: metadata
            }
        };

        if (window.opener) {
            window.opener.postMessage(message, '*');
        } else if (window.parent !== window) {
            window.parent.postMessage(message, '*');
        } else {
            console.warn('[Solutium SDK] No parent window found to save data.');
        }
    };

    return { config, capabilities, isReady, isBooting, bootLogs, simulateConnection, saveData };
};

const applyTheme = (colors?: string[], fontFamily?: string, baseSize?: string, borderRadius?: string, themePreset?: string) => {
    const root = document.documentElement;
    document.body.classList.remove('theme-fluent');

    if (themePreset === 'fluent-light') {
        document.body.classList.add('theme-fluent');
        if (!borderRadius) borderRadius = '0.5rem'; 
        if (!fontFamily) fontFamily = 'Segoe UI';
    }

    if (colors && Array.isArray(colors)) {
        if (colors[0]) root.style.setProperty('--color-primary', colors[0]);
        if (colors[1]) root.style.setProperty('--color-secondary', colors[1]);
        if (colors[2]) root.style.setProperty('--color-accent', colors[2]);
        
        if (colors[0]) {
            root.style.setProperty('--color-primary-rgb', hexToRgb(colors[0]));
            root.style.setProperty('--color-primary-light', colors[0] + '20'); 
        }
    }

    if (fontFamily) root.style.setProperty('--font-family', fontFamily);
    if (baseSize) root.style.setProperty('--base-size', baseSize);
    if (borderRadius) root.style.setProperty('--border-radius', borderRadius);
};

const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
};
```

## 5. src/App.tsx (Punto de Entrada)
```typescript
import { useSolutium } from './lib/solutium-sdk';
import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';

function App() {
  const { config, isReady, simulateConnection, saveData } = useSolutium();
  const [modules, setModules] = useState<any[]>([]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500">Conectando con Solutium...</p>
        <button 
          onClick={simulateConnection}
          className="text-xs text-blue-500 hover:underline"
        >
          (Modo Desarrollo: Simular Conexión)
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <div className="mb-8">
            <img src={config?.projectData?.logoUrl} className="h-8 w-auto mb-2" alt="Logo" />
            <h1 className="font-bold text-slate-800">{config?.projectData?.name}</h1>
        </div>
        
        <div className="mt-auto">
            <p className="text-xs text-slate-400">Usuario: {config?.data?.profile?.name}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Constructor Web</h2>
            <button 
                onClick={() => saveData(
                  { modules, version: 'draft-1' }, 
                  { status: 'draft', tags: ['Borrador', 'Inicial'], author: config?.userId || 'Usuario', updatedAt: Date.now() }
                )}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                <Save className="w-4 h-4" />
                Guardar Diseño
            </button>
        </header>

        <div className="bg-white rounded-xl border border-slate-200 p-12 min-h-[500px] flex items-center justify-center text-slate-400 border-dashed">
            <p>El área de diseño (Canvas) se implementará aquí.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
```

## 6. src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #3b82f6;
  --color-secondary: #1e293b;
  --color-accent: #f59e0b;
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #0f172a;
  --font-family: 'Inter';
  --base-size: 16px;
  --border-radius: 0.5rem;
}

html {
  font-size: var(--base-size);
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-family), 'Inter', system-ui, sans-serif;
}
```
