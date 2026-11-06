<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/authStore';
import type { Role, Permission } from '@/interfaces/User';
import Modal from '@/components/layout/Modal.vue';
import ModuleHeader from '@/components/common/ModuleHeader.vue';
import AdvancedDataTable from '@/components/common/datatable/AdvancedDataTable.vue';
import type { DataTableColumn, DataTableFeatures } from '@/composables/useDataTable';
import Swal from 'sweetalert2';
import {
  ShieldCheckIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  KeyIcon,
  EyeIcon,
  CheckBadgeIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// ==========================================
// ESTADO REACTIVO
// ==========================================
const roles = ref<Role[]>([]);
const catalogPermissions = ref<Permission[]>([]);
const loading = ref(false);
const saving = ref(false);

// Modal de Creación / Edición
const isModalOpen = ref(false);
const isEditing = ref(false);
const editingRoleId = ref<number | null>(null);
const formErrors = ref<Record<string, string[]>>({});

const form = ref({
  name: '',
  permissions: [] as string[]
});

// Modal de Visualización de Permisos
const isViewModalOpen = ref(false);
const selectedRole = ref<Role | null>(null);
const selectedRolePermissions = ref<string[]>([]);
const loadingPermissions = ref(false);

const canManage = computed(() => authStore.hasPermission('gestionar.roles'));

// Configuración de Columnas (se retiró la columna 'guard_name')
const tableColumns = ref<DataTableColumn[]>([
  { key: 'id', label: 'ID', sortable: true, visible: false, width: 'w-24', align: 'center' },
  { key: 'name', label: 'Nombre del Rol', sortable: true, align: 'left' },
  { key: 'acciones', label: 'Acciones', sortable: false, width: 'w-36', align: 'center' }
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
const fetchRoles = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/roles');
    roles.value = response.data.data || [];
  } catch (error) {
    console.error('Error al cargar roles:', error);
  } finally {
    loading.value = false;
  }
};

const fetchPermissionsCatalog = async () => {
  try {
    const response = await apiClient.get('/roles/catalogo-permisos');
    catalogPermissions.value = response.data.data || [];
  } catch (error) {
    console.error('Error al cargar catálogo de permisos:', error);
  }
};

// ==========================================
// GESTIÓN DE CHECKBOXES DE PERMISOS
// ==========================================
const isPermissionChecked = (permName: string) => {
  return form.value.permissions.includes(permName);
};

const togglePermission = (permName: string) => {
  const index = form.value.permissions.indexOf(permName);
  if (index > -1) {
    form.value.permissions.splice(index, 1);
  } else {
    // Si no es ADMINISTRADOR, validar que no esté seleccionando TODOS los permisos
    const currentCount = form.value.permissions.length;
    const totalCount = catalogPermissions.value.length;
    const isTargetAdmin = form.value.name.trim().toUpperCase() === 'ADMINISTRADOR';

    if (!isTargetAdmin && totalCount > 0 && currentCount + 1 >= totalCount) {
      Swal.fire({
        icon: 'warning',
        title: 'Restricción de seguridad',
        text: 'Ningún rol excepto ADMINISTRADOR puede tener asignados todos los permisos del sistema.',
        confirmButtonColor: '#81299A'
      });
      return;
    }
    form.value.permissions.push(permName);
  }
};

const selectAllAllowed = () => {
  const isTargetAdmin = form.value.name.trim().toUpperCase() === 'ADMINISTRADOR';
  if (isTargetAdmin) {
    form.value.permissions = catalogPermissions.value.map(p => p.name);
  } else {
    Swal.fire({
      icon: 'info',
      title: 'Acción no permitida',
      text: 'Solo el rol ADMINISTRADOR puede poseer la totalidad de los permisos.',
      confirmButtonColor: '#032C49'
    });
  }
};

const deselectAll = () => {
  form.value.permissions = [];
};

// ==========================================
// ACCIONES DEL MODAL
// ==========================================
const openCreateModal = () => {
  isEditing.value = false;
  editingRoleId.value = null;
  formErrors.value = {};
  form.value = {
    name: '',
    permissions: []
  };
  isModalOpen.value = true;
};

const openEditModal = async (role: Role) => {
  isEditing.value = true;
  editingRoleId.value = role.id;
  formErrors.value = {};
  form.value = {
    name: role.name,
    permissions: []
  };

  try {
    const res = await apiClient.get(`/roles/${role.id}/permisos`);
    form.value.permissions = res.data.data || [];
  } catch (err) {
    console.error('Error al consultar permisos del rol:', err);
  }

  isModalOpen.value = true;
};

const openViewModal = async (role: Role) => {
  selectedRole.value = role;
  isViewModalOpen.value = true;
  loadingPermissions.value = true;
  selectedRolePermissions.value = [];

  try {
    const res = await apiClient.get(`/roles/${role.id}/permisos`);
    selectedRolePermissions.value = res.data.data || [];
  } catch (err) {
    console.error('Error al consultar permisos del rol:', err);
  } finally {
    loadingPermissions.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  formErrors.value = {};
};

const closeViewModal = () => {
  isViewModalOpen.value = false;
  selectedRole.value = null;
  selectedRolePermissions.value = [];
};

const handleSubmit = async () => {
  formErrors.value = {};
  const roleName = form.value.name.trim().toUpperCase();

  // Validación: Ningún rol excepto administrador puede tener todos los permisos
  if (roleName !== 'ADMINISTRADOR' && catalogPermissions.value.length > 0) {
    if (form.value.permissions.length >= catalogPermissions.value.length) {
      formErrors.value = {
        permissions: ['Ningún rol excepto ADMINISTRADOR puede tener asignados todos los permisos.']
      };
      return;
    }
  }

  saving.value = true;
  try {
    const payload = {
      name: roleName,
      permissions: form.value.permissions
    };

    if (isEditing.value && editingRoleId.value) {
      await apiClient.put(`/roles/${editingRoleId.value}/update-rol`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Rol actualizado',
        text: 'El rol y sus permisos se actualizaron correctamente.',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      await apiClient.post('/roles/create-rol', payload);
      Swal.fire({
        icon: 'success',
        title: 'Rol creado',
        text: 'El nuevo rol ha sido registrado exitosamente con sus permisos.',
        timer: 1500,
        showConfirmButton: false
      });
    }

    closeModal();
    await fetchRoles();
  } catch (error: any) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      formErrors.value = error.response.data.errors;
    } else if (error.response?.data?.message) {
      formErrors.value = {
        name: [error.response.data.message]
      };
    }
    console.error('Error al procesar el rol:', error);
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (role: Role) => {
  const result = await Swal.fire({
    title: '¿Eliminar Rol?',
    text: `¿Estás seguro de eliminar el rol "${role.name}"? Los usuarios vinculados perderán sus capacidades.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#032C49',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await apiClient.delete(`/roles/${role.id}`);
      Swal.fire({
        icon: 'success',
        title: 'Rol eliminado',
        text: 'El rol se eliminó correctamente.',
        timer: 1500,
        showConfirmButton: false
      });
      await fetchRoles();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Acción bloqueada',
        text: error.response?.data?.message || 'No se pudo eliminar el rol.',
        confirmButtonColor: '#032C49'
      });
    }
  }
};

onMounted(async () => {
  await Promise.all([fetchRoles(), fetchPermissionsCatalog()]);
});
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Encabezado del Módulo -->
    <ModuleHeader
      title="Roles y Permisos"
      subtitle="Definición de perfiles de seguridad y asignación granular de permisos Spatie."
      :icon="ShieldCheckIcon"
    >
      <template #actions>
        <button
          @click="fetchRoles"
          :disabled="loading"
          class="p-2.5 rounded-xl border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors cursor-pointer"
          title="Actualizar lista de roles"
        >
          <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': loading }" />
        </button>

        <button
          v-if="canManage"
          @click="openCreateModal"
          class="btn-primary inline-flex items-center gap-2 cursor-pointer text-sm shadow-xs"
        >
          <PlusIcon class="h-5 w-5" />
          <span>Nuevo Rol</span>
        </button>
      </template>
    </ModuleHeader>

    <!-- DataTable de Roles (Sin columna Guard) -->
    <AdvancedDataTable
      :data="roles"
      :columns="tableColumns"
      :features="tableFeatures"
      :loading="loading"
      export-file-name="roles_sistema"
      empty-text="No se encontraron roles configurados."
    >
      <!-- ID Monospace -->
      <template #cell-id="{ value }">
        <span class="font-mono text-xs text-gray-500">#{{ value }}</span>
      </template>

      <!-- Nombre del Rol con Badge -->
      <template #cell-name="{ value }">
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#F4F1FA] text-[#81299A] border border-[#81299A]/30 tracking-wide">
          {{ value }}
        </span>
      </template>

      <!-- Columna Acciones con Botón de Visualización de Permisos -->
      <template #cell-acciones="{ row }">
        <div class="inline-flex items-center gap-1.5 justify-center">
          <!-- Botón Visualizar Permisos -->
          <button
            @click="openViewModal(row)"
            class="p-2 text-[#81299A] hover:bg-[#F4F1FA] rounded-xl transition-colors cursor-pointer"
            title="Visualizar permisos asociados"
          >
            <EyeIcon class="h-4 w-4" />
          </button>

          <!-- Botón Editar Rol y Permisos -->
          <button
            v-if="canManage"
            @click="openEditModal(row)"
            class="p-2 text-[#322CAB] hover:bg-[#F4F1FA] rounded-xl transition-colors cursor-pointer"
            title="Editar rol y permisos"
          >
            <PencilSquareIcon class="h-4 w-4" />
          </button>

          <!-- Botón Eliminar Rol -->
          <button
            v-if="canManage"
            @click="handleDelete(row)"
            class="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Eliminar rol"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
      </template>
    </AdvancedDataTable>

    <!-- Modal de Creación / Edición de Rol con Checklist de Permisos -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? 'Editar Rol y Permisos' : 'Crear Nuevo Rol'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Nombre del Rol
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="ej. SUPERVISOR, COLABORADOR, AUDITOR"
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] uppercase font-semibold focus:outline-none focus:ring-2"
            :class="formErrors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
          />
          <p v-if="formErrors.name" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.name[0] }}
          </p>
        </div>

        <!-- Sección de Selección de Permisos -->
        <div class="space-y-2">
          <div class="flex items-center justify-between border-b border-[#BDCEE5]/40 pb-2">
            <div class="flex items-center gap-1.5 text-xs font-bold text-[#032C49] uppercase">
              <KeyIcon class="h-4 w-4 text-[#81299A]" />
              <span>Permisos del Sistema</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <button
                v-if="form.name.trim().toUpperCase() === 'ADMINISTRADOR'"
                type="button"
                @click="selectAllAllowed"
                class="text-[#81299A] hover:underline font-medium"
              >
                Marcar todos
              </button>
              <button
                type="button"
                @click="deselectAll"
                class="text-gray-500 hover:underline"
              >
                Limpiar
              </button>
            </div>
          </div>

          <!-- Indicador informativo sobre la regla de exclusividad -->
          <!-- <div v-if="form.name.trim().toUpperCase() !== 'ADMINISTRADOR'" class="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
            <strong>Restricción:</strong> Solo el rol ADMINISTRADOR puede contar con la totalidad de los permisos simultáneamente.
          </div> -->

          <!-- Lista de Permisos con Casillas de Verificación -->
          <div class="max-h-64 overflow-y-auto space-y-1.5 p-2 bg-[#F4F1FA]/50 rounded-xl border border-[#BDCEE5]/40">
            <div
              v-for="p in catalogPermissions"
              :key="p.id"
              @click="togglePermission(p.name)"
              class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors hover:bg-white text-xs"
              :class="isPermissionChecked(p.name) ? 'bg-white shadow-2xs border border-[#81299A]/30' : 'border border-transparent'"
            >
              <div class="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  :checked="isPermissionChecked(p.name)"
                  @click.stop="togglePermission(p.name)"
                  class="h-4 w-4 rounded border-[#BDCEE5] text-[#81299A] focus:ring-[#81299A] cursor-pointer"
                />
                <span class="font-mono text-[#032C49] font-medium truncate">{{ p.name }}</span>
              </div>
            </div>

            <div v-if="catalogPermissions.length === 0" class="p-4 text-center text-xs text-gray-400 italic">
              No hay permisos registrados en el catálogo.
            </div>
          </div>

          <div class="text-right text-xs text-gray-500">
            Seleccionados: <strong class="text-[#81299A]">{{ form.permissions.length }}</strong> de {{ catalogPermissions.length }}
          </div>

          <p v-if="formErrors.permissions" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.permissions[0] }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#BDCEE5]/40">
          <!-- <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm rounded-lg border border-[#BDCEE5] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button> -->
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

    <!-- Modal Exclusivo para Visualizar los Permisos Asociados -->
    <Modal
      :is-open="isViewModalOpen"
      :title="`Permisos del Rol: ${selectedRole?.name || ''}`"
      @close="closeViewModal"
    >
      <div v-if="loadingPermissions" class="p-8 text-center text-gray-500">
        <div class="inline-block animate-spin text-2xl text-[#81299A]">⏳</div>
        <p class="text-xs mt-2">Consultando permisos vinculados...</p>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center justify-between p-3 bg-[#F4F1FA]/60 rounded-xl border border-[#BDCEE5]/40">
          <div class="flex items-center gap-2">
            <CheckBadgeIcon class="h-5 w-5 text-[#81299A]" />
            <span class="text-xs font-bold text-[#032C49]">Permisos Asignados</span>
          </div>
          <span class="text-xs font-mono font-bold text-[#81299A] bg-white px-2.5 py-0.5 rounded-full border border-[#BDCEE5]/50">
            {{ selectedRolePermissions.length }} permisos
          </span>
        </div>

        <!-- Grilla de Permisos Asociados -->
        <div v-if="selectedRolePermissions.length > 0" class="max-h-72 overflow-y-auto flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-[#BDCEE5]/40">
          <span
            v-for="perm in selectedRolePermissions"
            :key="perm"
            class="px-2.5 py-1 bg-[#F4F1FA] text-[#032C49] border border-[#BDCEE5] rounded-lg text-xs font-mono shadow-2xs hover:border-[#81299A] transition-colors"
          >
            {{ perm }}
          </span>
        </div>

        <div v-else class="p-8 text-center text-xs text-gray-400 italic bg-[#F4F1FA]/30 rounded-xl border border-dashed border-[#BDCEE5]/60">
          Este rol no tiene permisos asignados actualmente.
        </div>

      </div>
    </Modal>
  </div>
</template>
