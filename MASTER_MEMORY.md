# SOLUTIUM MASTER PROTOCOL & ARCHITECTURE RECORD

> **STATUS:** ACTIVE CONSTITUTION
> **VERSION:** 2.4.0
> **ROLE:** Senior Software Architect

Este documento define las reglas inquebrantables para el desarrollo de Solutium y sus aplicaciones satélite.

---

## 1. HOJA DE RUTA DINÁMICA (Dynamic Roadmap)
Sección viva para el seguimiento de objetivos. Cada nueva funcionalidad debe clasificarse aquí antes de codificarse.

### 🔴 Pendiente (Backlog)
- **Migración a Supabase:** Reemplazar el `AuthContext` actual (localStorage) por `supabase-js`.
- **Despliegue de Apps Satélite:** Subir el "Generador de Cotizaciones" real a `invoice.solutium.app` (o un subdominio de staging en Vercel/Netlify por ahora).

### 🟡 En Progreso (In Progress)
- **Integración Satélite (Bridge):** Probando la inyección de tokens usando el simulador interno.

### 🟢 Completado (Done)
- **Corrección de Simulador:** El Dashboard ahora fuerza la apertura del simulador interno para pruebas locales.
- **Estrategia de Datos:** Definida arquitectura basada en Supabase (Schema Público Compartido).

---

## 2. ESTRATEGIA DE ENTORNOS (Environment Architecture)
1.  **Local:** Desarrollo activo.
2.  **Staging:** Pruebas de integración "Handshake".
3.  **Producción:** Apps en vivo.

---

## 3. PROTOCOLO DE INTEGRACIÓN SATÉLITE ("The Bridge")
Para integrar aplicaciones existentes (Legacy) al ecosistema Solutium:

1.  **Recepción:** La App Satélite debe leer el parámetro `?token=` de la URL al iniciar.
2.  **Decodificación:** El token es un Base64 JSON (prototipo) o JWT (producción). Contiene:
    *   `projectId`: ID del proyecto activo.
    *   `userId`: Quién está accediendo.
3.  **Hidratación:** La App Satélite debe reemplazar sus configuraciones locales con los datos recibidos.

---

## 4. MEMORIA MAESTRA DE DISEÑO
*   **Colores:** `bg-solutium-dark`, `bg-solutium-blue`, `text-solutium-grey`, `bg-solutium-yellow`.

---

## 5. ESTRATEGIA DE DATOS (DATA ARCHITECTURE)
**Proveedor Elegido:** Supabase (PostgreSQL + Auth).

### Esquema Compartido (Shared Schema)
Para que todas las apps (Madre y Satélites) hablen el mismo idioma, deben compartir estas tablas base en Supabase:

#### A. Tabla `profiles` (Usuarios Globales)
*   `id` (uuid, PK): Vinculado a `auth.users`.
*   `full_name` (text)
*   `avatar_url` (text)
*   `subscription_tier` (text): 'free', 'pro', 'enterprise'.

#### B. Tabla `projects` (La entidad central)
*   `id` (uuid, PK)
*   `owner_id` (uuid, FK -> profiles.id)
*   `name` (text)
*   `brand_colors` (jsonb): Array de 3 colores hex.
*   `logo_url` (text)
*   `contact_info` (jsonb): { email, phone, address, whatsapp }

#### C. Tabla `project_members` (Permisos)
*   `project_id` (uuid, FK)
*   `user_id` (uuid, FK)
*   `role` (text): 'owner', 'editor', 'viewer'.

**Regla de Oro:** Las Apps Satélite NUNCA escriben en `projects` (solo lectura). Solo escriben en sus propias tablas (ej: `invoices`, `websites`), vinculando los datos al `project_id`.

---

## 6. SOLUTIUM SATELLITE STARTER KIT (The Factory)
El estándar obligatorio para crear nuevas aplicaciones.
*   **Estructura:** Template de repositorio con SDK pre-instalado.
*   **SDK:** Librería unificada para Auth, Eventos y Datos.
*   **Boot Protocol:** Lógica de inicialización "Zero-Config" que espera el handshake de la App Madre.

## 7. SOLUTIUM CONTACT HUB (The Core Engine)
El CRM Ligero que vive en la App Madre.
*   **Single Source of Truth:** Los clientes pertenecen al Proyecto, no a la App Satélite.
*   **Flujo de Datos:**
    *   Madre: Crea/Edita/Borra Clientes.
    *   Satélite: Lee Clientes (Read-Only) o solicita edición vía Evento.

---

**Change Log:**
- v2.5.0: Reorganización Estratégica (Bedrock -> Factory -> Core -> Expansion).
- v2.4.0: Definición de Estrategia de Datos (Supabase) y Esquema Compartido.
- v2.3.0: Protocolo "Bridge" para apps existentes.
