<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/authStore';
import type {
  ProjectManagerData,
  ProjectManagerResumenItem,
  CicloDeVidaArea
} from '@/interfaces/ProjectManager';
import type { Actividad } from '@/interfaces/Actividad';
import ModuleHeader from '@/components/common/ModuleHeader.vue';
import MetricCard from '@/components/common/MetricCard.vue';
import Modal from '@/components/layout/Modal.vue';
import Swal from 'sweetalert2';
import {
  ChartBarSquareIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  CircleStackIcon,
  ServerStackIcon,
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline';

interface Props {
  aplicativoID?: string | number;
}

const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// ==========================================
// CONTROL DE PERMISOS (RBAC)
// ==========================================
const canManage = computed(() => {
  return authStore.hasPermission('gestionar.project-manager') ||
    authStore.hasRole('ADMINISTRADOR');
});

// ==========================================
// ESTADO REACTIVO
// ==========================================
const loading = ref(false);
const savingMutation = ref(false);
const searchActivityQuery = ref('');

// Modos de vista: 'resumen' o 'detalle'
const currentAppId = ref<number | null>(null);
const resumenGeneral = ref<ProjectManagerResumenItem[]>([]);
const projectData = ref<ProjectManagerData | null>(null);

// Estado de expansión de áreas en acordeón
const expandedAreas = ref<Record<number, boolean>>({});

// Modal de Ajuste de Porcentaje
const isPercentageModalOpen = ref(false);
const selectedActividad = ref<Actividad | null>(null);
const targetPercentage = ref<number>(0);
const savingPercentage = ref(false);

// ==========================================
// ICONOS DE ÁREAS TÉCNICAS
// ==========================================
const getAreaIcon = (nombre: string) => {
  const n = (nombre || '').toUpperCase();
  if (n.includes('DESARROLLO')) return CodeBracketIcon;
  if (n.includes('BASE DE DATOS') || n.includes('DATOS')) return CircleStackIcon;
  if (n.includes('INFRAESTRUCTURA') || n.includes('REDES')) return ServerStackIcon;
  if (n.includes('LEVANTAMIENTO') || n.includes('INFORMACION') || n.includes('ANALISIS')) {
    return DocumentMagnifyingGlassIcon;
  }
  return ClipboardDocumentListIcon;
};

// ==========================================
// CARGA DE DATOS DE LA API
// ==========================================
const fetchResumenGeneral = async () => {
  loading.value = true;
  try {
    const res = await apiClient.get('/project-manager/resumen');
    resumenGeneral.value = res.data.data || [];
  } catch (error) {
    console.error('Error al cargar resumen de Project Manager:', error);
  } finally {
    loading.value = false;
  }
};

const fetchAplicativoDetails = async (appId: number) => {
  loading.value = true;
  try {
    const res = await apiClient.get(`/project-manager/aplicativos/${appId}`);
    projectData.value = res.data.data;
    currentAppId.value = appId;

    // Inicializar todas las áreas expandidas por defecto
    if (projectData.value?.ciclo_de_vida_por_areas) {
      projectData.value.ciclo_de_vida_por_areas.forEach(area => {
        if (expandedAreas.value[area.area_id] === undefined) {
          expandedAreas.value[area.area_id] = true;
        }
      });
    }
  } catch (error) {
    console.error(`Error al cargar datos del aplicativo #${appId}:`, error);
    Swal.fire({
      icon: 'error',
      title: 'Aplicativo no encontrado',
      text: 'No se pudo obtener la información del ciclo de vida para este aplicativo.',
      confirmButtonColor: '#032C49'
    });
    projectData.value = null;
  } finally {
    loading.value = false;
  }
};

const syncViewFromRoute = async () => {
  const paramId = props.aplicativoID || route.params.aplicativoID;
  if (paramId) {
    const parsedId = Number(paramId);
    if (!isNaN(parsedId) && parsedId > 0) {
      await fetchAplicativoDetails(parsedId);
      // Cargar también lista general en segundo plano para el dropdown selector
      if (resumenGeneral.value.length === 0) {
        apiClient.get('/project-manager/resumen').then(res => {
          resumenGeneral.value = res.data.data || [];
        });
      }
      return;
    }
  }
  // Si no hay parámetro de id, mostrar resumen general
  currentAppId.value = null;
  projectData.value = null;
  await fetchResumenGeneral();
};

watch(
  () => [props.aplicativoID, route.params.aplicativoID],
  () => {
    syncViewFromRoute();
  }
);

onMounted(() => {
  syncViewFromRoute();
});

// ==========================================
// NAVEGACIÓN Y CAMBIO DE APLICATIVO
// ==========================================
const selectAplicativo = (appId: number | null) => {
  if (!appId) {
    router.push({ name: 'ProjectManager' });
  } else {
    router.push({ name: 'ProjectManagerDetalle', params: { aplicativoID: appId } });
  }
};

const toggleAreaExpansion = (areaId: number) => {
  expandedAreas.value[areaId] = !expandedAreas.value[areaId];
};

// ==========================================
// FILTRADO DE ACTIVIDADES
// ==========================================
const getFilteredActivities = (area: CicloDeVidaArea): Actividad[] => {
  if (!searchActivityQuery.value.trim()) {
    return area.actividades;
  }
  const q = searchActivityQuery.value.toLowerCase();
  return area.actividades.filter(act =>
    act.nombre_actividad.toLowerCase().includes(q) ||
    act.estado.toLowerCase().includes(q) ||
    act.prioridad.toLowerCase().includes(q)
  );
};

// ==========================================
// MUTACIONES REACTIVAS DEL PROJECT MANAGER
// ==========================================

// 1. Toggle Checklist (100% o 0%)
const handleToggleChecklist = async (actividad: Actividad) => {
  if (!canManage.value) {
    Swal.fire({
      icon: 'info',
      title: 'Acceso de solo lectura',
      text: 'Se requiere el rol de Administrador para modificar el avance.',
      confirmButtonColor: '#032C49'
    });
    return;
  }

  const nuevoEstado = !actividad.completado;
  savingMutation.value = true;

  try {
    const res = await apiClient.patch(`/project-manager/actividades/${actividad.id}/checklist`, {
      completado: nuevoEstado
    });

    const data = res.data.data;
    const updatedActividad: Actividad = data.actividad;

    // Actualización reactiva inmediata en la memoria local
    if (projectData.value) {
      // 1. Actualizar indicadores globales del aplicativo
      projectData.value.indicadores.avance_total = data.nuevo_avance_aplicativo;
      projectData.value.indicadores.avance_pendiente = data.nuevo_avance_pendiente;

      // 2. Actualizar la actividad dentro de su área
      projectData.value.ciclo_de_vida_por_areas.forEach(area => {
        const idx = area.actividades.findIndex(a => a.id === actividad.id);
        if (idx !== -1) {
          area.actividades[idx] = {
            ...area.actividades[idx],
            ...updatedActividad,
            completado: updatedActividad.completado,
            porcentaje: updatedActividad.porcentaje,
            estado: updatedActividad.estado,
            fecha_culminacion: updatedActividad.fecha_culminacion
          };

          // Recalcular métricas del área localmente
          const totalArea = area.actividades.length;
          const culminadas = area.actividades.filter(a => a.completado).length;
          const sumPorcentajes = area.actividades.reduce((acc, a) => acc + (a.porcentaje || 0), 0);
          area.total_actividades = totalArea;
          area.actividades_culminadas = culminadas;
          area.avance_area = totalArea > 0 ? Math.round((sumPorcentajes / totalArea) * 100) / 100 : 0;
        }
      });

      // 3. Recalcular métricas globales (culminadas, pendientes, atrasadas)
      const allActivities = projectData.value.ciclo_de_vida_por_areas.flatMap(a => a.actividades);
      projectData.value.indicadores.metricas = {
        total: allActivities.length,
        culminadas: allActivities.filter(a => a.estado === 'CULMINADO').length,
        pendientes: allActivities.filter(a => a.estado === 'PENDIENTE').length,
        atrasadas: allActivities.filter(a => a.estado === 'ATRASADO').length
      };
    }

    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
    toast.fire({
      icon: 'success',
      title: nuevoEstado ? 'Actividad marcada como culminada (100%)' : 'Actividad reactivada a pendiente'
    });
  } catch (error) {
    console.error('Error al actualizar checklist:', error);
  } finally {
    savingMutation.value = false;
  }
};

// 2. Ajuste manual de porcentaje
const openPercentageModal = (actividad: Actividad) => {
  if (!canManage.value) {
    Swal.fire({
      icon: 'info',
      title: 'Acceso de solo lectura',
      text: 'Se requiere el rol de Administrador para modificar el porcentaje.',
      confirmButtonColor: '#032C49'
    });
    return;
  }
  selectedActividad.value = actividad;
  targetPercentage.value = actividad.porcentaje || 0;
  isPercentageModalOpen.value = true;
};

const closePercentageModal = () => {
  isPercentageModalOpen.value = false;
  selectedActividad.value = null;
};

const setPresetPercentage = (pct: number) => {
  targetPercentage.value = pct;
};

const handleSavePercentage = async () => {
  if (!selectedActividad.value) return;
  savingPercentage.value = true;

  try {
    const res = await apiClient.put(`/project-manager/actividades/${selectedActividad.value.id}/porcentaje`, {
      porcentaje: Number(targetPercentage.value) || 0
    });

    const data = res.data.data;
    const updatedActividad: Actividad = data.actividad;

    if (projectData.value) {
      projectData.value.indicadores.avance_total = data.nuevo_avance_aplicativo;
      projectData.value.indicadores.avance_pendiente = data.nuevo_avance_pendiente;

      projectData.value.ciclo_de_vida_por_areas.forEach(area => {
        const idx = area.actividades.findIndex(a => a.id === updatedActividad.id);
        if (idx !== -1) {
          area.actividades[idx] = {
            ...area.actividades[idx],
            ...updatedActividad
          };

          const totalArea = area.actividades.length;
          const culminadas = area.actividades.filter(a => a.completado).length;
          const sumPorcentajes = area.actividades.reduce((acc, a) => acc + (a.porcentaje || 0), 0);
          area.total_actividades = totalArea;
          area.actividades_culminadas = culminadas;
          area.avance_area = totalArea > 0 ? Math.round((sumPorcentajes / totalArea) * 100) / 100 : 0;
        }
      });

      const allActivities = projectData.value.ciclo_de_vida_por_areas.flatMap(a => a.actividades);
      projectData.value.indicadores.metricas = {
        total: allActivities.length,
        culminadas: allActivities.filter(a => a.estado === 'CULMINADO').length,
        pendientes: allActivities.filter(a => a.estado === 'PENDIENTE').length,
        atrasadas: allActivities.filter(a => a.estado === 'ATRASADO').length
      };
    }

    closePercentageModal();

    Swal.fire({
      icon: 'success',
      title: 'Porcentaje actualizado',
      text: `El avance se ha registrado en ${updatedActividad.porcentaje}%. Avance del aplicativo reevaluado a ${data.nuevo_avance_aplicativo}%.`,
      timer: 1800,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error al guardar porcentaje:', error);
  } finally {
    savingPercentage.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Encabezado del Módulo con Controles de Navegación -->
    <ModuleHeader
      title="Project Manager"
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <!-- Selector Rápido de Aplicativo -->
          <div class="relative inline-flex items-center">
            <select
              :value="currentAppId || ''"
              @change="(e: any) => selectAplicativo(e.target.value ? Number(e.target.value) : null)"
              class="px-3.5 py-2 pr-8 rounded-xl border border-[#BDCEE5]/60 bg-white text-sm text-[#032C49] font-semibold focus:outline-none focus:ring-2 focus:ring-[#81299A] shadow-xs cursor-pointer"
            >
              <option value="">🏢 Todos los Sistemas</option>
              <option
                v-for="item in resumenGeneral"
                :key="item.aplicativo_id"
                :value="item.aplicativo_id"
              >
                {{ item.nombre_aplicativo }} 
              </option>
            </select>
          </div>

          <!-- Botón de Actualizar / Refrescar -->
          <button
            @click="syncViewFromRoute"
            :disabled="loading"
            class="p-2.5 rounded-xl border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors inline-flex items-center gap-2 text-sm font-medium shadow-xs"
            title="Recargar datos"
          >
            <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </template>
    </ModuleHeader>

    <!-- Estado de Carga -->
    <div v-if="loading" class="bg-white p-16 rounded-2xl border border-[#BDCEE5]/40 text-center space-y-4 shadow-xs">
      <div class="inline-flex p-4 bg-[#F4F1FA] rounded-2xl text-[#81299A] animate-spin">
        <ArrowPathIcon class="h-8 w-8" />
      </div>
      <p class="text-sm font-semibold text-[#032C49]">Cargando Project Manager...</p>
    </div>

    <!-- ========================================================================= -->
    <!-- MODO 1: DETALLE DEL APLICATIVO SELECCIONADO (CICLO DE VIDA POR ÁREAS)       -->
    <!-- ========================================================================= -->
    <div v-else-if="projectData" class="space-y-6">
      
      <!-- Ficha de Encabezado del Aplicativo -->
      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-[#BDCEE5]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-start gap-4">
          <div class="p-3.5 bg-[#F4F1FA] rounded-2xl text-[#81299A] ring-1 ring-[#81299A]/20 shrink-0">
            <ComputerDesktopIcon class="h-10 w-10" />
          </div>
          <div class="space-y-1.5">
            <div class="flex flex-wrap items-center gap-2.5">
              <h2 class="text-xl md:text-2xl font-extrabold text-[#032C49]">
                {{ projectData.aplicativo.nombre_aplicativo }}
              </h2>
            </div>
            <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500 font-medium">
              <span class="flex items-center gap-1.5">
                <BuildingOfficeIcon class="h-4 w-4 text-gray-400" />
                Gerencia: <strong class="text-[#032C49]">{{ projectData.aplicativo.gerencia_responsable || 'No asignada' }}</strong>
              </span>
              <span class="flex items-center gap-1.5">
                <UserCircleIcon class="h-4 w-4 text-gray-400" />
                Responsable: <strong class="text-[#032C49]">{{ projectData.aplicativo.responsable || 'No asignado' }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjetas de Métricas Clave (KPIs) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Avance Total Ponderado -->
        <div class="bg-white p-5 md:p-6 rounded-2xl shadow-xs border border-[#BDCEE5]/40 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Avance Total</span>
            <div class="p-2.5 rounded-xl bg-[#F4F1FA] text-[#81299A]">
              <SparklesIcon class="h-5 w-5" />
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-[#032C49]">
              {{ projectData.indicadores.avance_total }}%
            </span>
          </div>
          <div class="w-full bg-[#F4F1FA] h-2.5 rounded-full overflow-hidden border border-[#BDCEE5]/30">
            <div
              class="h-full bg-gradient-to-r from-[#81299A] to-[#322CAB] rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(Math.max(projectData.indicadores.avance_total, 0), 100)}%` }"
            />
          </div>
        </div>

        <!-- Avance Pendiente -->
        <MetricCard
          title="Avance Pendiente"
          :value="`${projectData.indicadores.avance_pendiente}%`"
          :icon="ClockIcon"
          color-scheme="blue"
        />

        <!-- Actividades Culminadas -->
        <MetricCard
          title="Tareas Culminadas"
          :value="`${projectData.indicadores.metricas.culminadas} / ${projectData.indicadores.metricas.total}`"
          :icon="CheckCircleIcon"
          color-scheme="emerald"
        />

        <!-- Pendientes / Atrasadas -->
        <MetricCard
          title="En Curso / Riesgo"
          :value="`${projectData.indicadores.metricas.pendientes} pendientes`"
          :subtitle="`${projectData.indicadores.metricas.atrasadas} actividad(es) atrasada(s)`"
          :icon="ExclamationTriangleIcon"
          color-scheme="navy"
        />
      </div>

      <!-- Barra de Búsqueda y Filtrado en Actividades del Ciclo de Vida -->
      <div class="bg-white p-4 rounded-2xl shadow-xs border border-[#BDCEE5]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <input
            v-model="searchActivityQuery"
            type="text"
            placeholder="Filtrar actividades en el ciclo de vida..."
            class="w-full pl-3.5 pr-4 py-2 border border-[#BDCEE5]/60 rounded-xl text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
          />
        </div>
      </div>

      <!-- Ciclo de Vida Agrupado por Áreas Predefinidas -->
      <div class="space-y-5">
        <div
          v-for="area in projectData.ciclo_de_vida_por_areas"
          :key="area.area_id"
          class="bg-white rounded-2xl shadow-xs border border-[#BDCEE5]/40 overflow-hidden transition-shadow hover:shadow-sm"
        >
          <!-- Cabecera del Área (Acordeón) -->
          <div
            @click="toggleAreaExpansion(area.area_id)"
            class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#F4F1FA]/30 transition-colors border-b border-[#BDCEE5]/20"
          >
            <div class="flex items-center gap-3.5">
              <div class="p-2.5 rounded-xl bg-[#F4F1FA] text-[#81299A] ring-1 ring-[#81299A]/10">
                <component :is="getAreaIcon(area.nombre_area)" class="h-6 w-6" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-[#032C49]">
                    {{ area.nombre_area }}
                  </h3>
                <!--  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {{ area.total_actividades }} {{ area.total_actividades === 1 ? 'actividad' : 'actividades' }}
                  </span>-->
                </div>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ area.actividades_culminadas }} de {{ area.total_actividades }} actividades completadas
                </p>
              </div>
            </div>

            <!-- Progreso del Área e Indicador de Expansión -->
            <div class="flex items-center gap-6">
              <div class="w-36 md:w-48 space-y-1">
                <div class="flex justify-between text-xs font-mono font-bold">
                  <span class="text-[#81299A]">{{ area.avance_area }}%</span>
                </div>
                <div class="w-full bg-[#F4F1FA] h-2 rounded-full overflow-hidden border border-[#BDCEE5]/30">
                  <div
                    class="h-full bg-gradient-to-r from-[#81299A] to-[#322CAB] rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min(Math.max(area.avance_area, 0), 100)}%` }"
                  />
                </div>
              </div>

              <div class="p-1.5 rounded-lg text-gray-400 hover:text-[#032C49]">
                <ChevronUpIcon v-if="expandedAreas[area.area_id]" class="h-5 w-5" />
                <ChevronDownIcon v-else class="h-5 w-5" />
              </div>
            </div>
          </div>

          <!-- Contenido del Área: Tabla Interactiva de Actividades -->
          <div v-show="expandedAreas[area.area_id]" class="p-5 bg-white">
            <div v-if="getFilteredActivities(area).length === 0" class="py-8 text-center text-xs text-gray-400 italic">
              Sin actividades registradas en esta area.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-[#BDCEE5]/30 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-[#F4F1FA]/40">
                    <th class="py-3 px-3 text-center w-14"></th>
                    <th class="py-3 px-3">Progreso</th>
                    <th class="py-3 px-3 w-28 text-center">Prioridad</th>
                    <th class="py-3 px-3 w-32 text-center">Estado</th>
                    <th class="py-3 px-3 w-48">Avance</th>
                    <th class="py-3 px-3 w-28 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#BDCEE5]/20 text-sm">
                  <tr
                    v-for="actividad in getFilteredActivities(area)"
                    :key="actividad.id"
                    class="hover:bg-[#F4F1FA]/30 transition-colors"
                    :class="{ 'bg-emerald-50/20': actividad.completado }"
                  >
                    <!-- Checkbox Reactivo de Checklist (100% / 0%) -->
                    <td class="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        :checked="actividad.completado"
                        :disabled="!canManage || savingMutation"
                        @change="handleToggleChecklist(actividad)"
                        class="h-4 w-4 rounded border-gray-300 text-[#81299A] focus:ring-[#81299A] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        :title="canManage ? 'Marcar como culminado (100%) o desmarcar' : 'Modo solo lectura'"
                      />
                    </td>

                    <!-- Nombre y Metadatos de la Actividad -->
                    <td class="py-3 px-3">
                      <div class="space-y-0.5">
                        <span
                          class="font-semibold text-[#032C49] block"
                          :class="{ 'line-through text-gray-400': actividad.completado }"
                        >
                          {{ actividad.nombre_actividad }}
                        </span>
                        <div class="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                          <span v-if="actividad.fecha_culminacion" class="text-emerald-600 font-medium">
                            Culminado el: {{ actividad.fecha_culminacion }}
                          </span>
                          <span v-else>
                            Inicio: {{ actividad.fecha_creacion }}
                          </span>
                          <!--<span
                            v-if="actividad.gerencias_colaboradoras && actividad.gerencias_colaboradoras.length"
                            class="text-gray-400"
                          >
                            • {{ actividad.gerencias_colaboradoras.length }} gerencia(s) colaboradora(s)
                          </span>-->
                        </div>
                      </div>
                    </td>

                    <!-- Prioridad -->
                    <td class="py-3 px-3 text-center">
                      <span
                        class="px-2 py-0.5 rounded-full text-xs font-semibold"
                        :class="{
                          'bg-rose-50 text-rose-700 border border-rose-200': actividad.prioridad === 'ALTA',
                          'bg-amber-50 text-amber-700 border border-amber-200': actividad.prioridad === 'MEDIA',
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': actividad.prioridad === 'BAJA'
                        }"
                      >
                        {{ actividad.prioridad }}
                      </span>
                    </td>

                    <!-- Estado -->
                    <td class="py-3 px-3 text-center">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1"
                        :class="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': actividad.estado === 'CULMINADO',
                          'bg-amber-50 text-amber-700 border border-amber-200': actividad.estado === 'PENDIENTE',
                          'bg-rose-50 text-rose-700 border border-rose-200': actividad.estado === 'ATRASADO'
                        }"
                      >
                        <span
                          class="h-1.5 w-1.5 rounded-full"
                          :class="{
                            'bg-emerald-500': actividad.estado === 'CULMINADO',
                            'bg-amber-500 animate-pulse': actividad.estado === 'PENDIENTE',
                            'bg-rose-500': actividad.estado === 'ATRASADO'
                          }"
                        />
                        {{ actividad.estado }}
                      </span>
                    </td>

                    <!-- Barra de Avance y Porcentaje -->
                    <td class="py-3 px-3">
                      <div class="space-y-1">
                        <div class="flex justify-between text-xs font-mono font-bold">
                          <span class="text-[#81299A]">{{ actividad.porcentaje ?? 0 }}%</span>
                        </div>
                        <div class="w-full bg-[#F4F1FA] h-2 rounded-full overflow-hidden border border-[#BDCEE5]/30">
                          <div
                            class="h-full bg-gradient-to-r from-[#81299A] to-[#322CAB] rounded-full transition-all duration-300"
                            :style="{ width: `${Math.min(Math.max(actividad.porcentaje || 0, 0), 100)}%` }"
                          />
                        </div>
                      </div>
                    </td>

                    <!-- Acciones: Botón Ajustar Porcentaje -->
                    <td class="py-3 px-3 text-center">
                      <button
                        v-if="canManage"
                        @click="openPercentageModal(actividad)"
                        class="p-1.5 rounded-lg text-[#322CAB] hover:bg-[#F4F1FA] transition-colors"
                        title="Ajustar porcentaje percentil"
                      >
                        <AdjustmentsHorizontalIcon class="h-4 w-4" />
                      </button>
                      <span v-else class="text-xs text-gray-400 italic">Lectura</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODO 2: RESUMEN GENERAL DE TODOS LOS APLICATIVOS                           -->
    <!-- ========================================================================= -->
    <div v-else class="space-y-6">

      <!-- Grid de Aplicativos -->
      <div v-if="resumenGeneral.length === 0" class="bg-white p-12 rounded-2xl border border-[#BDCEE5]/40 text-center space-y-3">
        <ComputerDesktopIcon class="h-10 w-10 text-gray-400 mx-auto" />
        <p class="text-sm text-gray-500">No se encontraron aplicativos registrados en el sistema.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="app in resumenGeneral"
          :key="app.aplicativo_id"
          class="bg-white p-6 rounded-2xl shadow-xs border border-[#BDCEE5]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
        >
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-base font-bold text-[#032C49] leading-snug">
                  {{ app.nombre_aplicativo }}
                </h3>
                <span v-if="app.alias" class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F4F1FA] text-[#81299A] border border-[#81299A]/20">
                  {{ app.alias }}
                </span>
              </div>
            </div>

            <!--<div class="space-y-1 text-xs text-gray-500">
              <p>Gerencia: <strong class="text-[#032C49]">{{ app.gerencia }}</strong></p>
              <p>Responsable: <strong class="text-[#032C49]">{{ app.responsable }}</strong></p>
            </div>-->

            <!-- Avance Total -->
            <div class="space-y-1 pt-2">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-gray-500">Progreso</span>
                <span class="text-[#81299A] font-mono font-bold">{{ app.avance_total }}%</span>
              </div>
              <div class="w-full bg-[#F4F1FA] h-2.5 rounded-full overflow-hidden border border-[#BDCEE5]/30">
                <div
                  class="h-full bg-gradient-to-r from-[#81299A] to-[#322CAB] rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min(Math.max(app.avance_total, 0), 100)}%` }"
                />
              </div>
            </div>

            <!-- Métricas resumidas -->
            <div class="grid grid-cols-3 gap-2 pt-1 text-center">
              <div class="p-2 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span class="block text-xs font-bold text-emerald-700">{{ app.metricas.culminadas }}</span>
                <span class="text-[10px] text-gray-500 uppercase">Listas</span>
              </div>
              <div class="p-2 bg-amber-50/50 rounded-xl border border-amber-100">
                <span class="block text-xs font-bold text-amber-700">{{ app.metricas.pendientes }}</span>
                <span class="text-[10px] text-gray-500 uppercase">En curso</span>
              </div>
              <div class="p-2 bg-rose-50/50 rounded-xl border border-rose-100">
                <span class="block text-xs font-bold text-rose-700">{{ app.metricas.atrasadas }}</span>
                <span class="text-[10px] text-gray-500 uppercase">Atraso</span>
              </div>
            </div>
          </div>

          <!-- Botón de Entrada al Ciclo de Vida -->
          <button
            @click="selectAplicativo(app.aplicativo_id)"
            class="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ChartBarSquareIcon class="h-4 w-4" />
            <span>Ver Project</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL DE AJUSTE PERCENTIL DE ACTIVIDAD                                     -->
    <!-- ========================================================================= -->
    <Modal
      :is-open="isPercentageModalOpen"
      title="Ajuste de Avance Percentil"
      @close="closePercentageModal"
    >
      <div v-if="selectedActividad" class="space-y-5">
        <div class="p-3 bg-[#F4F1FA] rounded-xl border border-[#BDCEE5]/40 text-xs">
          <span class="font-bold text-[#032C49] block text-sm mb-0.5">
            {{ selectedActividad.nombre_actividad }}
          </span>
          <span class="text-gray-500">
            Fórmula automática: Al llegar al 100% se marcará como CULMINADO. Valores menores volverán a PENDIENTE.
          </span>
        </div>

        <!-- Slider y Valor -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-[#032C49]">
              Porcentaje Asignado
            </label>
            <div class="flex items-center gap-1 font-mono font-bold text-xl text-[#81299A]">
              <span>{{ targetPercentage }}</span>
              <span>%</span>
            </div>
          </div>

          <input
            v-model.number="targetPercentage"
            type="range"
            min="0"
            max="100"
            step="1"
            class="w-full accent-[#81299A] h-2 bg-[#F4F1FA] rounded-lg cursor-pointer"
          />

          <!-- Botones de Presets Rápidos -->
          <div class="grid grid-cols-5 gap-1.5 pt-1">
            <button
              v-for="p in [0, 25, 50, 75, 100]"
              :key="p"
              type="button"
              @click="setPresetPercentage(p)"
              class="py-1 px-2 text-xs font-semibold rounded-lg border transition-colors"
              :class="targetPercentage === p
                ? 'bg-[#81299A] text-white border-[#81299A]'
                : 'bg-white text-gray-700 border-[#BDCEE5]/60 hover:bg-[#F4F1FA]'"
            >
              {{ p }}%
            </button>
          </div>
        </div>

        <div class="pt-4 border-t border-[#BDCEE5]/40 flex justify-end gap-3">
          <button
            type="button"
            @click="closePercentageModal"
            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleSavePercentage"
            :disabled="savingPercentage"
            class="btn-primary text-xs px-5 py-2 inline-flex items-center gap-2 cursor-pointer"
          >
            <span v-if="savingPercentage" class="inline-block animate-spin">⏳</span>
            <span>{{ savingPercentage ? 'Guardando...' : 'Aplicar Porcentaje' }}</span>
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>
