<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/authStore';
import type { User, Role } from '@/interfaces/User';
import type { Gerencia } from '@/interfaces/Gerencia';
import Modal from '@/components/layout/Modal.vue';
import ModuleHeader from '@/components/common/ModuleHeader.vue';
import AdvancedDataTable from '@/components/common/datatable/AdvancedDataTable.vue';
import type { DataTableColumn, DataTableFeatures } from '@/composables/useDataTable';
import Swal from 'sweetalert2';
import {
  UsersIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline';

const authStore = useAuthStore();

// ==========================================
// ESTADO REACTIVO
// ==========================================
const users = ref<User[]>([]);
const gerencias = ref<Gerencia[]>([]);
const availableRoles = ref<Role[]>([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');

// Control del Modal (Crear / Editar)
const isModalOpen = ref(false);
const isEditing = ref(false);
const editingUserId = ref<number | null>(null);
const formErrors = ref<Record<string, string[]>>({});

const form = ref({
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  gerencia_id: null as number | null,
  roles: [] as string[],
  is_active: true,
});

// Permiso para crear/editar/eliminar
const canManage = computed(() => authStore.hasPermission('gestionar.usuarios'));

// Configuración de columnas del DataTable según la Skill
const tableColumns = ref<DataTableColumn[]>([
  { key: 'id', label: 'ID', sortable: true, visible: false, width: 'w-20', align: 'center' },
  { key: 'username', label: 'Usuario', sortable: true, align: 'left' },
  { key: 'full_name', label: 'Nombre Completo', sortable: true, align: 'left' },
  { key: 'email', label: 'Email', sortable: true, align: 'left' },
  { key: 'gerencia', label: 'Gerencia', sortable: true, align: 'left' },
  { key: 'roles', label: 'Rol', sortable: false, width: 'w-32', align: 'center' },
  { key: 'is_active', label: 'Estado', sortable: true, width: 'w-28', align: 'center' },
  { key: 'acciones', label: 'Acciones', sortable: false, width: 'w-28', align: 'center' },
]);

// Características avanzadas del DataTable
const tableFeatures: DataTableFeatures = {
  searchable: true,
  columnVisibility: true,
  exportExcel: true,
  selectable: true,
  pagination: true,
  dateRangeFilter: false,
  pageSizes: [10, 25, 50, 100],
};

// Datos transformados para facilitar el filtrado y ordenamiento del composable
const tableUsers = computed(() => {
  return users.value.map(u => ({
    ...u,
    full_name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
    gerencia_nombre: u.gerencia?.sigla || u.gerencia?.nombre_gerencia || 'Sin gerencia',
  }));
});

// ==========================================
// MÉTODOS DE CONSUMO DE API
// ==========================================

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/usuarios');
    users.value = response.data.data || [];
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  } finally {
    loading.value = false;
  }
};

const fetchAuxiliaryData = async () => {
  try {
    const [resGerencias, resRoles] = await Promise.allSettled([
      apiClient.get('/gerencias'),
      apiClient.get('/roles')
    ]);

    if (resGerencias.status === 'fulfilled') {
      gerencias.value = resGerencias.value.data.data || [];
    }
    if (resRoles.status === 'fulfilled') {
      availableRoles.value = resRoles.value.data.data || [];
    }
  } catch (error) {
    console.error('Error al cargar datos auxiliares:', error);
  }
};

// ==========================================
// GESTIÓN DEL MODAL Y FORMULARIO
// ==========================================

const openCreateModal = () => {
  isEditing.value = false;
  editingUserId.value = null;
  formErrors.value = {};
  form.value = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    gerencia_id: gerencias.value[0]?.id || null,
    roles: ['colaborador'],
    is_active: true,
  };
  isModalOpen.value = true;
};

const openEditModal = (user: User) => {
  isEditing.value = true;
  editingUserId.value = user.id;
  formErrors.value = {};

  const currentRoleNames: string[] = (user.roles || []).map((r: any) =>
    typeof r === 'string' ? r : r.name
  );

  form.value = {
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    password: '', // Se deja vacío para que no se sobreescriba a menos que se ingrese una nueva
    gerencia_id: user.gerencia_id || user.gerencia?.id || null,
    roles: currentRoleNames.length > 0 ? currentRoleNames : ['colaborador'],
    is_active: user.is_active,
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
    const payload: Record<string, any> = {
      username: form.value.username,
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      gerencia_id: form.value.gerencia_id,
      roles: form.value.roles,
      is_active: form.value.is_active,
    };

    if (form.value.password) {
      payload.password = form.value.password;
    }

    if (isEditing.value && editingUserId.value) {
      await apiClient.put(`/usuarios/${editingUserId.value}/update-usuario`, payload);
      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: 'Los datos del usuario se actualizaron exitosamente.',
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      await apiClient.post('/usuarios/create-user', payload);
      Swal.fire({
        icon: 'success',
        title: 'Usuario registrado',
        text: 'El nuevo usuario ha sido registrado correctamente.',
        timer: 1500,
        showConfirmButton: false,
      });
    }

    closeModal();
    await fetchUsers();
  } catch (error: any) {
    if (error.response?.status === 422 && error.response?.data?.errors) {
      formErrors.value = error.response.data.errors;
    }
    console.error('Error al procesar el usuario:', error);
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (user: User) => {
  const result = await Swal.fire({
    title: '¿Eliminar usuario?',
    text: `¿Estás seguro de que deseas eliminar a "${user.username}"? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#032C49',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await apiClient.delete(`/usuarios/${user.id}`);
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El usuario fue eliminado correctamente.',
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchUsers();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: error.response?.data?.message || 'No se pudo eliminar el usuario.',
        confirmButtonColor: '#032C49',
      });
    }
  }
};

// Formateador de roles para visualización
const formatRoles = (roles?: (Role | string)[]) => {
  if (!roles || roles.length === 0) return 'Sin rol';
  return roles
    .map(r => (typeof r === 'string' ? r : r.name))
    .join(', ');
};

onMounted(async () => {
  await fetchUsers();
  if (canManage.value) {
    await fetchAuxiliaryData();
  }
});
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Encabezado del Módulo (Estandarizado con ModuleHeader) -->
    <ModuleHeader
      title="Gestión de Usuarios"
      subtitle="Administra cuentas, roles asignados y estados de los usuarios del sistema."
      :icon="UsersIcon"
    >
      <template #actions>
        <button
          @click="fetchUsers"
          :disabled="loading"
          class="p-2.5 rounded-xl border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors cursor-pointer"
          title="Actualizar lista"
        >
          <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': loading }" />
        </button>

        <button
          v-if="canManage"
          @click="openCreateModal"
          class="btn-primary inline-flex items-center gap-2 cursor-pointer text-sm shadow-xs"
        >
          <UserPlusIcon class="h-5 w-5" />
          <span>Nuevo Usuario</span>
        </button>
      </template>
    </ModuleHeader>

    <!-- Componente DataTable Avanzado según la Skill -->
    <AdvancedDataTable
      :data="tableUsers"
      :columns="tableColumns"
      :features="tableFeatures"
      :loading="loading"
      export-file-name="usuarios_sistema"
      empty-text="No hay usuarios registrados que coincidan con la búsqueda."
    >
      <!-- Slot personalizado: ID con estilo mono -->
      <template #cell-id="{ value }">
        <span class="font-mono text-xs text-gray-500">#{{ value }}</span>
      </template>

      <!-- Slot personalizado: Nombre de Usuario destacado -->
      <template #cell-username="{ value }">
        <span class="font-semibold text-[#032C49]">{{ value }}</span>
      </template>

      <!-- Slot personalizado: Gerencia -->
      <template #cell-gerencia="{ row }">
        <span v-if="row.gerencia" class="px-2.5 py-1 rounded-lg text-xs bg-gray-100 text-[#032C49] font-medium border border-gray-200">
          {{ row.gerencia.sigla || row.gerencia.nombre_gerencia }}
        </span>
        <span v-else class="text-xs text-gray-400 italic">Sin gerencia</span>
      </template>

      <!-- Slot personalizado: Roles -->
      <template #cell-roles="{ value }">
        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4F1FA] text-[#81299A] border border-[#81299A]/20">
          {{ formatRoles(value) }}
        </span>
      </template>

      <!-- Slot personalizado: Estado -->
      <template #cell-is_active="{ value }">
        <span
          class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
          :class="value ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
        >
          {{ value ? 'Activo' : 'Inactivo' }}
        </span>
      </template>

      <!-- Slot personalizado: Acciones -->
      <template #cell-acciones="{ row }">
        <div v-if="canManage" class="inline-flex items-center gap-1.5 justify-center">
          <button
            @click="openEditModal(row)"
            class="p-2 text-[#322CAB] hover:bg-[#F4F1FA] rounded-xl transition-colors cursor-pointer"
            title="Editar usuario"
          >
            <PencilSquareIcon class="h-4 w-4" />
          </button>
          <button
            @click="handleDelete(row)"
            class="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            title="Eliminar usuario"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
        <span v-else class="text-xs text-gray-400">—</span>
      </template>
    </AdvancedDataTable>

    <!-- Modal de Creación / Edición -->
    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? 'Editar Usuario' : 'Nuevo Usuario'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Usuario -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Nombre de Usuario
          </label>
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
            :class="formErrors.username ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            placeholder="ej. jdoe"
          />
          <p v-if="formErrors.username" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.username[0] }}
          </p>
        </div>

        <!-- Nombres y Apellidos en grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Nombre
            </label>
            <input
              v-model="form.first_name"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.first_name ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
              placeholder="Juan"
            />
            <p v-if="formErrors.first_name" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.first_name[0] }}
            </p>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Apellido
            </label>
            <input
              v-model="form.last_name"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.last_name ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
              placeholder="Pérez"
            />
            <p v-if="formErrors.last_name" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.last_name[0] }}
            </p>
          </div>
        </div>

        <!-- Correo Electrónico -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Correo Electrónico
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
            :class="formErrors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            placeholder="juan.perez@empresa.com"
          />
          <p v-if="formErrors.email" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.email[0] }}
          </p>
        </div>

        <!-- Contraseña -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
            Contraseña
            <span v-if="isEditing" class="text-xs font-normal text-gray-500 lowercase">(dejar en blanco para conservar)</span>
          </label>
          <input
            v-model="form.password"
            type="password"
            :required="!isEditing"
            class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
            :class="formErrors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            placeholder="••••••••"
          />
          <p v-if="formErrors.password" class="mt-1 text-xs text-rose-600 font-medium">
            {{ formErrors.password[0] }}
          </p>
        </div>

        <!-- Gerencia y Rol -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Gerencia
            </label>
            <select
              v-model="form.gerencia_id"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.gerencia_id ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            >
              <option :value="null" disabled>Seleccionar gerencia...</option>
              <option
                v-for="g in gerencias"
                :key="g.id"
                :value="g.id"
              >
                {{ g.nombre_gerencia }} ({{ g.sigla }})
              </option>
            </select>
            <p v-if="formErrors.gerencia_id" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.gerencia_id[0] }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Rol Principal
            </label>
            <select
              :value="form.roles[0] || 'colaborador'"
              @change="(e: any) => form.roles = [e.target.value]"
              required
              class="w-full px-3 py-2 border rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2"
              :class="formErrors.roles ? 'border-rose-500 focus:ring-rose-500' : 'border-[#BDCEE5] focus:ring-[#81299A]'"
            >
              <option v-if="availableRoles.length === 0" value="colaborador">Colaborador</option>
              <option
                v-for="r in availableRoles"
                :key="r.id"
                :value="r.name"
              >
                {{ r.name }}
              </option>
            </select>
            <p v-if="formErrors.roles" class="mt-1 text-xs text-rose-600 font-medium">
              {{ formErrors.roles[0] }}
            </p>
          </div>
        </div>

        <!-- Estado Activo -->
        <div class="flex items-center gap-2 pt-2">
          <input
            id="is_active"
            v-model="form.is_active"
            type="checkbox"
            class="h-4 w-4 rounded border-[#BDCEE5] text-[#81299A] focus:ring-[#81299A]"
          />
          <label for="is_active" class="text-sm font-medium text-[#032C49]">
            Activo
          </label>
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
  </div>
</template>
