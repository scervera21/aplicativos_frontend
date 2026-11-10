# 🚀 Documentación del Frontend - Sistema de Gestión y Seguimiento de Aplicativos
---

## 📌 1. Visión General del Frontend

El frontend del **Sistema de Gestión y Seguimiento de Aplicativos** está desarrollado como una **Single Page Application (SPA)** de alto rendimiento, construida sobre **Vue 3** (`Composition API` con sintaxis `<script setup lang="ts">`) y **TypeScript 5.x**. 

Su propósito central es ofrecer una interfaz corporativa intuitiva, reactiva y robusta para la administración del inventario de aplicativos, gerencias, control de accesos RBAC (Roles y Permisos de Spatie) y la gestión integral del ciclo de vida de actividades/entregables para Project Managers y colaboradores.

---

## 🛠️ 2. Stack Tecnológico & Dependencias

| Tecnología | Versión instalada | Propósito / Función en el Proyecto |
| :--- | :--- | :--- |
| **Vue.js** | `^3.5.40` | Framework reactivo base (SFC con `<script setup lang="ts">`). |
| **TypeScript** | `~6.0.0` / `5.x` | Tipado estático estricto para entidades, DTOs e interfaces. |
| **Vite** | `^8.1.5` | Bundler y servidor de desarrollo ultra-rápido impulsado por ES modules. |
| **Pinia** | `^4.0.2` | Store reactivo global para autenticación JWT, perfil y permisos de usuario. |
| **Vue Router** | `^5.3.0` | Enrutamiento SPA con control de acceso dinámico (`Navigation Guards` y meta permissions). |
| **Axios** | `^1.20.0` | Cliente HTTP centralizado con cola de reintentos, silent token refresh y manejo global de errores. |
| **TailwindCSS** | `^4.3.3` | Framework CSS utility-first (integrado con `@tailwindcss/vite`). |
| **Sass (SCSS)** | `^1.103.1` | Preprocesador para modularización de estilos bajo patrón 7-1 y variables corporativas. |
| **Heroicons Vue** | `^2.2.0` | Conjunto oficial de iconos vectoriales para acciones, módulos y estados. |
| **SweetAlert2** | `^11.26.25` | Modales interactivos de confirmación, alertas de validación y toasts de notificación. |

---

## 📁 3. Arquitectura de Directorios del Proyecto

La estructura actual en `src/` refleja la separación de responsabilidades:

```text
src/
├── assets/
│   ├── scss/
│   │   ├── abstracts/               # Mixins y variables corporativas (:root)
│   │   │   ├── mixins.scss
│   │   │   └── variables.scss
│   │   ├── base/                    # Resets normalizados y tipografía base
│   │   │   ├── reset.scss
│   │   │   └── typography.scss
│   │   ├── components/              # Estilos modulares de controles y vistas
│   │   │   ├── buttons.scss
│   │   │   ├── forms.scss
│   │   │   ├── modals.scss
│   │   │   └── _tabbed-datatable.scss
│   │   ├── layout/                  # Estilos del sidebar, header y contenedor app-layout
│   │   │   ├── header.scss
│   │   │   ├── layout.scss
│   │   │   └── sidebar.scss
│   │   ├── pages/                   # Estilos específicos de vistas aisladas
│   │   │   └── login.scss
│   │   ├── themes/                  # Soporte temático (dark mode)
│   │   │   └── dark.scss
│   │   ├── vendors/                 # Overrides y adaptaciones para librerías externas
│   │   │   └── vendors.scss
│   │   └── main.scss                # Entrada SCSS principal importada en main.ts
│   └── vue.svg
├── components/
│   ├── common/                      # Componentes reutilizables de UI
│   │   ├── datatable/               # Ecosistema completo de DataTables avanzados
│   │   │   ├── AdvancedDataTable.vue
│   │   │   ├── ColumnVisibilityDropdown.vue
│   │   │   ├── DataTablePagination.vue
│   │   │   ├── DataTableToolbar.vue
│   │   │   └── TabbedDataTableContainer.vue
│   │   ├── FilterSearchToolbar.vue  # Barra de filtros y búsqueda reactiva
│   │   ├── MetricCard.vue           # Tarjetas KPI para métricas y estadísticas
│   │   ├── ModuleHeader.vue         # Cabecera estandarizada para todos los módulos
│   │   └── ProgressCard.vue         # Barra y porcentaje de avance ponderado
│   └── layout/                      # Componentes estructurales del shell
│       ├── Header.vue               # Barra superior de navegación y usuario
│       ├── Modal.vue                # Modal accesible y reutilizable con soporte de teclas (ESC)
│       └── Sidebar.vue              # Barra lateral con filtrado dinámico según RBAC
├── composables/                     # Lógica reactiva reutilizable
│   ├── useDataTable.ts              # Composable para ordenamiento, búsqueda, paginación y exportación
│   └── useTabbedDataTable.ts        # Composable para pestañas categorizadas con conteos reactivos
├── interfaces/                      # Modelos de datos y contratos TypeScript
│   ├── Actividad.ts                 # Tipos para actividades y seguimiento
│   ├── Aplicativo.ts                # Tipos para aplicativos y especificaciones técnicas
│   ├── Area.ts                      # Tipos para áreas organizacionales
│   ├── Gerencia.ts                  # Tipos para gerencias operativas
│   ├── ProjectManager.ts            # Tipos para ciclo de vida por áreas, métricas y mutaciones reactivas
│   └── User.ts                      # Tipos para usuario, roles y permisos Spatie
├── plugins/
│   └── axios.ts                     # Instancia Axios con interceptores JWT y auto-refresh
├── router/
│   └── index.ts                     # Definición de rutas, lazy-loading y Navigation Guards
├── stores/
│   └── authStore.ts                 # Store de Pinia (Setup Store) para estado de autenticación
├── utils/
│   └── handleRequest.ts             # Manejador centralizado de respuestas y errores HTTP con SweetAlert2
├── views/                           # Vistas de la aplicación
│   ├── auth/
│   │   └── Login.vue                # Pantalla de inicio de sesión con validación de credenciales
│   ├── error/
│   │   └── 404.vue                  # Página para rutas no encontradas
│   ├── Actividades.vue              # Módulo de gestión y seguimiento de actividades con pestañas por área
│   ├── Aplicativos.vue              # Módulo de inventario y fichas técnicas de aplicativos
│   ├── Dashboard.vue                # Panel inicial de control, estadísticas y perfil
│   ├── Gerencias.vue                # Módulo CRUD de gerencias institucionales
│   ├── ProjectManager.vue           # Vista de seguimiento de actividades y entregables
│   ├── Roles-Permissions.vue        # Módulo de control de acceso y asignación de permisos
│   └── Usuarios.vue                 # Módulo CRUD y asignación de roles para usuarios
├── App.vue                          # Componente raíz con layout condicional (público / privado)
├── main.ts                          # Entrada de la aplicación y registro de plugins
└── style.css                        # Importaciones de Tailwind CSS v4
```

---

## 🎨 4. Sistema de Diseño & Paleta Institucional

El diseño se basa en **Variables CSS nativas** integradas con **Tailwind CSS v4** y **SCSS**, garantizando consistencia cromática institucional:

```css
:root {
  --color-primary-dark: #032C49; /* Azul Corporativo / Shell / Sidebar */
  --color-light-gray:   #BDCEE5; /* Bordes suaves, divisores y acentos */
  --color-bg-main:      #F4F1FA; /* Fondo principal de la aplicación */
  --color-purple:       #81299A; /* Acento primario, botones de acción y badges */
  --color-royal-blue:   #322CAB; /* Enlaces, gradientes y estados secundarios */
}
```

* **Modales y Superficies:** Tarjetas en blanco puro (`#FFFFFF`) con bordes en `#BDCEE5/40` y elevaciones sutiles (`shadow-xs` / `shadow-sm`).
* **Estados Visuales:**
  * **Completado / Activo:** Verde esmeralda (`#10B981` / `bg-emerald-50 text-emerald-700`).
  * **Pendiente / En Progreso:** Azul / Morado corporativo (`#81299A` / `#322CAB`).
  * **Atrasado / Riesgo:** Tonos ambar / carmesí (`#F59E0B` / `#EF4444`).

---

## 🔐 5. Gestión del Estado de Autenticación (`authStore.ts`)

El store de autenticación está construido utilizando el patrón moderno **Pinia Setup Store** (`defineStore('auth', () => { ... })`). Maneja el estado reactivo, la persistencia en `localStorage` y métodos auxiliares para comprobación granular de permisos:

```typescript
// src/stores/authStore.ts (Esquema funcional)
export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo
  const token = ref<string | null>(localStorage.getItem('token') || null);
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const roles = ref<string[]>(JSON.parse(localStorage.getItem('roles') || '[]'));
  const permissions = ref<string[]>(JSON.parse(localStorage.getItem('permissions') || '[]'));

  // Getters
  const isAuthenticated = computed(() => !!token.value);

  // Acciones principales
  async function login(credentials: { username: string; password: string }): Promise<void>;
  async function fetchMe(): Promise<void>;
  async function logout(): Promise<void>;

  // Comprobaciones de Spatie RBAC
  function hasPermission(permissionName: string): boolean;
  function hasAnyPermission(permissionNames: string[]): boolean;
  function hasRole(roleName: string): boolean;
  function hasAnyRole(roleNames: string[]): boolean;

  return {
    token, user, roles, permissions, isAuthenticated,
    login, fetchMe, logout,
    hasPermission, hasAnyPermission, hasRole, hasAnyRole
  };
});
```

---

## 🌐 6. Capa de Servicios HTTP (`plugins/axios.ts` & `utils/handleRequest.ts`)

La comunicación con el backend Laravel está centralizada mediante una instancia configurada de Axios que implementa:

1. **Inyección de Token Bearer:** Agrega automáticamente el encabezado `Authorization: Bearer <token>` a cada petición saliente.
2. **Cola de Refresco Silencioso (Silent Token Refresh):**
   * Al interceptar una respuesta `401 Unauthorized`, retiene las solicitudes entrantes en una cola `failedQueue`.
   * Realiza una petición limpia a `/auth/refresh` sin interceptores para renovar el JWT.
   * Si la renovación es exitosa, actualiza el `localStorage` y procesa la cola con el nuevo token sin interrumpir al usuario.
   * Si la renovación falla, ejecuta `clearSessionAndRedirect()` expulsando limpiamente al usuario a `/login`.
3. **Manejo Centralizado de Errores (`handleRequest`):**
   * Procesa respuestas `400`, `403`, `404`, `422` (desglosando errores de validación de FormRequests en listas legibles con viñetas) y `500`.
   * Despliega alertas estandarizadas mediante `SweetAlert2`.

---

## 🚥 7. Enrutamiento & Protección de Navegación (`Vue Router`)

El enrutamiento se gestiona en [src/router/index.ts](file:///c:/Users/PC/Documents/GitHub/aplicativos_frontend/src/router/index.ts) con las siguientes rutas registradas y sus respectivas restricciones:

| Ruta | Nombre | Vista asociada | Requisitos (`meta`) |
| :--- | :--- | :--- | :--- |
| `/` | - | *Redirect* a `/dashboard` | - |
| `/login` | `Login` | `views/auth/Login.vue` | `requiresGuest: true` |
| `/dashboard` | `Dashboard` | `views/Dashboard.vue` | `requiresAuth: true` |
| `/usuarios` | `Usuarios` | `views/Usuarios.vue` | `requiresAuth: true`, `permission: 'ver.usuarios'` |
| `/aplicativos` | `Aplicativos` | `views/Aplicativos.vue` | `requiresAuth: true`, `permission: 'ver.aplicativos'` |
| `/gerencias` | `Gerencias` | `views/Gerencias.vue` | `requiresAuth: true`, `permission: 'ver.gerencias'` |
| `/roles` | `Roles y Permisos`| `views/Roles-Permissions.vue` | `requiresAuth: true`, `permission: 'ver.roles'` |
| `/actividades` | `Actividades` | `views/Actividades.vue` | `requiresAuth: true`, `permission: 'ver.actividades'` |
| `/project-manager` | `ProjectManager` | `views/ProjectManager.vue` | `requiresAuth: true`, `permission: 'ver.project-manager'` |
| `/project-manager/:aplicativoID` | `ProjectManagerDetalle` | `views/ProjectManager.vue` | `requiresAuth: true`, `permission: 'ver.project-manager'` |
| `/aplicativos/:aplicativoID/project-manager` | - | *Redirect* a `/project-manager/:aplicativoID` | `requiresAuth: true` |
| `/:pathMatch(.*)*` | `not-found` | `views/error/404.vue` | Pública (Página de error 404) |

### Navigation Guards (`beforeEach`)
El guard valida secuencialmente:
1. **Rutas protegidas:** Redirige a `Login` si no existe token activo.
2. **Rutas para invitados:** Redirige a `Dashboard` si un usuario autenticado intenta entrar a `/login`.
3. **Control por Permisos Spatie:** Evalúa `to.meta.permission` contra `authStore.hasPermission(...)`; si no cuenta con el permiso requerido, cancela el acceso redirigiendo al `Dashboard`.

---

## 🧱 8. Componentes Clave de la Arquitectura

### 8.1 Layout Maestro en `App.vue`
La aplicación utiliza un layout adaptativo y reactivo sin requerir un wrapper separado:
* Para rutas con `requiresGuest: true` o nombradas `Login`, renderiza únicamente `<RouterView />`.
* Para rutas protegidas, renderiza el shell completo: `<Sidebar />` + `<Header />` + contenedor dinámico `<main>`.

### 8.2 Componentes de Estructura (`components/layout/`)
* **`Sidebar.vue`:**
  * Fondo corporativo `#032C49`.
  * Menú filtrado reactivamente mediante `authStore.hasPermission(...)`, mostrando solo los módulos permitidos para el rol del usuario.
* **`Header.vue`:**
  * Muestra el usuario activo, su rol principal (`primaryRole`) y avatar.
  * Botón interactivo de salida con confirmación vía SweetAlert2 que invoca `authStore.logout()`.
* **`Modal.vue`:**
  * Diálogo modal accesible con backdrop, emisión de evento `close`, soporte de cierre con tecla `Escape` y animación fluida con `Transition`.

### 8.3 Ecosistema de DataTables Avanzados (`components/common/datatable/`)
* **`AdvancedDataTable.vue`:**
  * Tabla de datos empresarial con ordenamiento multicampo, selección de filas, selector de tamaño de página (10, 25, 50, 100), estado de carga y exportación a Excel / CSV.
* **`ColumnVisibilityDropdown.vue`:**
  * Desplegable que permite al usuario alternar qué columnas desea visualizar u ocultar en tiempo real.
* **`DataTableToolbar.vue` & `DataTablePagination.vue`:**
  * Barra de herramientas superior con búsqueda global y selector de columnas, combinada con controles inferiores de paginación accesibles.
* **`TabbedDataTableContainer.vue`:**
  * Contenedor con pestañas superiores temáticas (`darkInactiveTabs` opcional) sincronizado con el composable `useTabbedDataTable`.

### 8.4 Componentes Comunes de Dashboard y Formularios
* **`ModuleHeader.vue`:** Cabecera reutilizable que incluye título de sección, subtítulo explicativo, icono institucional y un `slot` para botones de acción (`Nuevo Registro`, `Exportar`, etc.).
* **`MetricCard.vue`:** Indicador visual numérico con iconos, etiquetas, tendencias (positivo/negativo) y esquemas de color (`purple`, `blue`, `navy`, `emerald`).
* **`ProgressCard.vue`:** Barra de progreso ponderada para el avance de aplicativos o actividades.
* **`FilterSearchToolbar.vue`:** Barra de búsqueda con debounce y slots para filtros selectivos adicionales.

---

## 🎛️ 9. Composables de Lógica Compartida

### 9.1 `useDataTable<T>`
Encapsula el comportamiento estándar de tablas sin duplicar lógica en las vistas:
* Búsqueda en texto completo sobre cualquier propiedad del objeto.
* Rango de fechas (`startDate`, `endDate`).
* Ordenamiento ascendente / descendente al hacer clic en las cabeceras.
* Paginación en cliente y selección múltiple de filas con `Set<any>`.

### 9.2 `useTabbedDataTable<T>`
Diseñado específicamente para vistas como [Actividades.vue](file:///c:/Users/PC/Documents/GitHub/aplicativos_frontend/src/views/Actividades.vue):
* Segmenta colecciones por pestañas temáticas o por `area_id` (Desarrollo, Base de Datos, Infraestructura, Levantamiento de Información).
* Calcula automáticamente los contadores dinámicos (`count`) para badges en cada pestaña sin peticiones adicionales al backend.

---

## 📦 10. Módulos y Vistas Implementadas

1. **Autenticación (`views/auth/Login.vue`):** Validación de formulario, visualización de contraseña y conexión JWT con redirección inteligente.
2. **Panel de Control (`views/Dashboard.vue`):** Resumen de bienvenida, badges de permisos de usuario, métricas globales de aplicativos y seguimiento de progreso.
3. **Usuarios (`views/Usuarios.vue`):** Listado con `AdvancedDataTable`, creación y edición en modal, asociación de gerencia y asignación de múltiples roles.
4. **Roles y Permisos (`views/Roles-Permissions.vue`):** Módulo administrativo para crear roles, asignar permisos de Spatie y consultar detalle mediante modal interactivo.
5. **Gerencias (`views/Gerencias.vue`):** Catálogo de gerencias operativas con siglas, nombre y acciones CRUD.
6. **Aplicativos (`views/Aplicativos.vue`):** Inventario de sistemas informáticos, estatus PAP, responsables, lenguajes frontend/backend, bases de datos y modal de ficha técnica.
7. **Actividades (`views/Actividades.vue`):** Tablero integral con `TabbedDataTableContainer` para clasificar tareas por área técnica, asignación de gerencias colaboradoras, control de fechas, prioridades y porcentaje de avance.
8. **Project Manager (`views/ProjectManager.vue`):** Espacio dedicado para el seguimiento puntual de entregables por actividad.
9. **Error 404 (`views/error/404.vue`):** Vista de recuperación amigable con enlace de regreso al Dashboard.

---

## 💡 11. Buenas Prácticas y Convenciones del Código

* **Composition API con `<script setup lang="ts">`:** Todo componente nuevo debe implementarse con TypeScript estricto.
* **Interfaces Tipadas:** Ningún dato recibido de la API debe manejarse como `any`; deben crearse o extenderse las interfaces en `src/interfaces/`.
* **Manejo de Permisos:**
  * A nivel de interfaz: Usar `v-if="authStore.hasPermission('...')"`.
  * A nivel de enrutador: Declarar siempre `meta: { requiresAuth: true, permission: '...' }`.
* **Normalización de Estilos:** Se prioriza el uso de clases utilitarias de Tailwind combinadas con variables corporativas (`var(--color-...)`) y componentes SCSS para mantener la coherencia con el manual corporativo.
