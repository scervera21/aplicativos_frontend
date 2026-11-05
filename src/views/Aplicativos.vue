<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/authStore';
import type { Aplicativo, DetalleAplicativo } from '@/interfaces/Aplicativo';
import type { Gerencia } from '@/interfaces/Gerencia';
import Modal from '@/components/layout/Modal.vue';
import ModuleHeader from '@/components/common/ModuleHeader.vue';
import AdvancedDataTable from '@/components/common/datatable/AdvancedDataTable.vue';
import type { DataTableColumn, DataTableFeatures } from '@/composables/useDataTable';
import Swal from 'sweetalert2';
import {
  ComputerDesktopIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// ==========================================
// ESTADO REACTIVO
// ==========================================
const aplicativos = ref<Aplicativo[]>([]);
const gerencias = ref<Gerencia[]>([]);
const loading = ref(false);
const saving = ref(false);

// Modal Principal (Crear / Editar Aplicativo con todos los campos)
const isModalOpen = ref(false);
const isEditing = ref(false);
const editingAplicativoId = ref<number | null>(null);

// Modal Secundario (Ficha Técnica / Información Técnica)
const isDetailsModalOpen = ref(false);
const selectedDetails = ref<DetalleAplicativo | null>(null);
const selectedAppName = ref('');
const loadingDetails = ref(false);

// Formulario reactivo que contiene TODOS los campos (principales y técnicos)
const form = ref({
  // Información Principal
  nombre_aplicativo: '',
  alias: '',
  responsable: '',
  gerencia_id: null as number | null,
  fecha_inicio: '',
  fecha_fin: '',
  // Información Técnica
  descripcion: '',
  estatus: 'DESARROLLO',
  pap: false,
  lenguajes_frontend: '',
  lenguajes_backend: '',
  bases_datos: '',
  observaciones: ''
});

const canManage = computed(() => authStore.hasPermission('gestionar.aplicativos'));

// Configuración de Columnas del DataTable: Exclusivamente información principal
const tableColumns = ref<DataTableColumn[]>([
  { key: 'id', label: 'ID', sortable: true, width: 'w-20' },
  { key: 'nombre_aplicativo', label: 'Nombre Aplicativo', sortable: true },
  { key: 'alias', label: 'Alias', sortable: true, width: 'w-32' },
  { key: 'responsable', label: 'Responsable', sortable: true },
  { key: 'gerencia_responsable', label: 'Gerencia', sortable: true },
  { key: 'avance_total', label: 'Avance', sortable: true, width: 'w-36' },
  { key: 'fecha_inicio', label: 'Inicio', sortable: true, width: 'w-28' },
  { key: 'fecha_fin', label: 'Fin Estimado', sortable: true, width: 'w-32' },
  { key: 'acciones', label: 'Acciones', sortable: false, width: 'w-36' }
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
const fetchAplicativos = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/aplicativos');
    aplicativos.value = response.data.data || [];
  } catch (error) {
    console.error('Error al cargar aplicativos:', error);
  } finally {
    loading.value = false;
  }
};

const fetchGerencias = async () => {
  try {
    const response = await apiClient.get('/gerencias');
    gerencias.value = response.data.data || [];
  } catch (error) {
    console.error('Error al cargar gerencias:', error);
  }
};

const viewDetails = async (app: Aplicativo) => {
  selectedAppName.value = app.nombre_aplicativo;
  isDetailsModalOpen.value = true;
  loadingDetails.value = true;
  selectedDetails.value = null;

  try {
    const res = await apiClient.get(`/aplicativos/${app.id}/detalles`);
    selectedDetails.value = res.data.data;
  } catch (error) {
    console.error('Error al cargar detalles técnicos del aplicativo:', error);
  } finally {
    loadingDetails.value = false;
  }
};

// ==========================================
// GESTIÓN DEL FORMULARIO COMPLETO
// ==========================================
const openCreateModal = () => {
  isEditing.value = false;
  editingAplicativoId.value = null;
  form.value = {
    nombre_aplicativo: '',
    alias: '',
    responsable: '',
    gerencia_id: gerencias.value[0]?.id || null,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_fin: '',
    descripcion: '',
    estatus: 'DESARROLLO',
    pap: false,
    lenguajes_frontend: '',
    lenguajes_backend: '',
    bases_datos: '',
    observaciones: ''
  };
  isModalOpen.value = true;
};

const openEditModal = async (app: Aplicativo) => {
  isEditing.value = true;
  editingAplicativoId.value = app.id;

  form.value = {
    nombre_aplicativo: app.nombre_aplicativo,
    alias: app.alias,
    responsable: app.responsable,
    gerencia_id: app.gerencia_id || null,
    fecha_inicio: app.fecha_inicio || '',
    fecha_fin: app.fecha_fin || '',
    descripcion: '',
    estatus: 'DESARROLLO',
    pap: false,
    lenguajes_frontend: '',
    lenguajes_backend: '',
    bases_datos: '',
    observaciones: ''
  };

  try {
    const res = await apiClient.get(`/aplicativos/${app.id}/detalles`);
    const d = res.data.data;
    if (d) {
      form.value.descripcion = d.descripcion || '';
      form.value.estatus = d.estatus || 'DESARROLLO';
      form.value.pap = !!d.pap;
      form.value.lenguajes_frontend = d.lenguajes_frontend || '';
      form.value.lenguajes_backend = d.lenguajes_backend || '';
      form.value.bases_datos = d.bases_datos || '';
      form.value.observaciones = d.observaciones || '';
    }
  } catch (err) {
    console.warn('No se pudieron precargar los detalles técnicos:', err);
  }

  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  saving.value = true;
  try {
    const payload = { ...form.value };

    if (isEditing.value && editingAplicativoId.value) {
      await apiClient.put(`/aplicativos/${editingAplicativoId.value}/update-aplicativo`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Aplicativo actualizado',
        text: 'La información principal y técnica se actualizó correctamente.',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      await apiClient.post('/aplicativos/create-aplicativo', payload);
      Swal.fire({
        icon: 'success',
        title: 'Aplicativo registrado',
        text: 'El nuevo sistema se ha registrado en el catálogo con todos sus datos.',
        timer: 1500,
        showConfirmButton: false
      });
    }

    closeModal();
    await fetchAplicativos();
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Error al procesar el aplicativo.';
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: msg,
      confirmButtonColor: '#032C49'
    });
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (app: Aplicativo) => {
  const result = await Swal.fire({
    title: '¿Eliminar aplicativo?',
    text: `¿Estás seguro de eliminar "${app.nombre_aplicativo}"? Esta acción borrará todas sus actividades asociadas.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#032C49',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await apiClient.delete(`/aplicativos/${app.id}`);
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El aplicativo ha sido eliminado del catálogo.',
        timer: 1500,
        showConfirmButton: false
      });
      await fetchAplicativos();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: error.response?.data?.message || 'No se pudo eliminar el aplicativo.',
        confirmButtonColor: '#032C49'
      });
    }
  }
};

onMounted(async () => {
  await Promise.all([fetchAplicativos(), fetchGerencias()]);
});
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Encabezado del Módulo -->
    <ModuleHeader
      title="Gestión de Aplicativos"
      subtitle="Catálogo oficial de sistemas, aplicaciones y estado de desarrollo institucional."
      :icon="ComputerDesktopIcon"
    >
      <template #actions>
        <button
          @click="fetchAplicativos"
          :disabled="loading"
          class="p-2.5 rounded-xl border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors cursor-pointer"
          title="Actualizar catálogo"
        >
          <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': loading }" />
        </button>

        <button
          v-if="canManage"
          @click="openCreateModal"
          class="btn-primary inline-flex items-center gap-2 cursor-pointer text-sm shadow-xs"
        >
          <PlusIcon class="h-5 w-5" />
          <span>Nuevo Aplicativo</span>
        </button>
      </template>
    </ModuleHeader>

    <!-- DataTable: Únicamente Información Principal en las columnas -->
    <AdvancedDataTable
      :data="aplicativos"
      :columns="tableColumns"
      :features="tableFeatures"
      :loading="loading"
      date-field="fecha_inicio"
      export-file-name="catalogo_aplicativos"
      empty-text="No hay aplicativos registrados en el sistema."
    >
      <!-- ID Monospace -->
      <template #cell-id="{ value }">
        <span class="font-mono text-xs text-gray-500">#{{ value }}</span>
      </template>

      <!-- Nombre del Aplicativo limpio (sin botón flotante) -->
      <template #cell-nombre_aplicativo="{ value }">
        <span class="font-bold text-[#032C49]">{{ value }}</span>
      </template>

      <!-- Alias Badge -->
      <template #cell-alias="{ value }">
        <span class="px-2 py-0.5 rounded text-xs font-mono font-medium bg-gray-100 text-[#032C49] border border-gray-200">
          {{ value || '—' }}
        </span>
      </template>

      <!-- Responsable -->
      <template #cell-responsable="{ value }">
        <span class="text-xs text-gray-700 font-medium">{{ value || 'Sin asignar' }}</span>
      </template>

      <!-- Gerencia Responsable -->
      <template #cell-gerencia_responsable="{ value }">
        <span class="text-xs text-gray-700 font-medium">
          {{ value || 'No asignada' }}
        </span>
      </template>

      <!-- Avance Total Porcentual con Barra -->
      <template #cell-avance_total="{ value }">
        <div class="space-y-1">
          <div class="flex justify-between text-xs font-mono font-bold">
            <span class="text-[#81299A]">{{ value ?? 0 }}%</span>
          </div>
          <div class="w-full bg-[#F4F1FA] h-2 rounded-full overflow-hidden border border-[#BDCEE5]/40">
            <div
              class="h-full bg-gradient-to-r from-[#81299A] to-[#322CAB] rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(Math.max(value || 0, 0), 100)}%` }"
            />
          </div>
        </div>
      </template>

      <!-- Fechas con formato limpio -->
      <template #cell-fecha_inicio="{ value }">
        <span class="font-mono text-xs text-gray-600">{{ value || '—' }}</span>
      </template>

      <template #cell-fecha_fin="{ value }">
        <span class="font-mono text-xs text-gray-600">{{ value || '—' }}</span>
      </template>

      <!-- Columna Acciones: Botón de Ficha Técnica agrupado aquí -->
      <template #cell-acciones="{ row }">
        <div class="inline-flex items-center gap-1 justify-center">
          <!-- Botón Ficha Técnica -->
          <button
            @click="viewDetails(row)"
            class="p-2 text-[#81299A] hover:bg-[#F4F1FA] rounded-xl transition-colors cursor-pointer"
            title="Visualizar ficha técnica"
          >
            <DocumentTextIcon class="h-4 w-4" />
          </button>

          <!-- Botón Editar -->
          <button
            v-if="canManage"
            @click="openEditModal(row)"
            class="p-2 text-[#322CAB] hover:bg-[#F4F1FA] rounded-xl transition-colors cursor-pointer"
            title="Editar aplicativo"
          >
            <PencilSquareIcon class="h-4 w-4" />
          </button>

          <!-- Botón Eliminar -->
          <button
            v-if="canManage"
            @click="handleDelete(row)"
            class="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Eliminar aplicativo"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
      </template>
    </AdvancedDataTable>

    <!-- Modal de Creación / Edición: Incluye TODOS los campos -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? 'Editar Aplicativo' : 'Registrar Nuevo Aplicativo'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- SECCIÓN 1: Información Principal -->
        <div class="border-b border-[#BDCEE5]/40 pb-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#81299A]">
            Información Principal
          </h4>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Nombre del Aplicativo
            </label>
            <input
              v-model="form.nombre_aplicativo"
              type="text"
              required
              maxlength="80"
              placeholder="ej. Sistema de Control GGSI"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Alias / Siglas
            </label>
            <input
              v-model="form.alias"
              type="text"
              maxlength="8"
              placeholder="ej. SC-GGSI"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Responsable Técnico
            </label>
            <input
              v-model="form.responsable"
              type="text"
              maxlength="50"
              placeholder="Nombre del encargado"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Gerencia Asignada
            </label>
            <select
              v-model="form.gerencia_id"
              :required="!isEditing"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            >
              <option :value="null">Seleccionar gerencia...</option>
              <option v-for="g in gerencias" :key="g.id" :value="g.id">
                {{ g.nombre_gerencia }} ({{ g.sigla }})
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Fecha de Inicio
            </label>
            <input
              v-model="form.fecha_inicio"
              type="date"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Fecha Fin Estimada
            </label>
            <input
              v-model="form.fecha_fin"
              type="date"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            />
          </div>
        </div>

        <!-- SECCIÓN 2: Información Técnica (Ficha Técnica en el formulario) -->
        <div class="border-b border-[#BDCEE5]/40 pb-2 pt-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#81299A]">
            Información Técnica / Ficha Técnica
          </h4>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Estatus del Proyecto
            </label>
            <select
              v-model="form.estatus"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            >
              <option value="DESARROLLO">DESARROLLO</option>
              <option value="EN PRODUCCIÓN">EN PRODUCCIÓN</option>
              <option value="MANTENIMIENTO">MANTENIMIENTO</option>
              <option value="PAUSADO">PAUSADO</option>
            </select>
          </div>

          <div class="flex items-center gap-2 pt-6">
            <input
              id="pap_check"
              v-model="form.pap"
              type="checkbox"
              class="h-4 w-4 rounded border-[#BDCEE5] text-[#81299A] focus:ring-[#81299A] cursor-pointer"
            />
            <label for="pap_check" class="text-xs font-bold uppercase tracking-wider text-[#032C49] cursor-pointer">
              Pase a Producción (PAP) Habilitado
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Frontend
            </label>
            <input
              v-model="form.lenguajes_frontend"
              type="text"
              maxlength="50"
              placeholder="ej. Vue 3, Tailwind"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Backend
            </label>
            <input
              v-model="form.lenguajes_backend"
              type="text"
              maxlength="50"
              placeholder="ej. Laravel 10, PHP"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Bases de Datos
            </label>
            <input
              v-model="form.bases_datos"
              type="text"
              maxlength="50"
              placeholder="ej. PostgreSQL 16"
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Descripción Funcional
          </label>
          <textarea
            v-model="form.descripcion"
            rows="2"
            maxlength="200"
            placeholder="Alcance y objetivo principal del aplicativo..."
            class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Observaciones Técnicas
          </label>
          <textarea
            v-model="form.observaciones"
            rows="2"
            placeholder="Requerimientos especiales, dependencias o notas técnicas..."
            class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
          />
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#BDCEE5]/40">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm rounded-lg border border-[#BDCEE5] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="btn-primary text-sm cursor-pointer disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar Aplicativo' : 'Crear Aplicativo') }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Modal de Ficha Técnica: Exclusivamente Información Técnica -->
    <Modal
      :is-open="isDetailsModalOpen"
      :title="`Ficha Técnica: ${selectedAppName}`"
      @close="isDetailsModalOpen = false"
    >
      <div v-if="loadingDetails" class="p-8 text-center text-gray-500">
        <div class="inline-block animate-spin text-2xl text-[#81299A]">⏳</div>
        <p class="text-xs mt-2">Consultando información técnica...</p>
      </div>

      <div v-else-if="selectedDetails" class="space-y-4 text-sm text-[#032C49]">
        <!-- Descripción -->
        <div class="p-3.5 bg-[#F4F1FA]/60 rounded-xl border border-[#BDCEE5]/40 space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Descripción Funcional</span>
          <p class="text-xs text-gray-700 leading-relaxed">{{ selectedDetails.descripcion || 'Sin descripción técnica registrada.' }}</p>
        </div>

        <!-- Ficha de Componentes Tecnológicos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 bg-white border border-[#BDCEE5]/50 rounded-xl">
            <span class="font-bold text-gray-500 block mb-1">Lenguajes Frontend</span>
            <span class="font-mono text-[#032C49] font-medium">{{ selectedDetails.lenguajes_frontend || 'N/A' }}</span>
          </div>

          <div class="p-3 bg-white border border-[#BDCEE5]/50 rounded-xl">
            <span class="font-bold text-gray-500 block mb-1">Lenguajes Backend</span>
            <span class="font-mono text-[#032C49] font-medium">{{ selectedDetails.lenguajes_backend || 'N/A' }}</span>
          </div>

          <div class="p-3 bg-white border border-[#BDCEE5]/50 rounded-xl">
            <span class="font-bold text-gray-500 block mb-1">Bases de Datos</span>
            <span class="font-mono text-[#032C49] font-medium">{{ selectedDetails.bases_datos || 'N/A' }}</span>
          </div>

          <div class="p-3 bg-white border border-[#BDCEE5]/50 rounded-xl">
            <span class="font-bold text-gray-500 block mb-1">Estatus del Ciclo de Vida</span>
            <span class="font-semibold text-[#81299A]">{{ selectedDetails.estatus || 'DESARROLLO' }}</span>
          </div>
        </div>

        <!-- Estado de PAP (Pase a Producción) -->
        <div class="p-3 bg-white border border-[#BDCEE5]/50 rounded-xl flex items-center justify-between text-xs">
          <span class="font-bold text-gray-600">Pase a Producción (PAP)</span>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold"
            :class="selectedDetails.pap ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'"
          >
            <component :is="selectedDetails.pap ? CheckCircleIcon : XCircleIcon" class="h-4 w-4" />
            {{ selectedDetails.pap ? 'Aprobado / Activo' : 'Pendiente' }}
          </span>
        </div>

        <!-- Observaciones -->
        <div v-if="selectedDetails.observaciones" class="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <span class="font-bold uppercase text-[11px] block">Observaciones Técnicas:</span>
          <p class="leading-relaxed">{{ selectedDetails.observaciones }}</p>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="button"
            @click="isDetailsModalOpen = false"
            class="btn-primary text-xs cursor-pointer px-4 py-2"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>

      <div v-else class="p-6 text-center text-xs text-gray-400 italic">
        No hay detalles técnicos registrados para este aplicativo.
      </div>
    </Modal>
  </div>
</template>
