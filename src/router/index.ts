import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresGuest: true },  // Meta para indicar que es una ruta para invitados
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('@/views/Usuarios.vue'),
      meta: { requiresAuth: true, permission: 'ver.usuarios' },
    },
    {
      path: '/aplicativos',
      name: 'aplicativos',
      component: () => import('@/views/Aplicativos.vue'),
      meta: { requiresAuth: true, permission: 'ver.aplicativos' },
    },
    {
      path: '/gerencias',
      name: 'gerencias',
      component: () => import('@/views/Gerencias.vue'),
      meta: { requiresAuth: true , requiredModule: 'Gerencias'},
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('@/views/Roles-Permissions.vue'),
      meta: { requiresAuth: true, permission: 'ver.roles' },
    },
    {
      path: '/actividades',
      name: 'actividades',
      component: () => import('@/views/Actividades.vue'),
      meta: { requiresAuth: true, permission: 'ver.actividades' },
    },
    {
    path: '/aplicativos/:actividadID/project-manager',
    name: 'ProjectManager',
    component: () => import('@/views/Actividades.vue'),
    meta: { 
      requiresAuth: true, 
      permission: 'gestionar.actividades'
    },
    props: true
  },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/error/404.vue'),
    }
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Si la ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' });
  }

  // 2. Si la ruta es solo para invitados (como el login) y el usuario YA está logueado
  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'dashboard' });
  }

  // 3. Validación de permisos específicos de Spatie a nivel de ruta
  const requiredPermission = to.meta.permission as string | undefined;
  if (requiredPermission && !authStore.hasPermission(requiredPermission)) {
    return next({ name: 'dashboard' });
  }

  // Si pasa todas las validaciones, permitimos el acceso
  next();
});

export default router;