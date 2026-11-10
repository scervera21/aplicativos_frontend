<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/authStore';
import type { Gerencia } from '@/interfaces/Gerencia';
import Modal from '@/components/layout/Modal.vue';
import ModuleHeader from '@/components/common/ModuleHeader.vue';
import AdvancedDataTable from '@/components/common/datatable/AdvancedDataTable.vue';
import type { DataTableColumn, DataTableFeatures } from '@/composables/useDataTable';
import Swal from 'sweetalert2';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// ==========================================
// ESTADO REACTIVO
// ==========================================
const gerencias = ref<Gerencia[]>([]);
const loading = ref(false);
const saving = ref(false);

// Control del Modal (Crear / Editar)
const isModalOpen = ref(false);
const isEditing = ref(false);
const editingGerenciaId = ref<number | null>(null);
const formErrors = ref<Record<string, string[]>>({});

const form = ref({
  nombre_gerencia: '',
  sigla: ''
});

// Permiso para gestionar (si tiene permiso o es admin)
const canManage = computed(() => authStore.hasPermission('gestionar.gerencias') || authStore.hasRole('ADMIN') || authStore.hasRole('administrador'));

// Configuración de Columnas del DataTable según las Skills
const tableColumns = ref<DataTableColumn[]>([
  { key: 'id', label: 'ID', sortable: true, visible: false, width: 'w-24', align: 'center' },
  { key: 'sigla', label: 'Sigla', sortable: true, width: 'w-36', align: 'center' },
  { key: 'nombre_gerencia', label: 'Nombre de la Gerencia', sortable: true, align: 'left' },
  { key: 'acciones', label: 'Acciones', sortable: false, width: 'w-32', align: 'center' }
]);

const tableFeatures: DataTableFeatures = {
  searchable: true,
  columnVisibility: true,
  exportExcel: true,
  selectable: true,
  pagination: true,
  pageSizes: [10, 25, 50]
};

// ==========================================
// MÉTODOS DE CONSUMO DE API
// ==========================================
const fetchGerencias = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/gerencias');
    gerencias.value = response.data.data || [];
  } catch (error) {
    console.error('Error al cargar gerencias:', error);
  } finally {
    loading.value = false;
  }
};

// ==========================================
// ACCIONES DEL MODAL
// ==========================================
const openCreateModal = () => {
  isEditing.value = false;
  editingGerenciaId.value = null;
  formErrors.value = {};
  form.value = {
    nombre_gerencia: '',
    sigla: ''
  };
  isModalOpen.value = true;
};

const openEditModal = (item: Gerencia) => {
  isEditing.value = true;
  editingGerenciaId.value = item.id;
  formErrors.value = {};
  form.value = {
    nombre_gerencia: item.nombre_gerencia,
    sigla: item.sigla
  };
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
    const payload = {
      nombre_gerencia: form.value.nombre_gerencia.trim(),
      sigla: form.value.sigla.trim().toUpperCase()
    };

    if (isEditing.value && editingGerenciaId.value) {
      await apiClient.put(`/gerencias/${editingGerenciaId.value}/update-gerencia`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Gerencia actualizada',
        text: 'La gerencia se ha actualizado correctamente.',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      await apiClient.post('/gerencias/create-gerencia', payload);
      Swal.fire({
        icon: 'success',
        title: 'Gerencia registrada',
        text: 'La gerencia se ha creado exitosamente.',
        timer: 1500,
        showConfirmButton: false
      });
    }

    closeModal();
    await fetchGerencias();
  } catch (error: any) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      formErrors.value = error.response.data.errors;
    }
    console.error('Error al procesar la gerencia:', error);
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (item: Gerencia) => {
  const result = await Swal.fire({
    title: '¿Eliminar gerencia?',
    text: `¿Estás seguro de eliminar "${item.nombre_gerencia}"? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#032C49',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await apiClient.delete(`/gerencias/${item.id}`);
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'La gerencia ha sido eliminada.',
        timer: 1500,
        showConfirmButton: false
      });
      await fetchGerencias();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: error.response?.data?.message || 'No se pudo eliminar la gerencia.',
        confirmButtonColor: '#032C49'
      });
    }
  }
};

onMounted(async () => {
  await fetchGerencias();
});
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Encabezado del Módulo (Estandarizado según Skill de Estilos) -->
    <ModuleHeader
      title="Gestión de Gerencias"
      subtitle="Administración de divisiones, departamentos y gerencias de la institución."
      :icon="BuildingOfficeIcon"
    >
      <template #actions>
        <button
          @click="fetchGerencias"
          :disabled="loading"
          class="p-2.5 rounded-xl border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors cursor-pointer"
          title="Actualizar datos"
        >
          <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': loading }" />
        </button>

        <button
          @click="openCreateModal"
          class="btn-primary inline-flex items-center gap-2 cursor-pointer text-sm shadow-xs"
        >
          <PlusIcon class="h-5 w-5" />
          <span>Nueva Gerencia</span>
        </button>
      </template>
    </ModuleHeader>

    <!-- DataTable Avanzado según Skill Datatables -->
    <AdvancedDataTable
      :data="gerencias"
      :columns="tableColumns"
      :features="tableFeatures"
      :loading="loading"
      export-file-name="gerencias_institucionales"
      empty-text="No se encontraron gerencias registradas."
    >
      <!-- ID Monospace -->
      <template #cell-id="{ value }">
        <span class="font-mono text-xs text-gray-500">#{{ value }}</span>
      </template>

      <!-- Sigla con Badge Estilizado -->
      <template #cell-sigla="{ value }">
        <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F4F1FA] text-[#81299A] border border-[#81299A]/20 font-mono tracking-wider">
          {{ value || '—' }}
        </span>
      </template>

      <!-- Nombre de la Gerencia -->
      <template #cell-nombre_gerencia="{ value }">
        <span class="font-semibold text-[#032C49]">{{ value }}</span>
      </template>

      <!-- Acciones de Fila -->
      <template #cell-acciones="{ row }">
        <div class="inline-flex items-center gap-1.5 justify-center">
          <button
            @click="openEditModal(row)"
            class="p-2 text-[#322CAB] hover:bg-[#F4F1FA] rounded-xl transition-colors cursor-pointer"
            title="Editar gerencia"
          >
            <PencilSquareIcon class="h-4 w-4" />
          </button>
          <button
            @click="handleDelete(row)"
            class="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Eliminar gerencia"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
      </template>
    </AdvancedDataTable>

    <!-- Modal de Registro / Edición -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? 'Editar Gerencia' : 'Nueva Gerencia'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Sigla
          </label>
          <input
            v-model="form.sigla"
            type="text"
            maxlength="5"
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] uppercase font-mono focus:outline-none focus:ring-2"
            :class="formErrors.sigla ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
          />
          <p v-if="formErrors.sigla" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.sigla[0] }}
          </p>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Nombre de la Gerencia
          </label>
          <input
            v-model="form.nombre_gerencia"
            type="text"
            required
            maxlength="80"
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
            :class="formErrors.nombre_gerencia ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
          />
          <p v-if="formErrors.nombre_gerencia" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.nombre_gerencia[0] }}
          </p>
        </div>

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
  </div>
</template>
