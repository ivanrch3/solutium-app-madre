export interface RoadmapItem {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'future';
  description: string;
  phase?: string;
  appId?: string; // Optional: link to a specific app
}

export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'fix' | 'internal';
  appId?: string;
}

// ADMIN ROADMAP (Internal Solutium Systems)
export const ADMIN_ROADMAP: RoadmapItem[] = [
  {
    id: 'foundation',
    phase: 'PHASE 1',
    title: 'The Bedrock (Governance & Stability)',
    status: 'completed',
    description: 'Establish the rules, identity, and communication protocols.',
  },
  {
    id: 'factory',
    phase: 'PHASE 2',
    title: 'The Factory (Infrastructure)',
    status: 'current',
    description: 'Create the tools to build apps faster and consistently.',
  },
  {
    id: 'staging-infra',
    phase: 'PHASE 3',
    title: 'Infraestructura de Pruebas (Staging)',
    status: 'current',
    description: 'Configuración de servidor de pruebas usando GitHub, Digital Ocean y Supabase para validaciones externas.',
  },
  {
    id: 'core-engine',
    phase: 'PHASE 4',
    title: 'The Core Engine (Centralized CRM)',
    status: 'completed',
    description: 'Centralize the most valuable asset: The Client Database. This CRM will be a native module in the mother app, not a satellite.',
  },
  {
    id: 'data-contracts',
    phase: 'PHASE 5',
    title: 'Data Contracts & Inter-app S.I.P.',
    status: 'completed',
    description: 'Establish detailed data contracts for fluid, transparent, and error-free information sharing between satellites and the mother app.',
  },
  {
    id: 'external-integrations',
    phase: 'PHASE 6',
    title: 'External Ecosystem (API Keys)',
    status: 'current',
    description: 'Enable inter-connection with external tools like HubSpot and Google Calendar via API keys/OAuth for bi-directional data flow.',
  },
  {
    id: 'update-system',
    phase: 'PHASE 7',
    title: 'Satellite Update System',
    status: 'future',
    description: 'Implementation of a mechanism to push SDK updates and protocol changes to existing satellites without full rebuilds.',
  },
  {
    id: 'db-migration',
    phase: 'PHASE 8',
    title: 'Migración a Base de Datos (Supabase)',
    status: 'future',
    description: 'Reemplazar el almacenamiento local (localStorage) por una base de datos relacional real para usuarios, proyectos, CRM y activos.',
  },
  {
    id: 'real-auth',
    phase: 'PHASE 8',
    title: 'Autenticación Real y Seguridad',
    status: 'future',
    description: 'Implementar JWT (JSON Web Tokens) y validación de sesiones seguras directamente en el servidor de prueba.',
  },
  {
    id: 'auto-changelog',
    phase: 'PHASE 9',
    title: 'Changelog Automatizado (CI/CD + IA)',
    status: 'future',
    description: 'Conectar GitHub Actions con Gemini para traducir commits técnicos en notas de versión automáticas (User & Background Changelog).',
  },
  {
    id: 'realtime-ota',
    phase: 'PHASE 9',
    title: 'WebSockets para Actualizaciones OTA',
    status: 'future',
    description: 'Establecer conexión en tiempo real (SSE/WebSockets) para el Semáforo de Versiones y el envío automático de paquetes de actualización a satélites.',
  },
  {
    id: 'sip-backend',
    phase: 'PHASE 10',
    title: 'Enrutamiento S.I.P. en Servidor',
    status: 'future',
    description: 'Mover la validación de los contratos de datos (Solutium Integration Protocol) del navegador al backend para mayor seguridad y trazabilidad.',
  }
];

// BACKGROUND CHANGELOG (Admin/Developer view)
export const BACKGROUND_CHANGELOG: ChangelogEntry[] = [
  {
    id: 'ch-4',
    date: '2026-02-27',
    title: 'CRM Centralizado y Puente S.I.P.',
    description: 'Implementación de base de datos única de clientes en App Maestra. Sincronización automática de clientes hacia apps satélites vía S.I.P. Optimización de importación masiva.',
    type: 'feature'
  },
  {
    id: 'ch-3.5',
    date: '2026-02-26',
    title: 'Arquitectura Multi-Proyecto (Herencia)',
    description: 'Refactorización del AuthContext. Los nuevos proyectos ahora heredan configuraciones (colores, logos) del proyecto maestro (admin-hq).',
    type: 'internal'
  },
  {
    id: 'ch-3.4',
    date: '2026-02-25',
    title: 'Gestión de Estado Global y UI',
    description: 'Integración de Tailwind CSS para personalización dinámica de temas y estilos de interfaz (Windows vs Solutium).',
    type: 'feature'
  },
  {
    id: 'ch-3.3',
    date: '2026-02-24',
    title: 'Sistema de Autenticación Híbrido',
    description: 'Implementación de login con roles (admin vs user) y creación del Modo Invitado con datos efímeros.',
    type: 'feature'
  },
  {
    id: 'ch-1',
    date: '2026-02-22',
    title: 'Fundición de Satélites v2',
    description: 'Añadido soporte para puertos personalizados y generación automática de IDs de aplicación.',
    type: 'feature'
  },
  {
    id: 'ch-2',
    date: '2026-02-22',
    title: 'Módulo de Estadísticas',
    description: 'Nueva pestaña administrativa para visualización de métricas de usuario en tiempo real.',
    type: 'internal'
  },
  {
    id: 'ch-3',
    date: '2026-02-21',
    title: 'Protocolo S.I.P.',
    description: 'Implementación del Solutium Integration Protocol para comunicación segura entre apps.',
    type: 'internal'
  }
];

// USER ROADMAP (Per-App Roadmap)
export const APP_ROADMAPS: Record<string, RoadmapItem[]> = {
  'sat-invoicer': [
    { id: 'inv-1', title: 'Facturación Electrónica', status: 'completed', description: 'Emisión de facturas con validez legal.' },
    { id: 'inv-2', title: 'Integración CRM', status: 'current', description: 'Sincronización automática de clientes con el Hub central.' },
    { id: 'inv-3', title: 'Pagos en Línea', status: 'future', description: 'Cobro directo de facturas mediante pasarelas de pago.' }
  ],
  'sat-booking': [
    { id: 'book-1', title: 'Calendario Básico', status: 'completed', description: 'Gestión de citas manual.' },
    { id: 'book-2', title: 'Recordatorios WhatsApp', status: 'current', description: 'Envío automático de recordatorios a clientes.' },
    { id: 'book-3', title: 'Pagos de Reserva', status: 'future', description: 'Solicitud de abono para confirmar citas.' }
  ],
  'sat-sitecrafter': [
    { id: 'site-1', title: 'Editor Drag & Drop', status: 'current', description: 'Construcción visual de sitios web.' },
    { id: 'site-2', title: 'Plantillas Premium', status: 'future', description: 'Nuevos diseños optimizados por industria.' }
  ],
  'web-constructor': [
    { id: 'cw-1', phase: 'PHASE 1', title: 'Motor de Renderizado & Módulos', status: 'current', description: 'Desarrollo del core para renderizar componentes dinámicos y sistema drag & drop.' },
    { id: 'cw-2', phase: 'PHASE 1', title: 'Integración S.I.P. (Datos Madre)', status: 'current', description: 'Conexión nativa para importar productos, servicios y clientes de la App Madre.' },
    { id: 'cw-3', phase: 'PHASE 2', title: 'Generador IA de Sitios', status: 'future', description: 'Integración con Gemini para crear estructuras web completas a partir de un prompt.' },
    { id: 'cw-4', phase: 'PHASE 3', title: 'Sistema de Publicación & Dominios', status: 'future', description: 'Módulo de pago para despliegue en vivo con dominios personalizados (DigitalOcean + API Dominios).' }
  ]
};

// USER CHANGELOG (What users see)
export const USER_CHANGELOG: ChangelogEntry[] = [
  {
    id: 'u-ch-4',
    date: '2026-02-27',
    title: 'Nuevo Escritorio Unificado',
    description: 'Hemos reorganizado la interfaz. Ahora el "Escritorio" centraliza tus Aplicaciones, Agenda, CRM y el nuevo módulo de Productos y Servicios en un solo lugar mediante pestañas.',
    type: 'feature'
  },
  {
    id: 'u-ch-3',
    date: '2026-02-27',
    title: 'CRM Inteligente y Sincronizado',
    description: 'Tus clientes ahora se sincronizan automáticamente con todas tus aplicaciones. Hemos añadido filtros por negocio y una importación masiva ultrarrápida.',
    type: 'feature'
  },
  {
    id: 'u-ch-2.5',
    date: '2026-02-26',
    title: 'Gestión Multinegocio',
    description: 'Ahora puedes administrar múltiples proyectos o sucursales desde una sola cuenta, manteniendo la información separada y organizada.',
    type: 'feature'
  },
  {
    id: 'u-ch-2.4',
    date: '2026-02-25',
    title: 'Personalización de Marca',
    description: 'Añade tu propio logo y colores corporativos a tu espacio de trabajo. Tus aplicaciones satélites adoptarán tu identidad visual automáticamente.',
    type: 'feature'
  },
  {
    id: 'u-ch-2.3',
    date: '2026-02-24',
    title: 'Modo Invitado',
    description: '¿Quieres probar la plataforma sin registrarte? Hemos habilitado un modo invitado para que explores todas las funciones de forma segura.',
    type: 'feature'
  },
  {
    id: 'u-ch-1',
    date: '2026-02-22',
    title: 'Mejora en Velocidad',
    description: 'Las aplicaciones ahora cargan un 40% más rápido gracias al nuevo sistema de caché.',
    type: 'feature'
  },
  {
    id: 'u-ch-2',
    date: '2026-02-20',
    title: 'Nueva App: SiteCrafter',
    description: 'Ya puedes empezar a construir tu presencia online con SiteCrafter.',
    type: 'feature'
  }
];
