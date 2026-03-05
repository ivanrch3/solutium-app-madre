import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const LATEST_SDK_CODE = `
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
    
    // --- 1. PERFIL DE USUARIO ---
    userProfile: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        avatarUrl?: string;
        language?: string;
        role: string;
        preferences?: {
            theme?: 'light' | 'dark' | 'system';
            density?: 'compact' | 'comfortable';
        };
    };

    // --- 2. EQUIPO ---
    teamMembers?: Array<{
        name: string;
        email: string;
        role: string;
        avatarUrl?: string;
    }>;

    // --- 3. PROYECTOS ACTIVOS ---
    activeProjects?: Array<{
        id: string;
        name: string;
    }>;

    // --- 4. CONFIGURACIÓN DE NEGOCIO ---
    businessConfig: {
        industry?: string;
        industrySpec?: string;
        whatsapp?: string;
        website?: string;
        email?: string;
        address?: string; // Location
        socials?: {
            facebook?: string;
            instagram?: string;
            linkedin?: string;
            twitter?: string;
        };
    };

    // --- 5. IDENTIDAD DEL PROYECTO ---
    projectData?: { // Mantener compatibilidad con versiones anteriores, pero expandir
        name: string;
        colors: string[];
        logoUrl?: string;
        fontFamily?: string;
        baseSize?: string;
        borderRadius?: string;
        themePreset?: string;
        contact?: { // Legacy mapping
            email: string;
            phone: string;
            address: string;
            website?: string;
            socials?: { facebook?: string, instagram?: string, linkedin?: string };
        };
    };

    // --- 6. CLIENTES (CRM) ---
    crmData?: Array<{
        id: string;
        name: string;
        email: string;
        phone?: string;
        role?: string; // Cargo
        businessAssigned?: string[];
        company?: string;
        status?: string;
        source?: string;
        notes?: string;
    }>;
    // Bridge Legacy
    crmConfig?: {
        apiUrl: string;
        authToken: string;
    };

    // --- 7. PRODUCTOS Y SERVICIOS ---
    productsData?: Array<{
        id: string;
        name: string;
        description?: string;
        unitCost?: number;
        code?: string;
        type: 'product' | 'service';
        status?: string;
    }>;
    // Bridge Legacy
    productsConfig?: {
        apiUrl: string;
        authToken: string;
    };

    // --- 8. AGENDA Y CITAS ---
    calendarConfig?: {
        enabled: boolean;
        apiUrl?: string;
        authToken?: string;
    };

    // --- 9. ACTIVOS DIGITALES ---
    currentAsset?: {
        id: string;
        originApp: string;
        name: string;
        status?: string;
        tags?: string[];
        author?: string;
        createdAt?: number;
        editedAt?: number;
        metadata?: any;
        data?: any; // The actual content
    };
    
    // Legacy data support (optional)
    enableBootObserver?: boolean;
    data?: {
        profile?: { // Legacy mapping
            name: string;
            email: string;
            avatar?: string;
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
            // Security Check: You might want to validate event.origin here in production
            
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
                    }, event.origin as any); // Type cast for strict mode
                }
            }
        };

        window.addEventListener('message', handler);

        // 3. Signal Mother App that Satellite is ready
        // This prevents race conditions where the Mother App sends config before Satellite is listening
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
        
        // Check hash if not in search (prevents HTTP 431 Header Too Large)
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
                // Clean token and decode using UTF-8 safe method
                const cleanToken = token.replace(/%3D/g, '=').replace(/%2F/g, '/').replace(/%2B/g, '+');
                console.log('[Solutium SDK] Decodificando token de URL...');
                
                const binaryString = window.atob(cleanToken);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const decodedString = new TextDecoder().decode(bytes);
                const decoded = JSON.parse(decodedString);
                
                console.log('[Solutium SDK] Token decodificado con éxito:', decoded.projectId);
                
                // Simulate event
                handler({ data: { type: 'SOLUTIUM_CONFIG', payload: decoded } } as MessageEvent);
            } catch (e) {
                console.error('[Solutium SDK] Error crítico decodificando token de URL:', e);
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
                fontFamily: 'Segoe UI',
                baseSize: '14px',
                borderRadius: '1rem',
                themePreset: 'fluent-light',
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
                appId: 'web-constructor', // Hardcoded for this kit, but should be dynamic in real apps
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

export const useAutoSave = (data: any, isDirty: boolean, onSave: () => void, delay: number = 30000) => {
    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(() => {
            onSave();
        }, delay);
        return () => clearTimeout(timer);
    }, [data, isDirty, delay, onSave]);
};

const applyTheme = (colors?: string[], fontFamily?: string, baseSize?: string, borderRadius?: string, themePreset?: string) => {
    const root = document.documentElement;
    
    // Reset any preset-specific classes
    document.body.classList.remove('theme-fluent');

    if (themePreset === 'fluent-light') {
        document.body.classList.add('theme-fluent');
        // Fluent defaults if not overridden
        if (!borderRadius) borderRadius = '1rem'; 
        if (!fontFamily) fontFamily = 'Segoe UI';
    }

    if (colors && Array.isArray(colors)) {
        if (colors[0]) {
            root.style.setProperty('--color-primary', colors[0]);
            root.style.setProperty('--color-primary-rgb', hexToRgb(colors[0]));
        }
        if (colors[1]) {
            root.style.setProperty('--color-secondary', colors[1]);
            root.style.setProperty('--color-secondary-rgb', hexToRgb(colors[1]));
        }
        if (colors[2]) {
            root.style.setProperty('--color-accent', colors[2]);
            root.style.setProperty('--color-accent-rgb', hexToRgb(colors[2]));
        }
    }

    if (fontFamily) {
        root.style.setProperty('--font-family', fontFamily);
    }
    
    if (baseSize) {
        root.style.setProperty('--base-size', baseSize);
    }

    if (borderRadius) {
        root.style.setProperty('--border-radius', borderRadius);
    }
};

const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return \`\${r}, \${g}, \${b}\`;
};
`;

export const generatePrompt = (appType: string, language: 'es' | 'en', port: number = 3001, scopes: string[] = ['profile'], logoUrl?: string, description?: string): string => {
    const isConstructorWeb = appType.toLowerCase().includes('constructor web');
    const scopeList = scopes.join(', ');
    const descInstruction = description ? `\n    - Descripción de la app: "${description}"` : '';
    
    let basePrompt = language === 'es' 
    ? `
# INSTRUCCIONES DE CONSTRUCCIÓN PARA IA

Hola, soy una IA constructora de Satélites Solutium.
Estoy construyendo una aplicación de tipo: **${appType}**.${descInstruction}
He subido el 'Solutium Satellite Starter Kit' (React + Vite + Tailwind).

## PERMISOS DE DATOS:
Este satélite tiene acceso a los siguientes ámbitos: **${scopeList}**.
Usa los datos disponibles en 'config.data' según estos permisos.
`
    : `
# AI CONSTRUCTION INSTRUCTIONS

Hello, I am a Solutium Satellite Builder AI.
I am building an application of type: **${appType}**.
I have uploaded the 'Solutium Satellite Starter Kit' (React + Vite + Tailwind).

## DATA PERMISSIONS:
This satellite has access to the following scopes: **${scopeList}**.
Use the data available in 'config.data' according to these permissions.
`;

    if (isConstructorWeb) {
        basePrompt += language === 'es'
        ? `
## REQUERIMIENTOS ESPECIALES (CONSTRUCTOR WEB):
1. **Editor de Módulos:** Implementa un sistema de "Canvas" donde el usuario pueda arrastrar o añadir módulos (Hero, Features, Pricing, etc.).
2. **Integración S.I.P. (CRÍTICO):** 
   - Debes crear un módulo llamado 'ProductShowcase'.
   - Este módulo debe consumir los datos de \`config.data.crm\` y \`config.data.products\` (si están disponibles).
   - Permite al usuario seleccionar productos de la App Madre para mostrarlos en su Landing Page.
3. **IA Generativa:** Crea un botón "Generar con IA" que use un prompt para estructurar la página automáticamente (simula la llamada a una API de IA).
4. **Publicación:** Simula un flujo de publicación donde se valide si el usuario tiene un dominio configurado.
`
        : `
## SPECIAL REQUIREMENTS (WEB CONSTRUCTOR):
1. **Module Editor:** Implement a "Canvas" system where the user can drag or add modules (Hero, Features, Pricing, etc.).
2. **S.I.P. Integration (CRITICAL):** 
   - Create a module called 'ProductShowcase'.
   - This module must consume data from \`config.data.crm\` and \`config.data.products\` (if available).
   - Allow the user to select products from the Mother App to display them on their Landing Page.
3. **Generative AI:** Create a "Generate with IA" button that uses a prompt to automatically structure the page (simulate an AI API call).
4. **Publishing:** Simulate a publishing flow where it validates if the user has a configured domain.
`;
    }

    basePrompt += language === 'es'
    ? `
## TU TAREA:
Ayúdame a construir las funcionalidades principales para este tipo de aplicación (${appType}).
Analiza el archivo de contexto completo (CONTEXTO_CODIGO_COMPLETO.txt) para entender la estructura actual.
Propón la estructura de componentes necesaria y genera el código.
`
    : `
## YOUR TASK:
Help me build the core features for this type of application (${appType}).
Analyze the full context file (FULL_CODE_CONTEXT.txt) to understand the current structure.
Propose the necessary component structure and generate the code.
`;

    // Add UI/UX and Technical Constraints...
    const constraints = language === 'es'
    ? `
## PROTOCOLO DE DATOS (IMPORTANTE):
Tu aplicación recibirá un objeto \`config\` a través del hook \`useSolutium()\`. Debes usar **EXACTAMENTE** esta estructura para leer los datos. NO inventes nombres de campos:

1.  **Perfil de Usuario:** Accesible en \`config.userProfile\`.
    *   Campos: \`{ name, email, phone, avatarUrl, language, role, preferences }\`
2.  **Equipo:** Accesible en \`config.teamMembers\`.
    *   Array de: \`{ name, email, role, avatarUrl }\`
3.  **Proyectos Activos:** Accesible en \`config.activeProjects\`.
    *   Array de: \`{ id, name }\`
4.  **Configuración de Negocio:** Accesible en \`config.businessConfig\`.
    *   Campos: \`{ industry, whatsapp, website, email, address, socials }\`
5.  **Identidad del Proyecto:** Accesible en \`config.projectData\`.
    *   Campos: \`{ name, colors, logoUrl, fontFamily }\`
6.  **Clientes (CRM):** Accesible en \`config.crmData\`.
    *   Array de: \`{ name, email, phone, role, company, status, source, notes }\`
7.  **Productos y Servicios:** Accesible en \`config.productsData\`.
    *   Array de: \`{ name, description, unitCost, code, type, status }\`
8.  **Activos Digitales:** Accesible en \`config.currentAsset\`.
    *   Campos: \`{ name, originApp, status, tags, author, createdAt, editedAt, metadata }\`

## ESTRUCTURA DE NAVEGACIÓN OBLIGATORIA:
Debes implementar la siguiente estructura en la Barra Lateral (Sidebar):
1.  **Botón "Ajustes":** Debe estar visible en el menú lateral.
2.  **Página de Ajustes:** Al hacer clic, debe mostrar una sección llamada **"Datos"**.
3.  **Pestañas de Datos:** Dentro de la sección "Datos", debes implementar las siguientes pestañas usando el componente \`<Tabs />\`:
    *   **Perfil:** Muestra todos los datos de \`config.userProfile\`.
    *   **Configuración de Negocio:** Muestra los datos de \`config.businessConfig\` y \`config.projectData\`.
    *   **Clientes:** Muestra una tabla o lista con \`config.crmData\`.
    *   **Productos o Servicios:** Muestra una tabla o lista con \`config.productsData\`.
    *   **Agenda y Citas:** Muestra la configuración de \`config.calendarConfig\`.
    *   **Activos Digitales:** Muestra los detalles de \`config.currentAsset\`.

**NOTA:** Esta visualización de datos es para fines de auditoría y verificación. Asegúrate de renderizar TODOS los campos disponibles en cada sección.

## DISEÑO Y UI/UX (OBLIGATORIO):
1. **Calidad Visual:** Diseña una interfaz profesional, limpia y moderna tipo SaaS (ej. estilo Tailwind UI o Shadcn). NO hagas interfaces simples, desordenadas o con colores base sin refinar.
2. **Estructura de Layout:** Usa un layout con Barra Lateral (Sidebar) a la izquierda y un área principal de contenido a la derecha. El contenido principal debe tener un padding generoso (ej. 'p-6' o 'p-8') y un fondo claro (ej. 'bg-slate-50' o 'bg-gray-50').
3. **Barra Lateral (Sidebar):**
    - Debe mostrar el **Logo de la Aplicación** (proporcionado en \`config.projectData.logoUrl\`${logoUrl ? ` o usa "${logoUrl}"` : ''}) en la parte superior.
    - Justo debajo del logo, debe mostrar el **Nombre de la Aplicación** (proporcionado en \`config.projectData.name\`) con el mismo tamaño visual que el logo.
    - **NO incluyas un botón de perfil/usuario** ni opciones de "Cerrar Sesión". La gestión de sesión es exclusiva de la App Madre.
    - Si necesitas mostrar el usuario actual, hazlo de forma discreta (ej. en la parte inferior del sidebar) usando \`config.userProfile.name\`.
    - **OBLIGATORIO:** Incluye el componente \`<VersionDisplay />\` (ubicado en \`src/components/VersionDisplay.tsx\`) en la parte inferior de la barra lateral.
4. **Tarjetas (Cards):** Agrupa la información y los formularios dentro de tarjetas blancas con bordes suaves y sombras ligeras ('bg-white rounded-xl border border-slate-200 shadow-sm').
5. **Jerarquía Tipográfica:** Usa títulos grandes y oscuros para las secciones principales ('text-2xl font-bold text-slate-800') y texto más pequeño y tenue para descripciones ('text-sm text-slate-500').
6. **Estados Vacíos y Carga:** Incluye siempre estados visuales agradables cuando no hay datos o la app está cargando.
7. **Interactividad:** Añade efectos 'hover' a todos los botones y elementos interactivos ('transition-colors hover:bg-opacity-90', etc.).

## RESTRICCIONES TÉCNICAS (CRÍTICO):
1. **NO modifiques 'src/lib/solutium-sdk.ts'**. Este archivo maneja la conexión crítica con la App Madre.
2. **Barra Lateral Estándar:** Debes implementar una barra lateral izquierda consistente. Recuerda: Logo arriba, Nombre de App abajo, SIN botón de perfil.
3. **Usa las variables CSS** definidas en 'tailwind.config.js' (bg-primary, text-secondary, etc.) para todo el estilo.
4. **Contexto de Usuario:** Asume que el objeto 'config' del hook 'useSolutium()' contiene los datos del usuario actual y del proyecto.
5. **Iconos:** Usa 'lucide-react' para los iconos.
6. **Puerto (CRÍTICO PARA PREVISUALIZACIÓN):** Para que la previsualización funcione en este entorno de IA, el servidor DEBE usar el puerto 3000 (o \`process.env.PORT\`). NO intentes forzar el puerto ${port} aquí, ya que romperá la previsualización. El puerto ${port} se usará cuando el usuario descargue el código y lo ejecute localmente.
7. **Identidad:** NO borres ni modifiques 'public/manifest.json' ni 'public/version.json'. Son vitales para el Semáforo de Versiones.
8. **Archivos Base y Scripts (CRÍTICO):** NO renombres ni muevas los archivos base a subcarpetas. En el archivo 'package.json', **ESTÁ ESTRICTAMENTE PROHIBIDO eliminar los scripts existentes** (especialmente 'dev:local'). Si necesitas añadir dependencias, hazlo, pero mantén intactos los scripts actuales.
9. **Dependencias:** Si agregas librerías, asegúrate de que sean compatibles con React 18.2.0. Si das instrucciones de instalación, sugiere usar \`npm install --legacy-peer-deps\` para evitar errores de ERESOLVE.
10. **CONTROL DE VERSIONES (AUTOMATIZADO):** Cuando completes una tarea que modifique la funcionalidad o corrija errores, DEBES actualizar el archivo \`public/version.json\`.
    - Incrementa la versión (SemVer) según el tipo de cambio.
    - Agrega una entrada al array \`history\` con la fecha de hoy y la lista de cambios realizados.
    - Esto es vital para que el usuario vea el historial de cambios en la interfaz.
11. **Navegación y Menús (ESTÁNDAR):** Utiliza el componente \`<Tabs />\` (ubicado en \`src/components/Tabs.tsx\`) para todas las navegaciones internas.
    - Usa \`style="primary"\` para menús principales (con subrayado).
    - Usa \`style="secondary"\` para filtros o sub-menús (estilo pastilla/pill).
    - El componente soporta desplazamiento horizontal automático en móviles.
`
    : `
## DATA PROTOCOL (IMPORTANT):
Your application will receive a \`config\` object via the \`useSolutium()\` hook. You MUST use **EXACTLY** this structure to read the data. DO NOT invent field names:

1.  **User Profile:** Accessible at \`config.userProfile\`.
    *   Fields: \`{ name, email, phone, avatarUrl, language, role, preferences }\`
2.  **Team:** Accessible at \`config.teamMembers\`.
    *   Array of: \`{ name, email, role, avatarUrl }\`
3.  **Active Projects:** Accessible at \`config.activeProjects\`.
    *   Array of: \`{ id, name }\`
4.  **Business Config:** Accessible at \`config.businessConfig\`.
    *   Fields: \`{ industry, whatsapp, website, email, address, socials }\`
5.  **Project Identity:** Accessible at \`config.projectData\`.
    *   Fields: \`{ name, colors, logoUrl, fontFamily }\`
6.  **Customers (CRM):** Accessible at \`config.crmData\`.
    *   Array of: \`{ name, email, phone, role, company, status, source, notes }\`
7.  **Products and Services:** Accessible at \`config.productsData\`.
    *   Array of: \`{ name, description, unitCost, code, type, status }\`
8.  **Digital Assets:** Accessible at \`config.currentAsset\`.
    *   Fields: \`{ name, originApp, status, tags, author, createdAt, editedAt, metadata }\`

## MANDATORY NAVIGATION STRUCTURE:
You must implement the following structure in the Sidebar:
1.  **"Settings" Button:** Must be visible in the side menu.
2.  **Settings Page:** When clicked, it must show a section called **"Data"**.
3.  **Data Tabs:** Inside the "Data" section, you must implement the following tabs using the \`<Tabs />\` component:
    *   **Profile:** Shows all data from \`config.userProfile\`.
    *   **Business Config:** Shows data from \`config.businessConfig\` and \`config.projectData\`.
    *   **Customers:** Shows a table or list with \`config.crmData\`.
    *   **Products or Services:** Shows a table or list with \`config.productsData\`.
    *   **Calendar:** Shows the configuration of \`config.calendarConfig\`.
    *   **Digital Assets:** Shows details of \`config.currentAsset\`.

**NOTE:** This data visualization is for audit and verification purposes. Ensure ALL available fields are rendered in each section.

## DESIGN AND UI/UX (MANDATORY):
1. **Visual Quality:** Design a professional, clean, and modern SaaS-like interface (e.g., Tailwind UI or Shadcn style). Do NOT create simple, messy interfaces or use unrefined base colors.
2. **Layout Structure:** Use a layout with a left Sidebar and a main content area on the right. The main content should have generous padding (e.g., 'p-6' or 'p-8') and a light background (e.g., 'bg-slate-50' or 'bg-gray-50').
3. **Sidebar Requirements:**
    - Display the **App Logo** (from \`config.projectData.logoUrl\`) at the top.
    - Directly below the logo, display the **App Name** (from \`config.projectData.name\`) with similar visual weight.
    - **Do NOT include a profile/user button** or "Logout" options. Session management is handled exclusively by the Mother App.
    - If you need to display the current user, do so discreetly (e.g., at the bottom of the sidebar) using \`config.userProfile.name\`.
    - **MANDATORY:** Include the \`<VersionDisplay />\` component (located at \`src/components/VersionDisplay.tsx\`) at the bottom of the sidebar.
4. **Cards:** Group information and forms inside white cards with soft borders and light shadows ('bg-white rounded-xl border border-slate-200 shadow-sm').
5. **Typographic Hierarchy:** Use large, dark titles for main sections ('text-2xl font-bold text-slate-800') and smaller, muted text for descriptions ('text-sm text-slate-500').
6. **Empty & Loading States:** Always include pleasant visual states when there is no data or the app is loading.
7. **Interactivity:** Add 'hover' effects to all buttons and interactive elements ('transition-colors hover:bg-opacity-90', etc.).

## TECHNICAL CONSTRAINTS (CRITICAL):
1. **Do NOT modify 'src/lib/solutium-sdk.ts'**. It handles the critical connection to the Mother App.
2. **Standard Sidebar:** You MUST implement a consistent left sidebar. Remember: Logo on top, App Name below, NO profile button.
3. **Use CSS variables** defined in 'tailwind.config.js' (bg-primary, text-secondary, etc.) for all styling.
4. **User Context:** Assume the 'config' object from the 'useSolutium()' hook contains the current user and project data.
5. **Icons:** Use 'lucide-react' for icons.
6. **Port (CRITICAL FOR PREVIEW):** For the preview to work in this AI environment, the server MUST use port 3000 (or \`process.env.PORT\`). Do NOT try to force port ${port} here, as it will break the preview. Port ${port} will be used when the user downloads the code and runs it locally.
7. **Identity:** Do NOT delete or modify 'public/manifest.json' or 'public/version.json'. They are vital for the Version Traffic Light.
8. **Base Files and Scripts (CRITICAL):** Do NOT rename or move base files into subfolders. In the 'package.json' file, **it is STRICTLY FORBIDDEN to remove existing scripts** (especially 'dev:local'). If you need to add dependencies, do so, but keep the current scripts intact.
9. **Dependencies:** If you add libraries, ensure they are compatible with React 18.2.0. If you give installation instructions, suggest using \`npm install --legacy-peer-deps\` to avoid ERESOLVE errors.
10. **VERSION CONTROL (AUTOMATED):** When you complete a task that modifies functionality or fixes bugs, you MUST update the \`public/version.json\` file.
    - Increment the version (SemVer) according to the type of change.
    - Add an entry to the \`history\` array with today's date and the list of changes made.
    - This is vital for the user to see the change history in the interface.
11. **Navigation and Menus (STANDARD):** Use the \`<Tabs />\` component (located at \`src/components/Tabs.tsx\`) for all internal navigation.
    - Use \`style="primary"\` for main menus (with underline).
    - Use \`style="secondary"\` for filters or sub-menus (pill style).
    - El componente soporta desplazamiento horizontal automático en móviles.
`;

    return (basePrompt + constraints).trim();
};

export const getStarterKitFiles = (appType: string, category: string, finalId: string, port: number, scopes: string[], logoUrl?: string, description?: string) => {
  const isConstructorWeb = appType.toLowerCase().includes('constructor web');
  
  const baseFiles = {
    "package.json": JSON.stringify({
        "name": "solutium-satellite-app",
        "private": true,
        "version": "0.0.0",
        "type": "module",
        "scripts": {
          "dev": "tsx server.ts",
          "dev:local": `tsx server.ts --port ${port}`,
          "build": "tsc && vite build",
          "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
          "preview": `vite preview --port ${port} --host`,
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
      }, null, 2),
      
    "vite.config.ts": `
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
`,
    "server.ts": `
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
      "id": "${finalId}",
      "name": "${appType}",
      "description": "${description || `Satellite app for ${appType} built with Solutium Foundry.`}",
      "version": "1.0.0",
      "sdkVersion": "1.1.0",
      "category": "${category}",
      "icon": "Code",
      "scopes": ${JSON.stringify(scopes)},
      "url": "http://localhost:${port}",
      "logoUrl": "${logoUrl || ''}"
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
  // We search the entire process.argv because tsx/node can shift arguments differently
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
  // Note: We prioritize flags over env vars for local dev flexibility
  if (process.env.PORT && port === 3000) {
     const p = parseInt(process.env.PORT, 10);
     if (!isNaN(p)) {
        port = p;
        console.log('[Server] Port detected from env:', port);
     }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(\`\\n🚀 Satellite server running at: http://localhost:\${port}\`);
    console.log(\`   (Ensure this URL matches the one in Solutium Dashboard)\\n\`);
  });
}

startServer();
`,

    "tsconfig.json": JSON.stringify({
        "compilerOptions": {
          "target": "ES2020",
          "useDefineForClassFields": true,
          "lib": ["ES2020", "DOM", "DOM.Iterable"],
          "module": "ESNext",
          "skipLibCheck": true,
          "moduleResolution": "bundler",
          "allowImportingTsExtensions": true,
          "resolveJsonModule": true,
          "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
          "strict": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "noFallthroughCasesInSwitch": true
        },
        "include": ["src"],
        "references": [{ "path": "./tsconfig.node.json" }]
      }, null, 2),

    "tsconfig.node.json": JSON.stringify({
        "compilerOptions": {
          "composite": true,
          "skipLibCheck": true,
          "module": "ESNext",
          "moduleResolution": "bundler",
          "allowSyntheticDefaultImports": true
        },
        "include": ["vite.config.ts"]
      }, null, 2),

    "tailwind.config.js": `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic Theme Colors (Injected by Mother App)
        primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
        accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
        background: 'rgb(var(--color-background-rgb) / <alpha-value>)',
        surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
        text: 'rgb(var(--color-text-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-family)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
        lg: 'var(--border-radius)',
        xl: 'calc(var(--border-radius) + 4px)',
        '2xl': 'calc(var(--border-radius) + 8px)',
        '3xl': 'calc(var(--border-radius) + 16px)',
        md: 'calc(var(--border-radius) - 2px)',
        sm: 'calc(var(--border-radius) - 4px)',
      }
    },
  },
  plugins: [],
}
`,
    "postcss.config.js": `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,
    ".gitignore": `
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`,
    "public/manifest.json": JSON.stringify({
        "id": finalId,
        "name": appType,
        "description": description || `Satellite app for ${appType} built with Solutium Foundry.`,
        "version": "1.0.0",
        "sdkVersion": "1.1.0",
        "category": category,
        "icon": "Code",
        "scopes": scopes,
        "url": `http://localhost:${port}`,
        "logoUrl": logoUrl || ""
    }, null, 2),

    "public/version.json": JSON.stringify({
        "version": "1.1.0",
        "build": new Date().toISOString().split('T')[0].replace(/-/g, ''),
        "status": "stable",
        "history": [
          {
            "version": "1.1.0",
            "date": new Date().toISOString().split('T')[0],
            "type": "minor",
            "changes": [
              "Soporte completo para temas dinámicos con opacidad (RGB)",
              "Integración de AssetManager y Settings",
              "Mejoras en la UI/UX del Editor"
            ]
          },
          {
            "version": "1.0.0",
            "date": "2026-02-26",
            "type": "major",
            "changes": ["Initial build from Solutium Foundry"]
          }
        ]
    }, null, 2),

    "index.html": `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solutium Satellite</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    "src/index.css": `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Default Fallback Colors (Overridden by Solutium SDK) */
  --color-primary-rgb: 59, 130, 246;
  --color-secondary-rgb: 30, 41, 59;
  --color-accent-rgb: 245, 158, 11;
  --color-background-rgb: 248, 250, 252;
  --color-surface-rgb: 255, 255, 255;
  --color-text-rgb: 15, 23, 42;

  --color-primary: rgb(var(--color-primary-rgb));
  --color-secondary: rgb(var(--color-secondary-rgb));
  --color-accent: rgb(var(--color-accent-rgb));
  --color-background: rgb(var(--color-background-rgb));
  --color-surface: rgb(var(--color-surface-rgb));
  --color-text: rgb(var(--color-text-rgb));

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

/* Windows 11 / Fluent Theme Overrides */
body.theme-fluent {
  background-color: #f3f3f3; /* Mica-like base */
  --color-surface: rgba(255, 255, 255, 0.85); /* Glassy surface */
}

body.theme-fluent .bg-surface {
  backdrop-filter: blur(20px);
  background-color: var(--color-surface);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
`,
    "src/types.ts": `
export interface Module {
  id: string;
  type: string;
  data: any;
}

export interface AssetSettings {
  domain: string;
  seoTitle: string;
  seoDescription: string;
}

export interface Asset {
  id: string;
  name: string;
  modules: Module[];
  settings?: AssetSettings;
  lastModified?: number;
  thumbnailUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  assets: Asset[];
}
`,
    "src/components/AssetManager.tsx": `
import React, { useState } from 'react';
import { Plus, Layout, Wand2, File, Clock, Edit3 } from 'lucide-react';
import { useSolutium } from '../lib/solutium-sdk';
import { Asset } from '../types';

interface AssetManagerProps {
  assets: Asset[];
  onSelectAsset: (assetId: string) => void;
  onCreateAsset: (type: 'ai' | 'template' | 'blank', name: string) => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({ assets, onSelectAsset, onCreateAsset }) => {
  const { config } = useSolutium();
  const [showWizard, setShowWizard] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');

  const handleCreate = (type: 'ai' | 'template' | 'blank') => {
    if (!newAssetName.trim()) return;
    onCreateAsset(type, newAssetName);
    setShowWizard(false);
    setNewAssetName('');
  };

  if (showWizard) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-text mb-2">Crear Nuevo Activo</h2>
          <p className="text-text/60">Selecciona cómo quieres comenzar tu proyecto.</p>
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <label className="block text-sm font-medium text-text/80 mb-2">Nombre del Proyecto</label>
          <input 
            type="text" 
            value={newAssetName}
            onChange={(e) => setNewAssetName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-text/20 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface text-text"
            placeholder="Ej. Landing Page Verano 2024"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => handleCreate('ai')}
            disabled={!newAssetName.trim()}
            className="group p-6 bg-surface rounded-xl border border-text/10 hover:border-primary hover:shadow-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wand2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-text">Generar con IA</h3>
            <p className="text-sm text-text/60">Describe lo que necesitas y deja que la IA construya la estructura base por ti.</p>
          </button>

          <button 
            onClick={() => handleCreate('template')}
            disabled={!newAssetName.trim()}
            className="group p-6 bg-surface rounded-xl border border-text/10 hover:border-primary hover:shadow-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layout className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-text">Usar Plantilla</h3>
            <p className="text-sm text-text/60">Elige entre diseños predefinidos optimizados para conversión.</p>
          </button>

          <button 
            onClick={() => handleCreate('blank')}
            disabled={!newAssetName.trim()}
            className="group p-6 bg-surface rounded-xl border border-text/10 hover:border-primary hover:shadow-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-text/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <File className="w-6 h-6 text-text/80" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-text">Lienzo en Blanco</h3>
            <p className="text-sm text-text/60">Comienza desde cero y construye bloque a bloque.</p>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => setShowWizard(false)} className="text-text/60 hover:text-text text-sm font-medium">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text">Mis Proyectos</h2>
          <p className="text-text/60">
            Gestionando activos para: <span className="font-bold text-primary">{config?.projectData?.name || 'Proyecto Sin Nombre'}</span>
          </p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="bg-surface rounded-xl border border-dashed border-text/20 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
            <Layout className="w-8 h-8 text-text/20" />
          </div>
          <h3 className="text-lg font-medium text-text mb-2">No tienes proyectos aún</h3>
          <p className="text-text/60 max-w-xs mb-6">Crea tu primer activo digital para comenzar a trabajar.</p>
          <button 
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 bg-surface border border-text/20 text-text rounded-lg hover:bg-background transition-colors font-medium"
          >
            Crear Proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div 
              key={asset.id} 
              onClick={() => onSelectAsset(asset.id)}
              className="group bg-surface rounded-xl border border-text/10 overflow-hidden hover:shadow-md transition-all cursor-pointer relative"
            >
              <div className="aspect-video bg-background relative overflow-hidden">
                {asset.thumbnailUrl ? (
                  <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text/10">
                    <Layout className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                    <Edit3 className="w-3 h-3" /> Editar
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-text mb-1 truncate">{asset.name}</h3>
                <div className="flex items-center gap-4 text-xs text-text/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 
                    {asset.lastModified ? new Date(asset.lastModified).toLocaleDateString() : 'Reciente'}
                  </span>
                  <span className={\`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider \${
                    asset.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }\`}>
                    {asset.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
`,
    "src/components/Settings.tsx": `
import React, { useState } from 'react';
import { useSolutium } from '../lib/solutium-sdk';
import { User, Building2, Users, ShoppingBag, Calendar, FileBox, ShieldCheck, Globe, Phone, Mail, MapPin, Layout } from 'lucide-react';

export const Settings = () => {
  const { config } = useSolutium();
  const [activeTab, setActiveTab] = useState('profile');

  // Definición de pestañas basada en el protocolo de datos
  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'business', label: 'Config. Negocio', icon: Building2 },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'products', label: 'Productos', icon: ShoppingBag },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'assets', label: 'Activos Digitales', icon: FileBox },
  ];

  if (!config) return <div className="p-12 text-center text-text/60">Cargando configuración...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text">Datos del Sistema (S.I.P.)</h2>
        <p className="text-text/60">Visualización de datos sincronizados desde la App Madre para verificación.</p>
      </div>

      <div className="bg-surface rounded-xl border border-text/10 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Tabs Header */}
        <div className="border-b border-text/10 bg-background/50 px-6 pt-4">
          <div className="flex space-x-8 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={\`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-text/60 hover:text-text'
                }\`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex-1 bg-surface">
          
          {/* 1. PERFIL */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-background border-2 border-text/10 flex items-center justify-center text-3xl font-bold text-text/40 overflow-hidden">
                  {config.userProfile?.avatarUrl ? (
                    <img src={config.userProfile.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    config.userProfile?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-text">{config.userProfile?.name || 'Sin Nombre'}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase border border-primary/20">
                      {config.userProfile?.role || 'Sin Rol'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold border border-secondary/20">
                      ID: {config.userProfile?.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard label="Correo Electrónico" value={config.userProfile?.email} icon={Mail} />
                <InfoCard label="Teléfono" value={config.userProfile?.phone} icon={Phone} />
                <InfoCard label="Idioma" value={config.userProfile?.language} icon={Globe} />
                <InfoCard 
                  label="Preferencias UI" 
                  value={config.userProfile?.preferences ? JSON.stringify(config.userProfile.preferences) : 'Por defecto'} 
                  icon={Layout} 
                />
              </div>

              {config.teamMembers && config.teamMembers.length > 0 && (
                <div className="mt-8 pt-8 border-t border-text/10">
                  <h4 className="font-bold text-lg mb-4">Equipo ({config.teamMembers.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {config.teamMembers.map((member, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-text/10 bg-background/50">
                        <div className="w-10 h-10 rounded-full bg-text/5 flex items-center justify-center font-bold text-text/60">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-text/60">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. CONFIGURACIÓN DE NEGOCIO */}
          {activeTab === 'business' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Identidad Visual */}
              <div className="p-6 rounded-xl border border-text/10 bg-background/30">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Identidad del Proyecto
                </h4>
                <div className="flex items-center gap-6">
                  {config.projectData?.logoUrl && (
                    <img src={config.projectData.logoUrl} className="h-16 w-auto object-contain" alt="Logo" />
                  )}
                  <div className="flex gap-2">
                    {config.projectData?.colors?.map((c, i) => (
                      <div key={i} className="space-y-1 text-center">
                        <div className="w-12 h-12 rounded-lg shadow-sm border border-black/5" style={{ backgroundColor: c }}></div>
                        <span className="text-[10px] font-mono text-text/60">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Datos de Negocio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard label="Nombre del Proyecto" value={config.projectData?.name} icon={Building2} />
                <InfoCard label="Industria" value={config.businessConfig?.industry} icon={Building2} />
                <InfoCard label="Sitio Web" value={config.businessConfig?.website} icon={Globe} />
                <InfoCard label="WhatsApp" value={config.businessConfig?.whatsapp} icon={Phone} />
                <InfoCard label="Email Contacto" value={config.businessConfig?.email} icon={Mail} />
                <InfoCard label="Ubicación" value={config.businessConfig?.address} icon={MapPin} />
              </div>

              {/* Redes Sociales */}
              {config.businessConfig?.socials && (
                <div className="p-4 rounded-lg bg-background/50 border border-text/10">
                  <h5 className="text-sm font-bold text-text/60 uppercase mb-3">Redes Sociales</h5>
                  <pre className="text-xs font-mono text-text overflow-x-auto">
                    {JSON.stringify(config.businessConfig.socials, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 3. CLIENTES */}
          {activeTab === 'customers' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Base de Datos de Clientes</h3>
                <span className="text-xs font-mono bg-text/5 px-2 py-1 rounded">
                  Total: {config.crmData?.length || 0}
                </span>
              </div>
              
              {config.crmData && config.crmData.length > 0 ? (
                <div className="overflow-x-auto border border-text/10 rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-background/50 text-text/60 font-medium border-b border-text/10">
                      <tr>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Empresa</th>
                        <th className="px-4 py-3">Contacto</th>
                        <th className="px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-text/5">
                      {config.crmData.map((c, i) => (
                        <tr key={i} className="hover:bg-background/30">
                          <td className="px-4 py-3 font-medium">{c.name}</td>
                          <td className="px-4 py-3 text-text/60">{c.company || '-'}</td>
                          <td className="px-4 py-3 text-text/60">
                            <div className="flex flex-col text-xs">
                              <span>{c.email}</span>
                              <span>{c.phone}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              {c.status || 'Activo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={Users} label="No hay clientes sincronizados" />
              )}
            </div>
          )}

          {/* 4. PRODUCTOS */}
          {activeTab === 'products' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Catálogo de Productos</h3>
                <span className="text-xs font-mono bg-text/5 px-2 py-1 rounded">
                  Total: {config.productsData?.length || 0}
                </span>
              </div>

              {config.productsData && config.productsData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.productsData.map((p, i) => (
                    <div key={i} className="p-4 rounded-lg border border-text/10 hover:border-primary/50 transition-colors bg-background/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className={\`text-[10px] font-bold uppercase px-2 py-0.5 rounded \${p.type === 'service' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}\`}>
                          {p.type === 'service' ? 'Servicio' : 'Producto'}
                        </span>
                        <span className="font-mono text-sm font-bold">{p.unitCost ? \`$\${p.unitCost}\` : 'Gratis'}</span>
                      </div>
                      <h4 className="font-bold text-text mb-1">{p.name}</h4>
                      <p className="text-xs text-text/60 line-clamp-2">{p.description || 'Sin descripción'}</p>
                      <div className="mt-3 pt-3 border-t border-text/5 flex justify-between text-xs text-text/40">
                        <span>Code: {p.code || 'N/A'}</span>
                        <span>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ShoppingBag} label="No hay productos sincronizados" />
              )}
            </div>
          )}

          {/* 5. AGENDA */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-xl bg-background/30 border border-text/10 text-center">
                <Calendar className="w-12 h-12 text-text/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text mb-2">Configuración de Agenda</h3>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-text/10 shadow-sm">
                  <div className={\`w-3 h-3 rounded-full \${config.calendarConfig?.enabled ? 'bg-green-500' : 'bg-slate-300'}\`}></div>
                  <span className="font-medium text-sm">
                    {config.calendarConfig?.enabled ? 'Módulo Activo' : 'Módulo Inactivo'}
                  </span>
                </div>
                {config.calendarConfig?.enabled && (
                  <div className="mt-6 text-left max-w-md mx-auto bg-surface p-4 rounded-lg border border-text/10">
                    <p className="text-xs font-mono text-text/60 mb-1">API Endpoint:</p>
                    <code className="block bg-background p-2 rounded text-xs mb-3 break-all">{config.calendarConfig.apiUrl || 'N/A'}</code>
                    <p className="text-xs font-mono text-text/60 mb-1">Auth Token:</p>
                    <code className="block bg-background p-2 rounded text-xs break-all">••••••••••••••••</code>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. ACTIVOS */}
          {activeTab === 'assets' && (
            <div className="space-y-6 animate-fadeIn">
              {config.currentAsset ? (
                <div className="bg-background/30 rounded-xl border border-text/10 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-text">{config.currentAsset.name}</h3>
                      <p className="text-sm text-text/60">ID: {config.currentAsset.id}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                      {config.currentAsset.status || 'Borrador'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <InfoCard label="App Origen" value={config.currentAsset.originApp} icon={Globe} />
                    <InfoCard label="Autor" value={config.currentAsset.author} icon={User} />
                    <InfoCard label="Creado" value={config.currentAsset.createdAt ? new Date(config.currentAsset.createdAt).toLocaleDateString() : '-'} icon={Calendar} />
                    <InfoCard label="Editado" value={config.currentAsset.editedAt ? new Date(config.currentAsset.editedAt).toLocaleDateString() : '-'} icon={Calendar} />
                  </div>

                  {config.currentAsset.tags && (
                    <div className="flex gap-2 flex-wrap">
                      {config.currentAsset.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-background border border-text/10 text-xs text-text/60">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-text/10">
                    <h4 className="text-sm font-bold text-text/60 uppercase mb-2">Metadatos Raw</h4>
                    <pre className="bg-background p-4 rounded-lg text-[10px] font-mono overflow-x-auto text-text/80">
                      {JSON.stringify(config.currentAsset.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <EmptyState icon={FileBox} label="No hay información del activo actual" />
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard = ({ label, value, icon: Icon }: any) => (
  <div className="p-4 rounded-lg bg-background/50 border border-text/5">
    <div className="flex items-center gap-2 mb-1 text-text/40">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span className="text-xs font-bold uppercase">{label}</span>
    </div>
    <p className="font-medium text-text truncate" title={value}>{value || 'No definido'}</p>
  </div>
);

const EmptyState = ({ icon: Icon, label }: any) => (
  <div className="flex flex-col items-center justify-center py-12 text-text/40 border-2 border-dashed border-text/5 rounded-xl">
    <Icon className="w-12 h-12 mb-3 opacity-50" />
    <p>{label}</p>
  </div>
);
`,
    "src/components/Tabs.tsx": `
import React from 'react';

export type TabStyle = 'primary' | 'secondary';

interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  style?: TabStyle;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  options, 
  activeTab, 
  onChange, 
  style = 'primary',
  className = ''
}) => {
  if (style === 'primary') {
    return (
      <div className={\`flex items-center space-x-2 border-b border-text/10 pb-px overflow-x-auto no-scrollbar \${className}\`}>
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={\`px-4 py-2 text-sm font-medium transition-all relative whitespace-nowrap \${
              activeTab === option.id 
                ? 'text-primary' 
                : 'text-text/60 hover:text-text'
            }\`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="ml-1.5 opacity-50 text-xs">({option.count})</span>
            )}
            {activeTab === option.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={\`flex items-center space-x-2 bg-text/5 p-1 rounded-xl w-fit overflow-x-auto no-scrollbar \${className}\`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={\`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap \${
            activeTab === option.id 
              ? 'bg-surface text-primary shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }\`}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-2 opacity-50">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  );
};
`,
    "src/main.tsx": `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
    "src/lib/solutium-sdk.ts": `
import { useState, useEffect, createContext, useContext } from 'react';

// --- Interfaces de Datos ---

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  language?: string;
  preferences?: Record<string, any>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface ProjectData {
  id: string;
  name: string;
  logoUrl?: string;
  colors: string[];
  fontFamily?: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

export interface BusinessConfig {
  industry?: string;
  website?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  socials?: Record<string, string>;
}

export interface CRMContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  status?: string;
  tags?: string[];
  notes?: string;
  lastContact?: string;
}

export interface ProductService {
  id: string;
  name: string;
  description?: string;
  type: 'product' | 'service';
  unitCost?: number;
  currency?: string;
  code?: string;
  status?: 'active' | 'archived' | 'draft';
  imageUrl?: string;
}

export interface DigitalAsset {
  id: string;
  name: string;
  type: string;
  url: string;
  originApp: string;
  author: string;
  status: string;
  tags: string[];
  createdAt: string;
  editedAt: string;
  metadata: Record<string, any>;
}

// --- Payload Principal ---

export interface SolutiumPayload {
  // Metadatos de la Transmisión
  userId: string;
  projectId: string;
  role: string;
  timestamp: number;
  scopes?: string[];

  // Datos del Usuario y Equipo
  userProfile: UserProfile;
  teamMembers: TeamMember[];
  
  // Datos del Proyecto y Negocio
  projectData: ProjectData;
  businessConfig: BusinessConfig;
  activeProjects: { id: string; name: string }[];

  // Módulos de Datos
  crmData?: CRMContact[];
  productsData?: ProductService[];
  
  // Configuraciones de Módulos (Legacy/Bridge)
  crmConfig?: {
    enabled: boolean;
    apiUrl?: string;
    authToken?: string;
  };
  productsConfig?: {
    enabled: boolean;
    apiUrl?: string;
    authToken?: string;
  };
  calendarConfig?: {
    enabled: boolean;
    apiUrl?: string;
    authToken?: string;
  };

  // Activo Actual (Contexto)
  currentAsset?: DigitalAsset;

  // Legacy (para compatibilidad hacia atrás si es necesario)
  data?: any;
  theme?: any;
  initialData?: any;
  enableBootObserver?: boolean;
}

// --- Contexto y Hook ---

interface SolutiumContextType {
  config: SolutiumPayload | null;
  capabilities: {
    canAccessProfile: boolean;
    canAccessProject: boolean;
    canAccessCRM: boolean;
    canAccessProducts: boolean;
    canAccessCalendar: boolean;
    canEditAssets: boolean;
  };
  loading: boolean;
  error: string | null;
}

const SolutiumContext = createContext<SolutiumContextType>({
  config: null,
  capabilities: {
    canAccessProfile: false,
    canAccessProject: false,
    canAccessCRM: false,
    canAccessProducts: false,
    canAccessCalendar: false,
    canEditAssets: false,
  },
  loading: true,
  error: null,
});

export const SolutiumProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<SolutiumPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Intentar obtener token de la URL (flujo iframe/redirect)
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
          try {
            const decoded = JSON.parse(atob(token));
            setConfig(decoded);
            setLoading(false);
            return;
          } catch (e) {
            console.error('Error decodificando token:', e);
          }
        }

        // 2. Escuchar mensajes postMessage (flujo comunicación directa)
        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'SOLUTIUM_INIT') {
            setConfig(event.data.payload);
            setLoading(false);
          }
        };

        window.addEventListener('message', handleMessage);
        
        // Solicitar inicialización a la App Madre
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'SOLUTIUM_READY' }, '*');
        }

        // Timeout de seguridad para desarrollo local
        setTimeout(() => {
          if (loading) {
            console.warn('No se recibió configuración de Solutium. Usando modo standalone/dev.');
            setLoading(false);
          }
        }, 2000);

        return () => window.removeEventListener('message', handleMessage);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };

    init();
  }, []);

  const capabilities = {
    canAccessProfile: !!config?.userProfile,
    canAccessProject: !!config?.projectData,
    canAccessCRM: !!config?.crmData || !!config?.crmConfig?.enabled,
    canAccessProducts: !!config?.productsData || !!config?.productsConfig?.enabled,
    canAccessCalendar: !!config?.calendarConfig?.enabled,
    canEditAssets: !!config?.currentAsset,
  };

  return (
    <SolutiumContext.Provider value={{ config, capabilities, loading, error }}>
      {children}
    </SolutiumContext.Provider>
  );
};

export const useSolutium = () => useContext(SolutiumContext);
`,

    "src/components/VersionDisplay.tsx": `
import React, { useState, useEffect } from 'react';
import { X, GitCommit, Calendar, Tag } from 'lucide-react';

interface VersionEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: string[];
}

interface VersionData {
  version: string;
  build: string;
  history: VersionEntry[];
}

export const VersionDisplay: React.FC<{ className?: string }> = ({ className }) => {
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('./version.json?t=' + Date.now())
      .then(res => {
        if (!res.ok) throw new Error('HTTP error! status: ' + res.status);
        return res.json();
      })
      .then(data => setVersionData(data))
      .catch(err => {
        console.error('Failed to load version history:', err);
        setVersionData({
          version: '1.0.0',
          build: 'unknown',
          history: []
        });
      });
  }, []);

  if (!versionData) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={\`group flex items-center space-x-2 text-xs text-text/40 hover:text-primary transition-colors \${className}\`}
        title="Ver historial de cambios"
      >
        <GitCommit className="w-3 h-3" />
        <span className="font-mono">v{versionData.version}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border border-text/10">
            <div className="p-6 border-b border-text/5 flex justify-between items-start bg-background">
              <div>
                <h3 className="text-lg font-bold text-text flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Changelog
                </h3>
                <p className="text-sm text-text/60 mt-1">
                  Current Version: <span className="font-mono font-bold text-text/80">v{versionData.version}</span>
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-text/10 rounded-full transition-colors text-text/40 hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {versionData.history?.map((entry, index) => (
                <div key={entry.version} className="relative pl-8 border-l-2 border-text/5 last:border-0">
                  <div className={\`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-surface shadow-sm \${
                    index === 0 ? 'bg-primary' : 'bg-text/20'
                  }\`}></div>

                  <div className="mb-1 flex items-center justify-between">
                    <h4 className={\`font-bold \${index === 0 ? 'text-primary' : 'text-text/80'}\`}>
                      v{entry.version}
                    </h4>
                    <span className="text-xs text-text/40 flex items-center gap-1 bg-background px-2 py-1 rounded-full border border-text/5">
                      <Calendar className="w-3 h-3" />
                      {entry.date}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {entry.changes.map((change, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-text/80">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-text/20 shrink-0"></span>
                        <span className="leading-relaxed">{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
`,
    "src/App.tsx": isConstructorWeb ? `
import { useSolutium, useAutoSave } from './lib/solutium-sdk';
import { Loader2, CheckCircle, Code, Plus, Store, Layout, Save, Globe, Trash2, GripVertical, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { VersionDisplay } from './components/VersionDisplay';
import { AssetManager } from './components/AssetManager';
import { Settings } from './components/Settings';
import { Asset, Module } from './types';

interface WebModule {
  id: string;
  type: 'hero' | 'features' | 'products' | 'footer';
  content: any;
}

const MODULE_TEMPLATES: Record<string, any> = {
  hero: { title: 'Tu Nueva Web', subtitle: 'Creada con Solutium IA', buttonText: 'Empezar' },
  features: { items: ['Rápido', 'Seguro', 'Escalable'] },
  products: { title: 'Catálogo de Productos', source: 'App Madre' },
  footer: { text: '© 2026 ' + (window.location.hostname) }
};

function App() {
  const { config, isReady, isBooting, bootLogs, simulateConnection, saveData } = useSolutium();
  
  // State for Asset Management
  const [currentView, setCurrentView] = useState<'assets' | 'editor' | 'settings'>('assets');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentAssetId, setCurrentAssetId] = useState<string | null>(null);
  
  // State for Editor
  const [modules, setModules] = useState<WebModule[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load assets on boot (simulated for now, would come from config or API)
  useEffect(() => {
    if (isReady) {
        // In a real scenario, we would fetch assets here using the API
        // For now, we initialize with an empty list or mock data if provided
        setAssets([]);
    }
  }, [isReady]);

  // Auto-save hook
  useAutoSave(modules, isDirty, () => {
    if (currentAssetId) {
        handleSave();
    }
  });

  const handleCreateAsset = (type: 'ai' | 'template' | 'blank', name: string) => {
    const newAsset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        modules: [],
        lastModified: Date.now()
    };
    
    // If AI or Template, we could pre-fill modules here
    if (type === 'template') {
        newAsset.modules = [
            { id: '1', type: 'hero', data: MODULE_TEMPLATES['hero'] },
            { id: '2', type: 'features', data: MODULE_TEMPLATES['features'] },
            { id: '3', type: 'footer', data: MODULE_TEMPLATES['footer'] }
        ];
    }

    setAssets([...assets, newAsset]);
    setCurrentAssetId(newAsset.id);
    setModules(newAsset.modules as any); // Cast for compatibility with existing WebModule type
    setCurrentView('editor');
  };

  const handleSelectAsset = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
        setCurrentAssetId(assetId);
        setModules(asset.modules as any);
        setCurrentView('editor');
    }
  };

  const handleSave = () => {
    if (!currentAssetId) return;
    
    setIsSaving(true);
    
    // Update local state
    const updatedAssets = assets.map(a => 
        a.id === currentAssetId 
            ? { ...a, modules: modules as any, lastModified: Date.now() } 
            : a
    );
    setAssets(updatedAssets);

    // Send to Mother App
    saveData({ 
        assets: updatedAssets,
        currentAssetId,
        modules 
    }, { 
      status: 'draft', 
      tags: ['Borrador', 'AutoGuardado'], 
      author: config?.userId || 'Usuario',
      updatedAt: Date.now()
    });
    
    setIsDirty(false);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const addModule = (type: WebModule['type']) => {
    const newModule: WebModule = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: MODULE_TEMPLATES[type]
    };
    setModules([...modules, newModule]);
    setIsDirty(true);
  };

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Agente Receptor S.I.P.</h3>
              <p className="text-sm text-slate-500">Recibiendo datos de Solutium OS</p>
            </div>
          </div>
          <div className="p-6 bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed space-y-2 h-64 overflow-y-auto">
            {bootLogs.map((log: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className={\`flex gap-3 \${log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}\`}
              >
                <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                <span>{log.msg}</span>
              </motion.div>
            ))}
            <div className="flex gap-3 animate-pulse text-indigo-400">
              <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span>Procesando...</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-mono text-sm">Waiting for Solutium Handshake...</p>
        <button onClick={simulateConnection} className="mt-8 text-xs underline">Simulate Connection</button>
      </div>
    );
  }



  return (
    <div className="flex h-screen bg-background text-text overflow-hidden p-3 gap-3">
      {/* Sidebar */}
      <aside className="w-64 bg-surface rounded-2xl shadow-sm flex flex-col z-10 overflow-hidden">
        <div className="p-6">
          {config?.projectData?.logoUrl && (
            <img src={config.projectData.logoUrl} alt="Logo" className="h-8 mb-2 object-contain" />
          )}
          <h1 className="text-lg font-bold text-primary">{config?.projectData?.name}</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {currentView === 'editor' ? (
              <>
                <button 
                    onClick={() => setCurrentView('assets')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-text/60 hover:bg-background text-sm font-medium transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver a Proyectos
                </button>
                
                <p className="px-3 text-[10px] font-bold text-text/40 uppercase tracking-widest mb-2 mt-4">Módulos</p>
                <button onClick={() => addModule('hero')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-sm font-medium transition-colors text-text/80 hover:text-primary">
                    <Layout className="w-4 h-4" /> Hero Section
                </button>
                <button onClick={() => addModule('features')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-sm font-medium transition-colors text-text/80 hover:text-primary">
                    <Code className="w-4 h-4" /> Características
                </button>
                <button onClick={() => addModule('products')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-sm font-medium transition-colors text-text/80 hover:text-primary">
                    <Store className="w-4 h-4" /> Productos (S.I.P.)
                </button>
              </>
          ) : (
              <div className="space-y-1">
                  <button 
                    onClick={() => setCurrentView('assets')}
                    className={\`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors \${currentView === 'assets' ? 'bg-primary/10 text-primary' : 'text-text/60 hover:bg-background hover:text-text'}\`}
                  >
                    <Layout className="w-4 h-4" /> Mis Proyectos
                  </button>
                  <button 
                    onClick={() => setCurrentView('settings')}
                    className={\`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors \${currentView === 'settings' ? 'bg-primary/10 text-primary' : 'text-text/60 hover:bg-background hover:text-text'}\`}
                  >
                    <SettingsIcon className="w-4 h-4" /> Ajustes
                  </button>
              </div>
          )}
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-background rounded-xl p-4">
             <VersionDisplay />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-surface rounded-2xl shadow-sm relative">
        {currentView === 'assets' && (
            <div className="p-12 overflow-y-auto h-full custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    <AssetManager 
                        assets={assets} 
                        onSelectAsset={handleSelectAsset} 
                        onCreateAsset={handleCreateAsset} 
                    />
                </div>
            </div>
        )}

        {currentView === 'settings' && (
            <div className="p-12 overflow-y-auto h-full custom-scrollbar">
                <Settings />
            </div>
        )}

        {currentView === 'editor' && (
            <>
                <header className="h-20 flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-text">Editor de Módulos</span>
            <span className="text-sm text-text/40">Arrastra y suelta o añade módulos para construir tu página.</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 mr-4 text-sm font-medium text-text/60">
                <Globe className="w-4 h-4" /> Vista Previa
             </div>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-surface border border-text/10 hover:bg-background text-text rounded-xl transition-all shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            <button 
              onClick={() => setIsPublishing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20"
            >
              <Globe className="w-4 h-4" /> Publicar
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-background/50 m-2 rounded-xl border border-dashed border-text/5 relative">
          <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-center">
            <Reorder.Group axis="y" values={modules} onReorder={setModules} className="space-y-6 w-full">
              {modules.map((module) => (
                <Reorder.Item key={module.id} value={module} className="group relative bg-surface rounded-2xl shadow-sm border border-text/5 overflow-hidden transition-shadow hover:shadow-md">
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab hover:bg-text/5 transition-colors">
                    <GripVertical className="w-4 h-4 text-text/20 group-hover:text-text/40" />
                  </div>
                  
                  <div className="pl-12 pr-8 py-8">
                    <div className="flex justify-between items-center mb-6">
                      <span className="px-3 py-1 bg-text/5 rounded-full text-[10px] font-bold text-text/40 uppercase tracking-widest">{module.type}</span>
                      <button onClick={() => setModules(modules.filter(m => m.id !== module.id))} className="p-2 hover:bg-red-50 text-text/20 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {module.type === 'hero' && (
                      <div className="text-center py-8 border-2 border-dashed border-text/5 rounded-xl bg-background/50">
                        <h2 className="text-3xl font-bold mb-3 text-text">{module.content.title}</h2>
                        <p className="text-text/60 text-lg mb-6">{module.content.subtitle}</p>
                        <button className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-sm">{module.content.buttonText}</button>
                      </div>
                    )}

                    {module.type === 'features' && (
                        <div className="grid grid-cols-3 gap-4 py-4">
                            {[1,2,3].map(i => (
                                <div key={i} className="p-4 bg-background/50 rounded-xl border border-text/5 text-center">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <h4 className="font-bold text-sm text-text">Característica {i}</h4>
                                </div>
                            ))}
                        </div>
                    )}

                    {module.type === 'products' && (
                      <div className="py-4">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-text">{module.content.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Sincronizado
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {config?.productsConfig?.initialProducts && config.productsConfig.initialProducts.length > 0 ? (
                            config.productsConfig.initialProducts.map((product: any) => (
                              <div key={product.id} className="bg-background rounded-xl p-4 flex flex-col items-center text-center border border-text/5 hover:border-primary/20 transition-colors cursor-pointer group/product">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-primary shadow-sm group-hover/product:scale-110 transition-transform">
                                  <Store className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-sm mb-1 text-text">{product.name}</h4>
                                <span className="text-sm font-bold text-primary">\${product.unitCost}</span>
                              </div>
                            ))
                          ) : (
                            // Empty State / Skeleton
                            [1,2,3].map(i => (
                              <div key={i} className="aspect-square bg-background/50 rounded-xl border border-dashed border-text/10 flex flex-col items-center justify-center p-4 text-center opacity-60">
                                <Store className="w-6 h-6 text-text/20 mb-2" />
                                <div className="h-1.5 w-12 bg-text/10 rounded mb-1"></div>
                                <div className="h-1.5 w-8 bg-text/5 rounded"></div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {modules.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-surface rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-text/5">
                    <Layout className="w-10 h-10 text-text/20" />
                </div>
                <h4 className="text-text font-bold text-xl mb-2">Tu lienzo está vacío</h4>
                <p className="text-text/40 text-sm mb-8 max-w-xs mx-auto">Empieza añadiendo tu primer módulo o deja que nuestra IA lo haga por ti.</p>
                <button onClick={() => addModule('hero')} className="px-6 py-3 bg-secondary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-secondary/20 flex items-center gap-2 mx-auto">
                    <Plus className="w-4 h-4" /> Añadir Primer Módulo
                </button>
              </div>
            )}
          </div>
        </div>
            </>
        )}
      </main>

      {isPublishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Publicar Sitio Web</h3>
            <p className="text-slate-500 text-sm mb-6">Configura tu dominio para lanzar tu sitio al mundo.</p>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl border border-slate-200 hover:border-primary cursor-pointer transition-colors group">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Opción Gratuita</p>
                <p className="font-bold text-slate-700">misitio.solutium.app</p>
              </div>
              <div className="p-4 rounded-xl border border-primary bg-primary/5 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-bold text-primary uppercase">Opción Premium</p>
                  <span className="px-2 py-0.5 bg-primary text-white rounded text-[10px] font-bold">RECOMENDADO</span>
                </div>
                <p className="font-bold text-slate-700">www.minegocio.com</p>
                <p className="text-xs text-slate-500 mt-2">Requiere suscripción Pro</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsPublishing(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
              <button className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20">Continuar</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App
` : `
import { useSolutium } from './lib/solutium-sdk';
import { Loader2, CheckCircle, Code, Users, ShoppingBag, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const { config, isReady, isBooting, bootLogs, simulateConnection } = useSolutium();

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Agente Receptor S.I.P.</h3>
              <p className="text-sm text-slate-500">Recibiendo datos de Solutium OS</p>
            </div>
          </div>
          <div className="p-6 bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed space-y-2 h-64 overflow-y-auto">
            {bootLogs.map((log: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className={\`flex gap-3 \${log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}\`}
              >
                <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                <span>{log.msg}</span>
              </motion.div>
            ))}
            <div className="flex gap-3 animate-pulse text-indigo-400">
              <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
              <span>Procesando...</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-mono text-sm">Waiting for Solutium Handshake...</p>
        <button onClick={simulateConnection} className="mt-8 text-xs underline">Simulate Connection</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text p-8 transition-colors duration-500">
      <div className="max-w-2xl mx-auto bg-surface rounded-xl shadow-lg border border-slate-200 p-8">
        
        <header className="mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-4">
              {config?.projectData?.logoUrl && (
                <div className="w-48 h-16 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100 p-2">
                  <img 
                    src={config.projectData.logoUrl} 
                    alt="Project Logo" 
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-primary">Satellite App Ready</h1>
                <p className="text-sm text-slate-500">Connected to {config?.projectData?.name}</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              ONLINE
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Session Data</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-slate-500 text-xs">User ID</span>
                <span className="font-mono">{config?.userId}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs">Role</span>
                <span className="font-mono">{config?.role}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-xs">Project ID</span>
                <span className="font-mono">{config?.projectId}</span>
              </div>
            </div>
          </div>

          {/* Capabilities Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CRM Status */}
              <div className={\`p-4 rounded-lg border \${config?.crmConfig ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-50'}\`}>
                  <div className="flex items-center gap-2 mb-2">
                      <Users className={\`w-5 h-5 \${config?.crmConfig ? 'text-blue-600' : 'text-slate-400'}\`} />
                      <h3 className="font-bold text-sm text-slate-700">CRM Bridge</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                      {config?.crmConfig ? 'Connected & Ready' : 'Not configured'}
                  </p>
              </div>

              {/* Products Status */}
              <div className={\`p-4 rounded-lg border \${config?.productsConfig ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50'}\`}>
                  <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className={\`w-5 h-5 \${config?.productsConfig ? 'text-emerald-600' : 'text-slate-400'}\`} />
                      <h3 className="font-bold text-sm text-slate-700">Products Bridge</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                      {config?.productsConfig ? 'Connected & Ready' : 'Not configured'}
                  </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
`,
    "scripts/update-solutium.js": `
/**
 * SOLUTIUM UPDATER SCRIPT
 * This script fetches the latest SDK from the Mother App.
 */
import fs from 'fs';
import path from 'path';
import http from 'http';

// Configuration - This should point to your Mother App URL
const MOTHER_APP_URL = 'http://localhost:3000'; 
const SDK_PATH = '/api/sdk/latest';

console.log('🚀 Starting Solutium SDK Update...');

// In a real environment, this would perform a fetch to the Mother App
// For this starter kit, we provide the instructions to the developer
console.log('---------------------------------------------------------');
console.log('To update your SDK:');
console.log('1. Go to Solutium Mother App > Portfolio > Satellite Lab');
console.log('2. Copy the latest code from the "Updater" tab');
console.log('3. Replace the content of src/lib/solutium-sdk.ts');
console.log('---------------------------------------------------------');
console.log('Future versions of this script will automate this via CLI.');
`
  };

  return baseFiles;
};

export const generateStarterKit = async (appType: string, language: 'es' | 'en', category: string = 'utility', customId?: string, port: number = 3001, scopes: string[] = ['profile'], logoUrl?: string, description?: string) => {
  const zip = new JSZip();
  const finalId = customId || `sat-${appType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  // 0. AI INSTRUCTIONS (THE PROMPT)
  const filename = language === 'es' ? 'INSTRUCCIONES_IA.md' : 'AI_INSTRUCTIONS.md';
  const promptContent = generatePrompt(appType, language, port, scopes, logoUrl, description);
  zip.file(filename, promptContent);

  // 1. DEFINE FILES
  const files = getStarterKitFiles(appType, category, finalId, port, scopes, logoUrl, description);
  
  const readme = language === 'es' ? `
# Solutium Satellite App (Kit de Inicio)

Este es un kit de inicio generado para construir una Aplicación Satélite Solutium.

## ¿Cómo empezar?

1.  **Instalar Dependencias:**
    Abre una terminal en esta carpeta y ejecuta:
    \`\`\`bash
    npm install
    \`\`\`
    *(Si encuentras errores de "peer dependencies" o ERESOLVE, usa \`npm install --legacy-peer-deps\`)*

2.  **Ejecutar en Local (Modo Satélite):**
    Para ejecutar la aplicación en el puerto asignado (${port}) y que no choque con tu App Madre, usa:
    \`\`\`bash
    npm run dev:local
    \`\`\`
    
    *(Nota: Si usas solo \`npm run dev\`, arrancará en el puerto 3000 por defecto)*

3.  **Conectar a la App Madre:**
    -   Ve a tu Consola de Administración de Solutium (App Madre).
    -   Asegúrate de que la App Madre esté corriendo en el puerto **3000**.
    -   Abre el Dashboard y verás tu satélite conectado o añade uno nuevo apuntando a \`http://localhost:${port}\`.

## Archivos Importantes

*   **vite.config.ts**: Configuración del servidor. NO necesitas ejecutarlo manualmente. \`npm run dev\` lo usa automáticamente.
*   **src/lib/solutium-sdk.ts**: Maneja la conexión con la App Madre. No lo modifiques.
*   **CONTEXTO_CODIGO_COMPLETO.txt**: Este archivo es **SOLO PARA LA IA**. Copia su contenido y pégalo en tu chat con la IA para que entienda tu código.

` : `
# Solutium Satellite App (Starter Kit)

This is a generated starter kit for building a Solutium Satellite Application.

## Getting Started

1.  **Install Dependencies:**
    Open a terminal in this folder and run:
    \`\`\`bash
    npm install
    \`\`\`
    *(If you encounter "peer dependencies" or ERESOLVE errors, use \`npm install --legacy-peer-deps\`)*

2.  **Run Locally (Satellite Mode):**
    To run the application on the assigned port (${port}) so it doesn't conflict with your Mother App, use:
    \`\`\`bash
    npm run dev:local
    \`\`\`
    
    *(Note: If you just use \`npm run dev\`, it will start on port 3000 by default)*

3.  **Connect to Mother App:**
    -   Go to your Solutium Admin Console (Mother App).
    -   Ensure Mother App is running on port **3000**.
    -   Open the Dashboard and you will see your satellite connected or add a new one pointing to \`http://localhost:${port}\`.

## Important Files

*   **vite.config.ts**: Server configuration. You do NOT need to run this manually. \`npm run dev\` uses it automatically.
*   **src/lib/solutium-sdk.ts**: Handles the handshake with the Mother App. Do not modify.
*   **FULL_CODE_CONTEXT.txt**: This file is **ONLY FOR AI**. Copy its content and paste it into your AI chat so it understands your code.
`;

  const allFiles = { ...files, "README.md": readme };

  // Add files to ZIP
  Object.entries(allFiles).forEach(([path, content]) => {
    zip.file(path, content);
  });

  // 2. GENERATE FLAT-PACK CONTEXT FILE
  const flatPackContent = Object.entries(allFiles).map(([path, content]) => {
    return `
// ==============================================================================
// FILE: ${path}
// ==============================================================================
${content}
`;
  }).join('\n');

  const contextFilename = language === 'es' ? 'CONTEXTO_CODIGO_COMPLETO.txt' : 'FULL_CODE_CONTEXT.txt';
  zip.file(contextFilename, flatPackContent);


  // 3. GENERATE ZIP
  const content = await zip.generateAsync({ type: "blob" });
  const downloadName = language === 'es' 
    ? `Kit de inicio - ${finalId}.zip` 
    : `Starter Kit - ${finalId}.zip`;
  saveAs(content, downloadName);
};

export const generateContextOnly = async (appType: string, language: 'es' | 'en', category: string = 'utility', customId?: string, port: number = 3001, scopes: string[] = ['profile'], logoUrl?: string, description?: string) => {
  const finalId = customId || `sat-${appType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  const files = getStarterKitFiles(appType, category, finalId, port, scopes, logoUrl, description);
  
  const flatPackContent = Object.entries(files).map(([path, content]) => {
    return `
// ==============================================================================
// FILE: ${path}
// ==============================================================================
${content}
`;
  }).join('\n');

  const blob = new Blob([flatPackContent], { type: 'text/plain;charset=utf-8' });
  const filename = language === 'es' ? `Contexto IA - ${finalId}.txt` : `AI Context - ${finalId}.txt`;
  saveAs(blob, filename);
};
