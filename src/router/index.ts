import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresGuest: true },  // Meta para indicar que es una ruta para invitados
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/usuarios',
      name: 'Usuarios',
      component: () => import('@/views/Usuarios.vue'),
      meta: { requiresAuth: true, permission: 'ver.usuarios' },
    },
    {
      path: '/aplicativos',
      name: 'Aplicativos',
      component: () => import('@/views/Aplicativos.vue'),
      meta: { requiresAuth: true, permission: 'ver.aplicativos' },
    },
    {
      path: '/gerencias',
      name: 'Gerencias',
      component: () => import('@/views/Gerencias.vue'),
      meta: { requiresAuth: true, permission: 'ver.gerencias' },
    },
    {
      path: '/roles',
      name: 'Roles y Permisos',
      component: () => import('@/views/Roles-Permissions.vue'),
      meta: { requiresAuth: true, permission: 'ver.roles' },
    },
    {
      path: '/actividades',
      name: 'Actividades',
      component: () => import('@/views/Actividades.vue'),
      meta: { requiresAuth: true, permission: 'ver.actividades' },
    },
    {
      path: '/project-manager',
      component: () => import('@/views/ProjectManager.vue'),
      meta: {
        requiresAuth: true,
        permission: 'ver.project-manager'
      },
    },
    {
      path: '/aplicativos/:actividadID/project-manager',
      name: 'ProjectManager',
      component: () => import('@/views/ProjectManager.vue'),
      meta: { 
        requiresAuth: true, 
        permission: 'gestionar.project-manager'
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

router.beforeEach((to, _from) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Si la ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login' };
  }

  // 2. Si la ruta es solo para invitados (como el login) y el usuario YA está logueado
  if (to.meta.requiresGuest && isAuthenticated) {
    return { name: 'Dashboard' };
  }

  // 3. Validación de permisos específicos de Spatie a nivel de ruta
  const requiredPermission = to.meta.permission as string | undefined;
  if (requiredPermission && !authStore.hasPermission(requiredPermission)) {
    return { name: 'Dashboard' };
  }

  // Si pasa todas las validaciones, permitimos el acceso
  return true;
});

export default router;