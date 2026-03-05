/**
 * Google Calendar Service
 * Maneja la autenticación y peticiones a la API de Google
 */

import { globalConfigService } from './globalConfigService';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];

export const googleCalendarService = {
  /**
   * Genera la URL de autorización de Google
   */
  getAuthUrl: () => {
    const config = globalConfigService.getConfig();
    const clientId = config.googleClientId;
    
    if (!clientId) {
      throw new Error('Google Client ID no configurado en el Centro de Conectividad');
    }

    const redirectUri = `${window.location.origin}/auth-callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token', // Usamos Implicit Flow para simplicidad en localhost
      scope: SCOPES.join(' '),
      include_granted_scopes: 'true',
      state: 'google_calendar_connect'
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  },

  /**
   * Abre el popup de Google
   */
  connect: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const url = googleCalendarService.getAuthUrl();
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        url,
        'google-calendar-auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        reject(new Error('Popup blocked'));
        return;
      }

      // Escuchar el mensaje del callback
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          resolve(event.data.token);
        }
      };

      window.addEventListener('message', messageHandler);

      // Verificar si el popup se cerró sin éxito
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Auth cancelled'));
        }
      }, 1000);
    });
  }
};
