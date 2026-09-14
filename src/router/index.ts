import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/Usuarios.vue'),
      meta: { requiresAuth: true, permission: 'acceder_usuarios' },
    },
    {
      path: '/aplicativos',
      name: 'aplicativos',
      component: () => import('@/views/Aplicativos.vue'),
      meta: { requiresAuth: true, permission: 'acceder_aplicativos'},
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
    return { name: 'login' };
  }
  // Si la ruta requiere un permiso específico y el usuario no lo tiene
  else if (to.meta.permission && !authStore.userPermissions.includes(to.meta.permission as string)) {
    return { name: 'dashboard' };
  } else {
    return true;
  }
});

export default router;