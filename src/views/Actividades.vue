<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/authStore';
import type { Actividad } from '@/interfaces/Actividad';
import type { Area } from '@/interfaces/Area';
import type { Aplicativo } from '@/interfaces/Aplicativo';
import type { Gerencia } from '@/interfaces/Gerencia';
import Modal from '@/components/layout/Modal.vue';
import ModuleHeader from '@/components/common/ModuleHeader.vue';
import AdvancedDataTable from '@/components/common/datatable/AdvancedDataTable.vue';
import TabbedDataTableContainer from '@/components/common/datatable/TabbedDataTableContainer.vue';
import { useTabbedDataTable, type TabItem } from '@/composables/useTabbedDataTable';
import type { DataTableColumn, DataTableFeatures } from '@/composables/useDataTable';
import Swal from 'sweetalert2';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  CodeBracketIcon,
  CircleStackIcon,
  ServerStackIcon,
  DocumentMagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// ==========================================
// ESTADO REACTIVO PRINCIPAL
// ==========================================
const actividades = ref<Actividad[]>([]);
const areas = ref<Area[]>([]);
const aplicativos = ref<Aplicativo[]>([]);
const gerencias = ref<Gerencia[]>([]);
const loading = ref(false);
const saving = ref(false);

// Control de Permisos
const canManage = computed(() => {
  return authStore.hasPermission('gestionar.actividades') ||
    authStore.hasRole('ADMIN') ||
    authStore.hasRole('administrador');
});

// Modal de Creación / Edición Completa
const isModalOpen = ref(false);
const isEditing = ref(false);
const editingActividadId = ref<number | null>(null);
const formErrors = ref<Record<string, string[]>>({});

const form = ref({
  nombre_actividad: '',
  aplicativo_id: null as number | null,
  area_id: null as number | null,
  prioridad: 'MEDIA' as 'BAJA' | 'MEDIA' | 'ALTA',
  porcentaje: 0,
  estado: 'PENDIENTE' as 'PENDIENTE' | 'ATRASADO' | 'CULMINADO',
  fecha_creacion: new Date().toISOString().slice(0, 10),
  fecha_culminacion: '' as string | null,
  completado: false,
  gerencias_colaboradoras: [] as number[],
  comentarios: '',
});

// Modal Rápido de Porcentaje de Avance
const isQuickPercentageModalOpen = ref(false);
const quickActividad = ref<Actividad | null>(null);
const quickPercentage = ref<number>(0);
const savingPercentage = ref(false);

// Modal de Información Secundaria
const isSecondaryInfoModalOpen = ref(false);
const selectedActividadDetails = ref<Actividad | null>(null);

// ==========================================
// CONFIGURACIÓN DINÁMICA DE PESTAÑAS (TABS)
// ==========================================
const getAreaIcon = (nombre: string) => {
  const n = nombre.toUpperCase();
  if (n.includes('DESARROLLO')) return CodeBracketIcon;
  if (n.includes('BASE DE DATOS') || n.includes('DATOS')) return CircleStackIcon;
  if (n.includes('INFRAESTRUCTURA') || n.includes('REDES')) return ServerStackIcon;
  if (n.includes('LEVANTAMIENTO') || n.includes('INFORMACION') || n.includes('ANALISIS')) {
    return DocumentMagnifyingGlassIcon;
  }
  return ClipboardDocumentListIcon;
};

const tabsConfig = computed<TabItem[]>(() => {
  const items: TabItem[] = [
    {
      key: 'todas',
      label: 'TODOS',
      icon: Squares2X2Icon,
      areaId: null
    }
  ];

  areas.value.forEach(a => {
    items.push({
      key: `area-${a.id}`,
      label: a.nombre_area,
      icon: getAreaIcon(a.nombre_area),
      areaId: a.id
    });
  });

  return items;
});

// Inicialización del Composable de Datatable con Pestañas
const {
  activeTabKey,
  setTab,
  filteredData,
  tabs
} = useTabbedDataTable<Actividad>({
  data: actividades,
  tabs: tabsConfig,
  initialTab: 'todas'
});

// ==========================================
// COLUMNAS Y CARACTERÍSTICAS DEL DATATABLE
// ==========================================
const tableColumns = ref<DataTableColumn[]>([
  { key: 'id', label: 'ID', sortable: true, visible: false, width: 'w-20', align: 'center' },
  { key: 'nombre_actividad', label: 'Actividad', sortable: true, align: 'left' },
  { key: 'aplicativo', label: 'Aplicativo', sortable: true, align: 'left' },
  { key: 'area', label: 'Área', sortable: true, align: 'left' },
  { key: 'gerencias_colaboradoras', label: 'Colaboradores', sortable: false, align: 'left' },
  { key: 'porcentaje', label: 'Avance (%)', sortable: true, width: 'w-40', align: 'left' },
  { key: 'completado', label: 'Completado', sortable: true, width: 'w-28', align: 'center' },
  { key: 'acciones', label: 'Acciones', sortable: false, width: 'w-36', align: 'center' }
]);

const tableFeatures: DataTableFeatures = {
  searchable: true,
  columnVisibility: true,
  exportExcel: true,
  selectable: true,
  pagination: true,
  dateRangeFilter: true,
  pageSizes: [10, 25, 50]
};

// ==========================================
// MÉTODOS DE CONSUMO DE API
// ==========================================
const fetchActividades = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/actividades');
    actividades.value = response.data.data || [];
  } catch (error) {
    console.error('Error al cargar actividades:', error);
  } finally {
    loading.value = false;
  }
};

const fetchAuxiliaryData = async () => {
  try {
    const [resAreas, resApps, resGerencias] = await Promise.allSettled([
      apiClient.get('/areas'),
      apiClient.get('/aplicativos'),
      apiClient.get('/gerencias')
    ]);

    if (resAreas.status === 'fulfilled') {
      areas.value = resAreas.value.data.data || [];
    }
    if (resApps.status === 'fulfilled') {
      aplicativos.value = resApps.value.data.data || [];
    }
    if (resGerencias.status === 'fulfilled') {
      gerencias.value = resGerencias.value.data.data || [];
    }
  } catch (error) {
    console.error('Error al cargar datos auxiliares:', error);
  }
};

// ==========================================
// GESTIÓN DEL MODAL COMPLETO (CREAR / EDITAR)
// ==========================================
const openCreateModal = () => {
  isEditing.value = false;
  editingActividadId.value = null;
  formErrors.value = {};

  // Si hay una pestaña de área específica seleccionada, preseleccionar esa área
  let defaultAreaId: number | null = null;
  const currentTab = tabs.value.find(t => t.key === activeTabKey.value);
  if (currentTab && currentTab.areaId) {
    defaultAreaId = currentTab.areaId;
  }

  form.value = {
    nombre_actividad: '',
    aplicativo_id: null,
    area_id: defaultAreaId,
    prioridad: 'MEDIA',
    porcentaje: 0,
    estado: 'PENDIENTE',
    fecha_creacion: new Date().toISOString().slice(0, 10),
    fecha_culminacion: null,
    completado: false,
    gerencias_colaboradoras: [],
    comentarios: '',
  };
  isModalOpen.value = true;
};

const openEditModal = (actividad: Actividad) => {
  isEditing.value = true;
  editingActividadId.value = actividad.id;
  formErrors.value = {};

  const colabIds = (actividad.gerencias_colaboradoras || []).map((g: any) => g.id || g);

  form.value = {
    nombre_actividad: actividad.nombre_actividad,
    aplicativo_id: actividad.aplicativo_id || actividad.aplicativo?.id || null,
    area_id: actividad.area_id || actividad.area?.id || null,
    prioridad: actividad.prioridad || 'MEDIA',
    porcentaje: actividad.porcentaje || 0,
    estado: actividad.estado || 'PENDIENTE',
    fecha_creacion: actividad.fecha_creacion || '',
    fecha_culminacion: actividad.fecha_culminacion || null,
    completado: !!actividad.completado,
    gerencias_colaboradoras: colabIds,
    comentarios: actividad.comentarios || '',
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  formErrors.value = {};
};

// Sincronización automática de porcentaje con estado completado
watch(() => form.value.porcentaje, (newVal) => {
  const p = Number(newVal) || 0;
  if (p >= 100) {
    form.value.completado = true;
    form.value.estado = 'CULMINADO';
    if (!form.value.fecha_culminacion) {
      form.value.fecha_culminacion = new Date().toISOString().slice(0, 10);
    }
  } else {
    form.value.completado = false;
    if (form.value.estado === 'CULMINADO') {
      form.value.estado = 'PENDIENTE';
    }
  }
});

const handleSubmit = async () => {
  formErrors.value = {};
  saving.value = true;

  try {
    const payload = {
      nombre_actividad: form.value.nombre_actividad.trim(),
      aplicativo_id: form.value.aplicativo_id,
      area_id: form.value.area_id,
      prioridad: form.value.prioridad,
      porcentaje: Number(form.value.porcentaje) || 0,
      estado: form.value.estado,
      fecha_creacion: form.value.fecha_creacion,
      fecha_culminacion: form.value.fecha_culminacion || null,
      completado: form.value.completado,
      gerencias_colaboradoras: form.value.gerencias_colaboradoras,
      comentarios: form.value.comentarios ? form.value.comentarios.trim() : null,
    };

    if (isEditing.value && editingActividadId.value) {
      await apiClient.put(`/actividades/${editingActividadId.value}/update-actividad`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Actividad actualizada',
        text: 'La actividad se actualizó correctamente.',
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      await apiClient.post('/actividades/create-actividad', payload);
      Swal.fire({
        icon: 'success',
        title: 'Actividad creada',
        text: 'La nueva actividad se registró exitosamente.',
        timer: 1500,
        showConfirmButton: false,
      });
    }

    closeModal();
    await fetchActividades();
  } catch (error: any) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      formErrors.value = error.response.data.errors;
    }
    console.error('Error al procesar la actividad:', error);
  } finally {
    saving.value = false;
  }
};

// ==========================================
// MODAL RÁPIDO PARA AJUSTAR PORCENTAJE
// ==========================================
const openQuickPercentage = (actividad: Actividad) => {
  quickActividad.value = actividad;
  quickPercentage.value = actividad.porcentaje || 0;
  isQuickPercentageModalOpen.value = true;
};

const closeQuickPercentageModal = () => {
  isQuickPercentageModalOpen.value = false;
  quickActividad.value = null;
};

const handleSaveQuickPercentage = async () => {
  if (!quickActividad.value) return;
  savingPercentage.value = true;

  try {
    const response = await apiClient.put(`/actividades/${quickActividad.value.id}/porcentaje`, {
      porcentaje: Number(quickPercentage.value) || 0
    });

    Swal.fire({
      icon: 'success',
      title: 'Avance actualizado',
      text: response.data.message || 'El porcentaje ha sido ajustado exitosamente.',
      timer: 1500,
      showConfirmButton: false
    });

    closeQuickPercentageModal();
    await fetchActividades();
  } catch (error) {
    console.error('Error al actualizar porcentaje:', error);
  } finally {
    savingPercentage.value = false;
  }
};

// ==========================================
// MODAL DE INFORMACIÓN SECUNDARIA
// ==========================================
const openSecondaryInfoModal = (actividad: Actividad) => {
  selectedActividadDetails.value = actividad;
  isSecondaryInfoModalOpen.value = true;
};

const closeSecondaryInfoModal = () => {
  isSecondaryInfoModalOpen.value = false;
  selectedActividadDetails.value = null;
};

// ==========================================
// CAMBIO RÁPIDO DE ESTADO COMPLETADO
// ==========================================
const handleToggleCompletado = async (actividad: Actividad) => {
  if (!canManage.value) return;
  const targetCompleted = !actividad.completado;
  const targetPercentage = targetCompleted ? 100 : 0;

  try {
    const response = await apiClient.put(`/actividades/${actividad.id}/porcentaje`, {
      porcentaje: targetPercentage
    });

    actividad.completado = targetCompleted;
    actividad.porcentaje = targetPercentage;
    actividad.estado = targetCompleted ? 'CULMINADO' : 'PENDIENTE';
    if (targetCompleted) {
      actividad.fecha_culminacion = new Date().toISOString().slice(0, 10);
    } else {
      actividad.fecha_culminacion = undefined;
    }

    Swal.fire({
      icon: 'success',
      title: targetCompleted ? '¡Actividad Completada!' : 'Actividad Reabierta',
      text: response.data.message || (targetCompleted ? 'La actividad se marcó al 100% y estado culminado.' : 'La actividad se reabrió al 0%.'),
      timer: 1500,
      showConfirmButton: false
    });

    await fetchActividades();
  } catch (error) {
    console.error('Error al actualizar el estado de completado:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo actualizar el estado de completado de la actividad.'
    });
  }
};

// ==========================================
// ELIMINACIÓN DE ACTIVIDAD
// ==========================================
const handleDelete = async (actividad: Actividad) => {
  const result = await Swal.fire({
    title: '¿Eliminar actividad?',
    text: `¿Estás seguro?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#032C49',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await apiClient.delete(`/actividades/${actividad.id}`);
      Swal.fire({
        icon: 'success',
        title: 'Actividad eliminada',
        text: 'Se eliminó correctamente',
        timer: 1500,
        showConfirmButton: false
      });
      await fetchActividades();
    } catch (error) {
      console.error('Error al eliminar la actividad:', error);
    }
  }
};

// ==========================================
// HELPERS VISUALES
// ==========================================
const getPriorityBadgeClass = (prioridad: string) => {
  switch (prioridad) {
    case 'ALTA':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'MEDIA':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'BAJA':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusBadgeClass = (estado: string) => {
  switch (estado) {
    case 'CULMINADO':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ATRASADO':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'PENDIENTE':
    default:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
};

const getProgressBarColor = (porcentaje: number) => {
  if (porcentaje >= 100) return 'bg-emerald-500';
  if (porcentaje >= 60) return 'bg-[#81299A]';
  if (porcentaje >= 30) return 'bg-[#322CAB]';
  return 'bg-amber-500';
};

onMounted(async () => {
  await Promise.all([
    fetchActividades(),
    fetchAuxiliaryData()
  ]);
});
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Encabezado del Módulo con Acción Principal -->
    <ModuleHeader
      title="Gestión de Actividades"
      subtitle="Planificación, seguimiento clasificado por áreas y control de avance de actividades por aplicativo."
      :icon="ClipboardDocumentListIcon"
    >
      <template #actions>
        <button
          v-if="canManage"
          @click="openCreateModal"
          class="btn-primary inline-flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <PlusIcon class="h-5 w-5" />
          <span>Nueva Actividad</span>
        </button>
      </template>
    </ModuleHeader>

    <!-- Contenedor DataTable con Pestañas por Área Técnica -->
    <TabbedDataTableContainer
      :tabs="tabs"
      :active-tab-key="activeTabKey"
      :dark-inactive-tabs="true"
      @change-tab="setTab"
    >
      <AdvancedDataTable
        class="rounded-t-none"
        :data="filteredData"
        :columns="tableColumns"
        :features="tableFeatures"
        :loading="loading"
        date-field="fecha_creacion"
        export-file-name="actividades_por_area"
        empty-text="No se encontraron actividades registradas en esta área."
      >
        <!-- ID Monospace -->
        <template #cell-id="{ value }">
          <span class="font-mono text-xs text-gray-500 font-semibold">#{{ value }}</span>
        </template>

        <!-- Nombre de la Actividad -->
        <template #cell-nombre_actividad="{ row }">
          <div class="space-y-0.5">
            <span class="font-semibold text-[#032C49] block text-sm">{{ row.nombre_actividad }}</span>
          </div>
        </template>

        <!-- Aplicativo Asociado -->
        <template #cell-aplicativo="{ row }">
          <span
            v-if="row.aplicativo"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F4F1FA] text-[#032C49] border border-[#BDCEE5]/60 shadow-2xs font-mono"
          >
            {{ row.aplicativo.nombre_aplicativo }}
          </span>
          <span v-else class="text-xs text-gray-400 italic">No asignado</span>
        </template>

        <!-- Área Técnica -->
        <template #cell-area="{ row }">
          <span
            v-if="row.area"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-[#81299A] border border-[#81299A]/30 shadow-2xs"
          >
            <component :is="getAreaIcon(row.area.nombre_area)" class="h-3.5 w-3.5 text-[#81299A]" />
            <span>{{ row.area.nombre_area }}</span>
          </span>
          <span v-else class="text-xs text-gray-400 italic">Sin área</span>
        </template>

        <!-- Gerencias Colaboradoras -->
        <template #cell-gerencias_colaboradoras="{ row }">
          <div v-if="(row.gerencias_colaboradoras?.length || row.gerenciasColaboradoras?.length)" class="flex flex-wrap gap-1 items-center">
            <span
              v-for="gerencia in (row.gerencias_colaboradoras || row.gerenciasColaboradoras)"
              :key="gerencia.id"
              class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#BDCEE5]/25 text-[#032C49] border border-[#BDCEE5]/60 shadow-2xs"
              :title="gerencia.nombre_gerencia"
            >
              {{ gerencia.sigla || gerencia.nombre_gerencia }}
            </span>
          </div>
          <span v-else class="text-xs text-gray-400 italic">Ninguna</span>
        </template>

        <!-- Porcentaje de Avance con Barra Visual y Botón de Ajuste Rápido -->
        <template #cell-porcentaje="{ row }">
          <div class="flex items-center gap-2 min-w-[130px]">
            <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
              <div
                class="h-full transition-all duration-500 rounded-full"
                :class="getProgressBarColor(row.porcentaje || 0)"
                :style="{ width: `${Math.min(100, Math.max(0, row.porcentaje || 0))}%` }"
              />
            </div>
            <span class="text-xs font-mono font-bold text-[#032C49] min-w-[34px] text-right">
              {{ row.porcentaje || 0 }}%
            </span>
            <button
              v-if="canManage"
              @click="openQuickPercentage(row)"
              class="p-1 text-[#81299A] hover:bg-[#F4F1FA] rounded-md transition-colors cursor-pointer"
              title="Ajustar porcentaje rápido"
            >
              <ArrowTrendingUpIcon class="h-3.5 w-3.5" />
            </button>
          </div>
        </template>

        <!-- Checkbox Completado -->
        <template #cell-completado="{ row }">
          <div class="flex items-center justify-center">
            <input
              type="checkbox"
              :checked="!!row.completado"
              :disabled="!canManage"
              @change="handleToggleCompletado(row)"
              class="h-4 w-4 rounded border-[#BDCEE5] text-[#81299A] focus:ring-[#81299A] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              :title="row.completado ? 'Completada (100%)' : 'Marcar como completada'"
            />
          </div>
        </template>

        <!-- Prioridad -->
        <template #cell-prioridad="{ value }">
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wider inline-block text-center"
            :class="getPriorityBadgeClass(value)"
          >
            {{ value }}
          </span>
        </template>

        <!-- Estado -->
        <template #cell-estado="{ value }">
          <span
            class="px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1"
            :class="getStatusBadgeClass(value)"
          >
            <CheckCircleIcon v-if="value === 'CULMINADO'" class="h-3 w-3" />
            <ClockIcon v-else-if="value === 'PENDIENTE'" class="h-3 w-3" />
            <ExclamationTriangleIcon v-else class="h-3 w-3" />
            <span>{{ value }}</span>
          </span>
        </template>

        <!-- Fechas -->
        <template #cell-fecha_creacion="{ value }">
          <span class="text-xs text-gray-600 font-mono">{{ value || 'N/A' }}</span>
        </template>

        <template #cell-fecha_culminacion="{ value }">
          <span class="text-xs font-mono" :class="value ? 'text-gray-600' : 'text-gray-400 italic'">
            {{ value || 'Pendiente' }}
          </span>
        </template>

        <!-- Acciones -->
        <template #cell-acciones="{ row }">
          <div class="inline-flex items-center gap-1.5 justify-center">
            <!-- Botón Información Secundaria -->
            <button
              @click="openSecondaryInfoModal(row)"
              class="p-2 text-[#032C49] hover:bg-[#BDCEE5]/30 rounded-xl transition-colors cursor-pointer"
              title="Visualizar información secundaria"
            >
              <EyeIcon class="h-4 w-4" />
            </button>

            <!-- Botón Editar -->
            <button
              v-if="canManage"
              @click="openEditModal(row)"
              class="p-2 text-[#322CAB] hover:bg-[#F4F1FA] rounded-xl transition-colors cursor-pointer"
              title="Editar actividad"
            >
              <PencilSquareIcon class="h-4 w-4" />
            </button>

            <!-- Botón Eliminar -->
            <button
              v-if="canManage"
              @click="handleDelete(row)"
              class="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Eliminar actividad"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </template>
      </AdvancedDataTable>
    </TabbedDataTableContainer>

    <!-- Modal Principal: Creación y Edición de Actividad -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? 'Editar Actividad' : 'Nueva Actividad'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Nombre de la Actividad -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Nombre de la Actividad
          </label>
          <input
            v-model="form.nombre_actividad"
            type="text"
            required
            maxlength="150"
            placeholder="ej. Crear modelo de datos relacional para usuarios"
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
            :class="formErrors.nombre_actividad ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
          />
          <p v-if="formErrors.nombre_actividad" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.nombre_actividad[0] }}
          </p>
        </div>

        <!-- Aplicativo y Área en Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Aplicativo
            </label>
            <select
              v-model="form.aplicativo_id"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.aplicativo_id ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            >
              <option :value="null" disabled>Seleccionar Aplicativo...</option>
              <option v-for="app in aplicativos" :key="app.id" :value="app.id">
                {{ app.nombre_aplicativo }} ({{ app.alias || `#${app.id}` }})
              </option>
            </select>
            <p v-if="formErrors.aplicativo_id" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.aplicativo_id[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Área
            </label>
            <select
              v-model="form.area_id"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.area_id ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            >
              <option :value="null" disabled>Seleccionar Área...</option>
              <option v-for="area in areas" :key="area.id" :value="area.id">
                {{ area.nombre_area }}
              </option>
            </select>
            <p v-if="formErrors.area_id" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.area_id[0] }}
            </p>
          </div>
        </div>

        <!-- Prioridad y Estado -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Prioridad
            </label>
            <select
              v-model="form.prioridad"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.prioridad ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            >
              <option value="BAJA">BAJA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="ALTA">ALTA</option>
            </select>
            <p v-if="formErrors.prioridad" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.prioridad[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Estatus
            </label>
            <select
              v-model="form.estado"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.estado ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="ATRASADO">ATRASADO</option>
              <option value="CULMINADO">CULMINADO</option>
            </select>
            <p v-if="formErrors.estado" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.estado[0] }}
            </p>
          </div>
        </div>

        <!-- Control de Porcentaje con Slider e Input Numérico -->
        <div class="bg-[#F4F1FA]/60 p-4 rounded-xl border border-[#BDCEE5]/40 space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-[#032C49]">
              Porcentaje de Avance
            </label>
            <span class="text-sm font-bold font-mono text-[#81299A]">
              {{ form.porcentaje }}%
            </span>
          </div>

          <div class="flex items-center gap-3">
            <input
              v-model.number="form.porcentaje"
              type="range"
              min="0"
              max="100"
              step="5"
              class="w-full accent-[#81299A] cursor-pointer"
            />
            <input
              v-model.number="form.porcentaje"
              type="number"
              min="0"
              max="100"
              class="w-20 px-2 py-1 border border-[#BDCEE5] rounded-lg text-center text-sm font-mono font-bold text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            />
          </div>
          <p v-if="formErrors.porcentaje" class="text-xs text-rose-600 font-medium">
            {{ formErrors.porcentaje[0] }}
          </p>
        </div>

        <!-- Fechas en Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Fecha de Creación
            </label>
            <input
              v-model="form.fecha_creacion"
              type="date"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.fecha_creacion ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.fecha_creacion" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.fecha_creacion[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Fecha de Culminación
            </label>
            <input
              v-model="form.fecha_culminacion"
              type="date"
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.fecha_culminacion ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.fecha_culminacion" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.fecha_culminacion[0] }}
            </p>
          </div>
        </div>

        <!-- Gerencias Colaboradoras (Selección Múltiple) -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Gerencias Colaboradoras
          </label>
          <div class="max-h-36 overflow-y-auto p-2 bg-[#F4F1FA]/50 rounded-xl border border-[#BDCEE5]/40 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <label
              v-for="g in gerencias"
              :key="g.id"
              class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white text-xs text-[#032C49] cursor-pointer"
            >
              <input
                type="checkbox"
                :value="g.id"
                v-model="form.gerencias_colaboradoras"
                class="h-4 w-4 rounded border-[#BDCEE5] text-[#81299A] focus:ring-[#81299A] cursor-pointer"
              />
              <span class="truncate">{{ g.nombre_gerencia }} ({{ g.sigla }})</span>
            </label>
          </div>
        </div>

        <!-- Comentarios / Observaciones -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Comentarios / Observaciones
          </label>
          <textarea
            v-model="form.comentarios"
            rows="2"
            placeholder="Detalles sobre el alcance, entregables o dependencias..."
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
            :class="formErrors.comentarios ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
          />
          <p v-if="formErrors.comentarios" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.comentarios[0] }}
          </p>
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#BDCEE5]/40">
          <button
            type="submit"
            :disabled="saving"
            class="btn-primary text-sm cursor-pointer disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : ' Guardar') }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal Secundario: Ajuste Rápido de Porcentaje de Avance -->
    <Modal
      :is-open="isQuickPercentageModalOpen"
      :title="`Actualizar Avance: ${quickActividad?.nombre_actividad || ''}`"
      @close="closeQuickPercentageModal"
    >
      <div class="space-y-4">
        <p class="text-xs text-gray-500">
          Ajusta el porcentaje actual de avance. Al llegar al 100%, la actividad se marcará automáticamente como culminada y se actualizará el promedio del aplicativo.
        </p>

        <div class="bg-[#F4F1FA] p-5 rounded-2xl border border-[#BDCEE5]/40 space-y-4 text-center">
          <div class="text-3xl font-extrabold font-mono text-[#81299A]">
            {{ quickPercentage }}%
          </div>

          <input
            v-model.number="quickPercentage"
            type="range"
            min="0"
            max="100"
            step="5"
            class="w-full accent-[#81299A] cursor-pointer"
          />

          <div class="flex justify-between text-xs text-gray-400 font-mono px-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#BDCEE5]/40">
          <button
            type="button"
            @click="handleSaveQuickPercentage"
            :disabled="savingPercentage"
            class="btn-primary text-sm cursor-pointer disabled:opacity-50"
          >
            {{ savingPercentage ? 'Guardando...' : 'Confirmar Avance' }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- Modal Secundario: Información Secundaria de la Actividad -->
    <Modal
      :is-open="isSecondaryInfoModalOpen"
      :title="`Detalles: ${selectedActividadDetails?.nombre_actividad || 'Actividad'}`"
      @close="closeSecondaryInfoModal"
    >
      <div v-if="selectedActividadDetails" class="space-y-4 text-sm text-[#032C49]">
        <!-- Grid de Información Secundaria: Prioridad, Estado, Fechas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <!-- Prioridad -->
          <div class="p-3 bg-white border border-[#BDCEE5]/50 rounded-xl space-y-1">
            <span class="font-bold text-gray-500 uppercase tracking-wider block">Prioridad</span>
            <div>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wider inline-block text-center"
                :class="getPriorityBadgeClass(selectedActividadDetails.prioridad)"
              >
                {{ selectedActividadDetails.prioridad }}
              </span>
            </div>
          </div>

          <!-- Estado -->
          <div class="p-3 bg-white border border-[#BDCEE5]/50 rounded-xl space-y-1">
            <span class="font-bold text-gray-500 uppercase tracking-wider block">Estado</span>
            <div>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1"
                :class="getStatusBadgeClass(selectedActividadDetails.estado)"
              >
                <CheckCircleIcon v-if="selectedActividadDetails.estado === 'CULMINADO'" class="h-3.5 w-3.5" />
                <ClockIcon v-else-if="selectedActividadDetails.estado === 'PENDIENTE'" class="h-3.5 w-3.5" />
                <ExclamationTriangleIcon v-else class="h-3.5 w-3.5" />
                <span>{{ selectedActividadDetails.estado }}</span>
              </span>
            </div>
          </div>

          <!-- Fecha de Creación -->
          <div class="p-3 bg-white border border-[#BDCEE5]/50 rounded-xl space-y-1">
            <span class="font-bold text-gray-500 uppercase tracking-wider block">Fecha de Creación</span>
            <div class="flex items-center gap-1.5 font-mono text-gray-700">
              <ClockIcon class="h-4 w-4 text-[#032C49]" />
              <span>{{ selectedActividadDetails.fecha_creacion || 'Sin fecha' }}</span>
            </div>
          </div>

          <!-- Fecha de Culminación -->
          <div class="p-3 bg-white border border-[#BDCEE5]/50 rounded-xl space-y-1">
            <span class="font-bold text-gray-500 uppercase tracking-wider block">Fecha de Culminación</span>
            <div class="flex items-center gap-1.5 font-mono" :class="selectedActividadDetails.fecha_culminacion ? 'text-gray-700' : 'text-gray-400 italic'">
              <CheckCircleIcon class="h-4 w-4" :class="selectedActividadDetails.fecha_culminacion ? 'text-emerald-600' : 'text-gray-300'" />
              <span>{{ selectedActividadDetails.fecha_culminacion || 'Sin fecha' }}</span>
            </div>
          </div>
        </div>

        <!-- Comentarios u Observaciones Adicionales -->
        <div class="p-3.5 bg-white rounded-xl border border-[#BDCEE5]/50 space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-gray-500 block">Comentarios / Observaciones</span>
          <p class="text-xs text-gray-700 leading-relaxed italic bg-[#F4F1FA]/50 p-2.5 rounded-lg border border-[#BDCEE5]/30">
            {{ selectedActividadDetails.comentarios || 'Ninguno' }}
          </p>
        </div>
      </div>
    </Modal>
  </div>
</template>
