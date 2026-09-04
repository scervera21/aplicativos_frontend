import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
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
      meta: { requiresAuth: true },
    }
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else if (to.meta.permission && !authStore.permissions.access.includes(to.meta.permission as string)) {
    next({ name: 'dashboard' }); // Redirigir si no posee el permiso de Spatie
  } else {
    next();
  }
});

export default router;