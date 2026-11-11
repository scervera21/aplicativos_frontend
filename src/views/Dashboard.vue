<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/authStore';
import MetricCard from '@/components/common/MetricCard.vue';
import ProgressCard from '@/components/common/ProgressCard.vue';
import type { ProjectManagerResumenItem } from '@/interfaces/ProjectManager';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ChartBarSquareIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);
const userRoles = computed(() => authStore.roles);
const userPermissions = computed(() => authStore.permissions);

// ==========================================
// ESTADO REACTIVO DE MÉTRICAS EN VIVO
// ==========================================
const totalSistemas = ref<number | string>('...');
const sistemasProgress = ref<Array<{ id: string | number; label: string; percentage: number }>>([]);
const loadingStats = ref(false);

const canViewPM = computed(() => authStore.hasPermission('ver.project-manager'));

const fetchDashboardStats = async () => {
  loadingStats.value = true;
  try {
    if (canViewPM.value) {
      const res = await apiClient.get('/project-manager/resumen');
      const data: ProjectManagerResumenItem[] = res.data.data || [];
      totalSistemas.value = data.length;
      sistemasProgress.value = data.map(item => ({
        id: item.aplicativo_id,
        label: `${item.nombre_aplicativo} (${item.alias})`,
        percentage: item.avance_total || 0
      }));
    } else if (authStore.hasPermission('ver.aplicativos')) {
      const res = await apiClient.get('/aplicativos');
      const data = res.data.data || [];
      totalSistemas.value = data.length;
      sistemasProgress.value = data.map((item: any) => ({
        id: item.id,
        label: `${item.nombre_aplicativo} (${item.alias})`,
        percentage: item.avance_total || 0
      }));
    } else {
      totalSistemas.value = 0;
      sistemasProgress.value = [];
    }
  } catch (error) {
    console.error('Error al cargar métricas del Dashboard:', error);
    totalSistemas.value = 0;
  } finally {
    loadingStats.value = false;
  }
};

onMounted(() => {
  fetchDashboardStats();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado de Bienvenida Hero -->
    <div class="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-[#BDCEE5]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="p-3.5 bg-[#F4F1FA] rounded-2xl text-[#81299A] ring-1 ring-[#81299A]/20">
          <UserCircleIcon class="h-12 w-12" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl md:text-3xl font-extrabold text-[#032C49]">
              ¡Bienvenido, {{ currentUser?.username || 'Usuario' }}!
            </h1>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo
            </span>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            Panel de control y seguimiento integral de sistemas, actividades y colaboradores institucionales.
          </p>
        </div>
      </div>

      <!-- <div class="flex flex-wrap items-center gap-3 self-start md:self-auto">
        <RouterLink
          v-if="canViewPM"
          to="/project-manager"
          class="p-2.5 rounded-xl border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors inline-flex items-center gap-2 text-sm font-semibold shadow-xs"
        >
          <ChartBarSquareIcon class="h-4 w-4 text-[#81299A]" />
          <span>Project Manager</span>
        </RouterLink>

        <RouterLink
          to="/actividades"
          class="btn-primary text-sm inline-flex items-center gap-2 shadow-xs"
        >
          <ClipboardDocumentListIcon class="h-4 w-4" />
          <span>Ver Actividades</span>
        </RouterLink>
      </div> -->
    </div>

    <!-- Grid de Métricas Principales (Tokens de la Skill: rounded-2xl, gap-6) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- <MetricCard
        title="Rol Principal"
        :value="userRoles[0] || 'COLABORADOR'"
        subtitle="Nivel de privilegios asignado"
        :icon="ShieldCheckIcon"
        color-scheme="purple"
      /> -->
      <MetricCard
        title="Permisos Activos"
        :value="userPermissions.length"
        subtitle="Capacidades en el sistema"
        :icon="CheckCircleIcon"
        color-scheme="blue"
      />
      <MetricCard
        title="Sistemas Registrados"
        :value="totalSistemas"
        subtitle="Aplicativos vinculados"
        :icon="ComputerDesktopIcon"
        color-scheme="navy"
      />
      <MetricCard
        title="Gerencia"
        :value="currentUser?.gerencia?.sigla || 'GGSI'"
        subtitle="Unidad adscrita"
        :icon="BuildingOfficeIcon"
        color-scheme="emerald"
      />
    </div>

    <!-- Sección de Detalle: Perfil y Progreso Global -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Información de Perfil / Cuenta (2 columnas) -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Tarjeta de Cuenta -->
        <div class="bg-white p-6 rounded-2xl shadow-xs border border-[#BDCEE5]/40 space-y-4">
          <div class="border-b border-[#BDCEE5]/30 pb-3 flex items-center justify-between">
            <h3 class="text-base font-bold text-[#032C49] flex items-center gap-2">
              <UserCircleIcon class="h-5 w-5 text-[#81299A]" />
              Ficha del Usuario
            </h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div class="p-3 bg-[#F4F1FA]/50 rounded-xl border border-[#BDCEE5]/30">
              <span class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Nombre Completo</span>
              <span class="text-[#032C49] font-semibold">
                {{ currentUser?.first_name || '' }} {{ currentUser?.last_name || '' }}
              </span>
            </div>

            <div class="p-3 bg-[#F4F1FA]/50 rounded-xl border border-[#BDCEE5]/30">
              <span class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Correo Electrónico</span>
              <span class="text-[#032C49] font-medium flex items-center gap-1.5">
                <EnvelopeIcon class="h-4 w-4 text-gray-400 shrink-0" />
                <span class="truncate">{{ currentUser?.email }}</span>
              </span>
            </div>
          </div>

          <!-- Roles Asignados -->
          <div class="pt-2">
            <span class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-2">
              Roles
            </span>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in userRoles"
                :key="role"
                class="px-3 py-1 bg-[#F4F1FA] text-[#81299A] border border-[#81299A]/30 rounded-xl text-xs font-semibold"
              >
                {{ role }}
              </span>
              <span v-if="!userRoles.length" class="text-xs text-gray-400 italic">
                Sin roles asignados
              </span>
            </div>
          </div>
        </div>

        <!-- Permisos Activos con Scroll Estilizado -->
        <div class="bg-white p-6 rounded-2xl shadow-xs border border-[#BDCEE5]/40 space-y-3">
          <div class="flex items-center justify-between border-b border-[#BDCEE5]/30 pb-3">
            <h3 class="text-base font-bold text-[#032C49]">
              Permisos Habilitados
            </h3>
            <span class="text-xs font-mono font-semibold text-[#81299A] bg-[#F4F1FA] px-2.5 py-0.5 rounded-full">
              {{ userPermissions.length }} activos
            </span>
          </div>

          <div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-[#F4F1FA]/40 rounded-xl border border-[#BDCEE5]/20">
            <span
              v-for="permission in userPermissions"
              :key="permission"
              class="px-2.5 py-1 bg-white text-[#032C49] border border-[#BDCEE5]/80 rounded-lg text-xs font-mono shadow-2xs hover:border-[#81299A] transition-colors"
            >
              {{ permission }}
            </span>
            <span v-if="!userPermissions.length" class="text-xs text-gray-400 italic">
              No hay permisos asignados al usuario en el token.
            </span>
          </div>
        </div>

      </div>

      <!-- Tarjeta de Progreso de Proyectos / Aplicativos (1 columna) -->
      <div class="space-y-6">
        <!-- <ProgressCard
          title="Avance de Sistemas"
          subtitle="Seguimiento de hitos y desarrollo en tiempo real"
          :items="sistemasProgress"
        /> -->

        <!-- Banner Informativo -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-[#032C49] to-[#322CAB] text-white shadow-sm space-y-2">
          <div class="flex items-center gap-2">
            <ShieldCheckIcon class="h-6 w-6 text-[#BDCEE5]" />
            <h4 class="font-bold text-sm">Entorno Seguro</h4>
          </div>
          <p class="text-xs text-[#BDCEE5] leading-relaxed">
            Sesión validada con JSON Web Tokens (JWT) y autorización basada en políticas de seguridad de COINSE.
          </p>
        </div>
      </div>

    </div>
  </div>
</template>
