# 🚀 Documentación del Frontend - Sistema de Gestión y Seguimiento de Aplicativos
---

## 📌 1. Visión General del Frontend

El frontend del **Sistema de Gestión y Seguimiento de Aplicativos** está desarrollado como una **Single Page Application (SPA)** de alto rendimiento, diseñada bajo los estándares de la Composition API de Vue 3 y TypeScript. Su objetivo es brindar una interfaz moderna, reactiva y limpia para administrar el inventario de aplicativos y el seguimiento operativo del Project Manager.

---

## 🛠️ 2. Stack Tecnológico & Dependencias

| Tecnología | Versión | Propósito / Función |
| :--- | :--- | :--- |
| **Vue.js** | `v3.x` | Framework reactivo base (Composition API con `<script setup lang="ts">`). |
| **TypeScript** | `v5.x` | Tipado estático para garantizar la integridad de las entidades y DTOs. |
| **Pinia** | `^4.0.2` | Gestión del estado global centralizado de la sesión del usuario. |
| **Vue Router** | `^4.x` | Enrutamiento dinámico SPA con protección de rutas (`Navigation Guards`). |
| **Axios** | `^1.20.0` | Cliente HTTP centralizado con interceptores para tokens JWT Bearer. |
| **TailwindCSS** | `^4.3.3` | Utility-first CSS framework para maquetación ágil e integración de variables CSS. |
| **Sass (SCSS)**| `^1.103.1` | Arquitectura 7-1 para modularización de estilos corporativos. |
| **Heroicons** | `^2.x` | Iconografía vectorial nativa de Vue. |
| **SweetAlert2** | `^11.26.25` | Modal de confirmaciones dinámicas y notificaciones en pantalla. |

---

## 📁 3. Arquitectura de Directorios

```text
src/
├── assets/
│   └── scss/
│       ├── abstracts/     # Mixins y Variables (:root con Custom Properties)
│       ├── base/          # Resets y globales
│       ├── components/    # Estilos de botones, modales y formularios
│       ├── layout/        # Estilos del header, sidebar y wrapper principal
│       ├── pages/         # Estilos específicos de vistas (login, dashboard)
│       └── main.scss      # Hoja de estilos principal importada en main.ts
├── components/
│   ├── common/
│   │   └── Modal.vue      # Modal genérico reutilizable con slots dinámicos
│   └── layout/
│       ├── Header.vue     # Encabezado con perfil y cierre de sesión
│       └── Sidebar.vue    # Navegación lateral condicional basada en Spatie RBAC
├── layouts/
│   └── DefaultLayout.vue  # Layout maestro que empaqueta Sidebar + Header + RouterView
├── router/
│   └── index.ts           # Definición de rutas y Navigation Guards moderno
├── stores/
│   └── authStore.ts       # Store de Pinia para JWT, usuario y roles/permisos
└── views/
    ├── LoginView.vue       # Vista de acceso pública
    ├── DashboardView.vue   # Vista protegida inicial con perfil de usuario
    └── AplicativosView.vue # Vista de inventario de aplicativos (en proceso)
```

---

## 🎨 4. Sistema de Diseño & Paleta Institucional

El sistema utiliza la paleta corporativa mediante **Variables CSS nativas** para garantizar la compatibilidad total entre **Sass** y **TailwindCSS v4**:

```css
:root {
  --color-primary-dark: #032C49; /* Azul Corporativo / Sidebar */
  --color-light-gray:   #BDCEE5; /* Bordes y Acentos Claras */
  --color-bg-main:      #F4F1FA; /* Fondo Principal */
  --color-purple:       #81299A; /* Botones y Destacados Morados */
  --color-royal-blue:   #322CAB; /* Gradientes y Modales */
}
```

---

## 🔐 5. Gestión del Estado de Autenticación (Pinia)

El store **`authStore.ts`** gestiona el estado reactivo del JWT, la persistencia en `localStorage` y la lectura de los **Roles y Permisos de Spatie** inyectados desde el backend.

```typescript
// src/stores/authStore.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRoles: (state) => state.user?.roles || [],
    userPermissions: (state) => state.user?.permisos || [],
  },
  actions: {
    setAuthData(token: string, user: any) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
```

---

## 🚥 6. Enrutamiento & Protección de Navegación (`Vue Router`)

Se implementó el patrón moderno de **retorno de rutas** en el enrutador para evitar el uso del `next()` deprecado en Vue Router v4. Además, se separan estrictamente las rutas públicas (como `/login`) del layout principal.

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const routes = [
  // 1. Ruta Pública (No usa DefaultLayout)
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },

  // 2. Rutas Protegidas (Envueltas por DefaultLayout)
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue')
      },
      {
        path: 'aplicativos',
        name: 'Aplicativos',
        component: () => import('@/views/AplicativosView.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de navegación sin `next()`
router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login' };
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'Dashboard' };
  }

  return true;
});

export default router;
```

---

## 🧱 7. Componentes de Estructura de Interfaz (Layout Core)

### 7.1 `Sidebar.vue` (Navegación Lateral)
* **Fondo:** `#032C49` (Azul corporativo).
* **Funcionalidad:** Renderizado de módulos activos según la ruta actual y filtrado visual según roles/permisos del usuario.

### 7.2 `Header.vue` (Barra Superior)
* **Fondo:** Blanco con sombra suave y bordes institucionales.
* **Funcionalidad:**
  * Muestra el saludo personalizado con el nombre de usuario y su rol principal de Spatie.
  * Botón **"Salir"** con modal de confirmación `SweetAlert2` que destruye la sesión y redirige al Login.

### 7.3 `DefaultLayout.vue` (Maestro del Layout)
Ensambla el flujo visual de la SPA para usuarios autenticados:

```vue
<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue';
import Header from '@/components/layout/Header.vue';
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <Header />
      <main class="flex-1 p-6 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
```

---

## 📊 8. Dashboard de Perfil Integrado (`DashboardView.vue`)

Implementación inicial limpia que expone la información actual del usuario en sesión y permite verificar la inyección exitosa del token JWT y Spatie RBAC:

* **Información de la Cuenta:** Nombre de usuario y correo electrónico.
* **Roles Asignados:** Badges institucionales en tono morado (`#81299A`).
* **Permisos Activos:** Desglose completo de los permisos Spatie inyectados desde el backend (`ver.aplicativos`, `gestionar.actividades`, etc.).

---

## ⚙️ 9. Solución a Incidencias Técnicas Resueltas

1. **Jerarquía SCSS `@use`:** Se reordenaron las hojas `@use` para estar en la parte superior absoluta de los archivos `.scss` antes de cualquier regla CSS o Tailwind.
2. **Funciones de Color Sass (`darken` / `rgba`):** Se migraron los procesamientos de color nativos de Sass incompatibles con `var(--color)` a funciones CSS modernas como `color-mix(in srgb, var(...) 85%, black)`.
3. **Migración de Navigation Guards:** Eliminación completa del parámetro `next()` en favor de retornos implícitos (`return { name: 'Route' }` / `return true`).
