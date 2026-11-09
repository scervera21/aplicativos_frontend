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
const formErrors = ref<Record<string, string[]>>({});

// Modal Secundario (Ficha Técnica)
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
  estatus: '',
  pap: false,
  lenguajes_frontend: '',
  lenguajes_backend: '',
  bases_datos: '',
  observaciones: ''
});

const canManage = computed(() => authStore.hasPermission('gestionar.aplicativos'));

// Configuración de Columnas del DataTable: Exclusivamente información principal
const tableColumns = ref<DataTableColumn[]>([
  { key: 'id', label: 'ID', sortable: true, visible: false, width: 'w-20', align: 'center' },
  { key: 'nombre_aplicativo', label: 'Nombre Aplicativo', sortable: true, align: 'left' },
  { key: 'alias', label: 'Alias', sortable: true, width: 'w-28', align: 'center' },
  { key: 'responsable', label: 'Responsable', sortable: true, align: 'left' },
  { key: 'gerencia_responsable', label: 'Gerencia', sortable: true, align: 'left' },
  { key: 'avance_total', label: 'Avance', sortable: true, width: 'w-36', align: 'left' },
  { key: 'fecha_inicio', label: 'Fecha Inicio', sortable: true, width: 'w-32', align: 'center' },
  { key: 'fecha_fin', label: 'Fecha Fin', sortable: true, width: 'w-32', align: 'center' },
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
  formErrors.value = {};
  form.value = {
    nombre_aplicativo: '',
    alias: '',
    responsable: '',
    gerencia_id: null, // 'Seleccionar Gerencia' por defecto
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_fin: '',
    descripcion: '',
    estatus: '',
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
  formErrors.value = {};

  // Rescatar la gerencia registrada ya sea por id o por coincidencia con el nombre de gerencia
  const matchedGerencia = gerencias.value.find(
    g => g.id === app.gerencia_id || (app.gerencia_responsable && g.nombre_gerencia.trim().toLowerCase() === app.gerencia_responsable.trim().toLowerCase())
  );

  form.value = {
    nombre_aplicativo: app.nombre_aplicativo,
    alias: app.alias,
    responsable: app.responsable,
    gerencia_id: matchedGerencia ? matchedGerencia.id : (app.gerencia_id ?? null),
    fecha_inicio: app.fecha_inicio || '',
    fecha_fin: app.fecha_fin || '',
    descripcion: '',
    estatus: '',
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
      if (d.gerencia_id !== undefined && d.gerencia_id !== null) {
        form.value.gerencia_id = d.gerencia_id;
      }
      form.value.descripcion = d.descripcion || '';
      form.value.estatus = d.estatus || '';
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
  formErrors.value = {};
};

const handleSubmit = async () => {
  formErrors.value = {};
  saving.value = true;
  try {
    const payload = { ...form.value };

    if (isEditing.value && editingAplicativoId.value) {
      await apiClient.put(`/aplicativos/${editingAplicativoId.value}/update-aplicativo`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Aplicativo actualizado',
        text: 'El aplicativo se actualizó correctamente.',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      await apiClient.post('/aplicativos/create-aplicativo', payload);
      Swal.fire({
        icon: 'success',
        title: 'Aplicativo registrado',
        text: 'El aplicativo se ha registrado correctamente.',
        timer: 1500,
        showConfirmButton: false
      });
    }

    closeModal();
    await fetchAplicativos();
  } catch (error: any) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      formErrors.value = error.response.data.errors;
    }
    console.error('Error al procesar el aplicativo:', error);
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (app: Aplicativo) => {
  const result = await Swal.fire({
    title: '¿Eliminar aplicativo?',
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
      await apiClient.delete(`/aplicativos/${app.id}`);
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El aplicativo ha sido eliminado correctamente.',
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
          {{ value || 'N/A' }}
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
            Ficha Principal
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
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.nombre_aplicativo ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.nombre_aplicativo" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.nombre_aplicativo[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Alias
            </label>
            <input
              v-model="form.alias"
              type="text"
              maxlength="10"
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] uppercase font-mono focus:outline-none focus:ring-2"
              :class="formErrors.alias ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.alias" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.alias[0] }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Responsable
            </label>
            <input
              v-model="form.responsable"
              type="text"
              maxlength="50"
              placeholder="Nombre del encargado"
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.responsable ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.responsable" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.responsable[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Gerencia Responsable
            </label>
            <select
              v-model="form.gerencia_id"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.gerencia_id ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            >
              <option :value="null" disabled>Seleccionar Gerencia...</option>
              <option v-for="g in gerencias" :key="g.id" :value="g.id">
                {{ g.nombre_gerencia }} ({{ g.sigla }})
              </option>
            </select>
            <p v-if="formErrors.gerencia_id" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.gerencia_id[0] }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Fecha inicial
            </label>
            <input
              v-model="form.fecha_inicio"
              type="date"
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.fecha_inicio ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.fecha_inicio" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.fecha_inicio[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Fecha final
            </label>
            <input
              v-model="form.fecha_fin"
              type="date"
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.fecha_fin ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.fecha_fin" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.fecha_fin[0] }}
            </p>
          </div>
        </div>

        <!-- SECCIÓN 2: Información detallada (Ficha Técnica) -->
        <div class="border-b border-[#BDCEE5]/40 pb-2 pt-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-[#81299A]">
             Ficha Técnica
          </h4>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Estatus
            </label>
            <input
              v-model="form.estatus"
              type="text"
              maxlength="50"
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.estatus? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.estatus" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.estatus[0] }}
            </p>
          </div>

          <div class="flex flex-col justify-center pt-2">
            <div class="flex items-center gap-2 pt-4">
              <input
                id="pap_check"
                v-model="form.pap"
                type="checkbox"
                class="h-4 w-4 rounded border-[#BDCEE5] text-[#81299A] focus:ring-[#81299A] cursor-pointer"
              />
              <label for="pap_check" class="text-xs font-bold uppercase tracking-wider text-[#032C49] cursor-pointer">
                Pase a Producción (PAP)
              </label>
            </div>
            <p v-if="formErrors.pap" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.pap[0] }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Lenguajes Frontend
            </label>
            <input
              v-model="form.lenguajes_frontend"
              type="text"
              maxlength="50"
              placeholder="Lenguaje 1 / Lenguaje 2...."
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.lenguajes_frontend ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.lenguajes_frontend" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.lenguajes_frontend[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Lenguajes Backend
            </label>
            <input
              v-model="form.lenguajes_backend"
              type="text"
              maxlength="50"
              placeholder="Lenguaje 1 / Lenguaje 2..."
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.lenguajes_backend ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.lenguajes_backend" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.lenguajes_backend[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Bases de Datos
            </label>
            <input
              v-model="form.bases_datos"
              type="text"
              maxlength="50"
              placeholder="Base de Datos 1 / Base de Datos 2..."
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.bases_datos ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            />
            <p v-if="formErrors.bases_datos" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.bases_datos[0] }}
            </p>
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
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
            :class="formErrors.descripcion ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
          />
          <p v-if="formErrors.descripcion" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.descripcion[0] }}
          </p>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Observaciones Técnicas
          </label>
          <textarea
            v-model="form.observaciones"
            rows="2"
            placeholder="Requerimientos especiales, dependencias o notas técnicas..."
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
            :class="formErrors.observaciones ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
          />
          <p v-if="formErrors.observaciones" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.observaciones[0] }}
          </p>
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#BDCEE5]/40">
          <button
            type="submit"
            :disabled="saving"
            class="btn-primary text-sm cursor-pointer disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar') }}
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
          <p class="text-xs text-gray-700 leading-relaxed">{{ selectedDetails.descripcion || 'Sin descripción técnica' }}</p>
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
            <span class="font-bold text-gray-500 block mb-1">Estatus</span>
            <span class="font-semibold text-[#81299A]">{{ selectedDetails.estatus || 'Sin Estatus' }}</span>
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
            {{ selectedDetails.pap ? 'Sí' : 'No' }}
          </span>
        </div>

        <!-- Observaciones -->
        <div v-if="selectedDetails.observaciones" class="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <span class="font-bold uppercase text-[11px] block">Observaciones Técnicas:</span>
          <p class="leading-relaxed">{{ selectedDetails.observaciones }}</p>
        </div>
      </div>

      <div v-else class="p-6 text-center text-xs text-gray-400 italic">
        No hay detalles técnicos registrados para este aplicativo.
      </div>
    </Modal>
  </div>
</template>
