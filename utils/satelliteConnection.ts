/**
 * SOLUTIUM SATELLITE CONNECTION PROTOCOL (S.I.P.)
 * -----------------------------------------------
 * Version: 2.1 (Omni-Search Mode)
 * 
 * Este archivo gestiona la criptografía y transmisión de datos
 * entre la App Madre y las Apps Satélites.
 */

export interface SolutiumPayload {
  userId: string;
  projectId: string;
  role: string;
  timestamp: number;
  scopes?: string[];

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

  teamMembers?: Array<{
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  }>;

  activeProjects?: Array<{
    id: string;
    name: string;
  }>;

  businessConfig: {
    industry?: string;
    industrySpec?: string;
    whatsapp?: string;
    website?: string;
    email?: string;
    address?: string;
    socials?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
    };
  };

  projectData: {
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

  crmData?: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    businessAssigned?: string[];
    company?: string;
    status?: string;
    source?: string;
    notes?: string;
  }>;

  productsData?: Array<{
    id: string;
    name: string;
    description?: string;
    type: 'product' | 'service';
    unitCost?: number;
    currency?: string;
    code?: string;
    status?: 'active' | 'archived' | 'draft';
    imageUrl?: string;
  }>;

  calendarConfig?: {
    enabled: boolean;
    apiUrl?: string;
    authToken?: string;
  };

  currentAsset?: {
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
  };

  // Legacy/Bridge Configuration
  crmConfig?: {
    apiUrl: string;
    authToken: string;
  };
  productsConfig?: {
    apiUrl: string;
    authToken: string;
  };
  enableBootObserver?: boolean;
  initialData?: any;
}

type LogCallback = (msg: string, type: 'info' | 'success' | 'error' | 'warning') => void;

/**
 * CODIFICADOR ROBUSTO (UTF-8 SAFE)
 */
const encodeBase64 = (str: string): string => {
    try {
        return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(_match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            }));
    } catch (e) {
        console.error("SIP Error: Encoding failed", e);
        return "";
    }
};

/**
 * DECODIFICADOR ROBUSTO (UTF-8 SAFE)
 */
const decodeBase64 = (str: string): string => {
    try {
        return decodeURIComponent(Array.prototype.map.call(window.atob(str), function(c: string) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.error("SIP Error: Decoding failed", e);
        throw new Error("Token corrupto o formato inválido");
    }
};

/**
 * GENERAR TOKEN (Usado por App Madre)
 */
export const encodeSolutiumToken = (payload: SolutiumPayload): string => {
    try {
        const jsonString = JSON.stringify(payload);
        return encodeBase64(jsonString);
    } catch (e) {
        console.error("SIP Error: JSON Stringify failed", e);
        return "";
    }
};

/**
 * LEER TOKEN (Usado por App Satélite)
 * Busca el token en window.location.search Y window.location.hash
 */
export const connectToSolutium = (logger?: LogCallback): SolutiumPayload | null => {
    const log = (msg: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        if (logger) logger(msg, type);
        console.log(`[SIP Protocol] ${msg}`);
    };

    log("Iniciando protocolo de recepción v2.1...", 'info');
    log(`URL Actual: ${window.location.href}`, 'info');

    try {
        let token: string | null = null;

        // ESTRATEGIA 1: Búsqueda estándar (?token=...)
        const params = new URLSearchParams(window.location.search);
        token = params.get('token');

        // ESTRATEGIA 2: Búsqueda en Hash (#/route?token=...)
        if (!token && window.location.hash.includes('token=')) {
            log("Token detectado dentro del Hash.", 'info');
            const hashParts = window.location.hash.split('?');
            if (hashParts.length > 1) {
                const hashParams = new URLSearchParams(hashParts[1]);
                token = hashParams.get('token');
            }
        }

        // ESTRATEGIA 3: Extracción bruta (Regex de emergencia)
        if (!token) {
            const match = window.location.href.match(/[?&]token=([^&]+)/);
            if (match) {
                log("Token extraído por fuerza bruta (Regex).", 'warning');
                token = match[1];
            }
        }

        if (token) {
            log("Token capturado por URL. Decodificando...", 'info');
            // Limpieza de token (por si se duplicaron caracteres de escape)
            const cleanToken = token.replace(/%3D/g, '=').replace(/%2F/g, '/').replace(/%2B/g, '+');

            const jsonString = decodeBase64(cleanToken);
            const payload = JSON.parse(jsonString) as SolutiumPayload;

            if (payload && payload.projectId) {
                log(`Conexión exitosa vía URL. Proyecto: ${payload.projectData?.name}`, 'success');
                return payload;
            }
        }
        
        log("No se encontró token válido en URL. Esperando evento...", 'warning');
        return null;

    } catch (e: any) {
        log(`Error Crítico en lectura URL: ${e.message}`, 'error');
        return null;
    }
};

/**
 * ESCUCHAR EVENTOS (PostMessage)
 * Permite recibir la configuración asíncronamente desde la App Madre (iframe/window)
 */
export const listenForSolutiumHandshake = (
    onConfigReceived: (payload: SolutiumPayload) => void,
    logger?: LogCallback
): () => void => {
    const handler = (event: MessageEvent) => {
        // Filtro de seguridad básico: ignorar mensajes que no sean de Solutium
        if (event.data && event.data.type === 'SOLUTIUM_CONFIG') {
            if (logger) logger("Evento 'SOLUTIUM_CONFIG' recibido.", 'success');
            
            const payload = event.data.payload as SolutiumPayload;
            if (payload && payload.projectId) {
                onConfigReceived(payload);
            } else {
                if (logger) logger("Payload del evento inválido o incompleto.", 'error');
            }
        }
    };

    window.addEventListener('message', handler);
    if (logger) logger("Waiting for 'SOLUTIUM_CONFIG' event...", 'info');

    // Retornar función de limpieza
    return () => window.removeEventListener('message', handler);
};

/**
 * ENVIAR SEÑAL DE LISTO (READY)
 * Informa a la App Madre que la App Satélite ha cargado y está lista para recibir datos.
 */
export const sendSatelliteReady = () => {
    if (window.opener) {
        console.log("[SIP Protocol] Enviando señal SOLUTIUM_SATELLITE_READY...");
        window.opener.postMessage({
            type: 'SOLUTIUM_SATELLITE_READY',
            timestamp: Date.now()
        }, '*');
    } else {
        console.warn("[SIP Protocol] No se detectó window.opener. La señal READY no se pudo enviar.");
    }
};

/**
 * ESCUCHAR DATOS GUARDADOS (Desde Satélite)
 */
export const listenForSatelliteSave = (
    onSave: (projectId: string, appId: string, data: any, metadata?: any) => void,
    logger?: LogCallback
): () => void => {
    const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SOLUTIUM_SAVE') {
            if (logger) logger("Evento 'SOLUTIUM_SAVE' recibido.", 'success');
            
            // Support both legacy (projectId only) and v2 (projectId + appId) payloads
            const { projectId, appId, data, metadata } = event.data.payload;
            
            // Fallback for apps that haven't updated SDK yet
            const finalAppId = appId || 'unknown-app';

            if (projectId && data) {
                onSave(projectId, finalAppId, data, metadata);
            } else {
                if (logger) logger("Payload de guardado incompleto.", 'error');
            }
        }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
};

export const sendHandshakeAck = (payload: SolutiumPayload, status: 'success' | 'error' = 'success', errorMsg?: string) => {
    if (window.opener) {
        window.opener.postMessage({
            type: 'SOLUTIUM_ACK',
            payload: {
                projectId: payload.projectId,
                timestamp: Date.now(),
                status,
                error: errorMsg,
                receivedDataSummary: {
                    name: payload.projectData?.name,
                    email: payload.projectData?.contact?.email
                }
            }
        }, '*');
    }
};