<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/plugins/axios';
import { useAuthStore } from '@/stores/authStore';
import type { User, Role } from '@/interfaces/User';
import type { Gerencia } from '@/interfaces/Gerencia';
import Modal from '@/components/layout/Modal.vue';
import Swal from 'sweetalert2';
import {
  UsersIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
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

// Filtrar usuarios en base al buscador
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(u =>
    u.username.toLowerCase().includes(q) ||
    u.first_name.toLowerCase().includes(q) ||
    u.last_name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    (u.gerencia?.nombre_gerencia || '').toLowerCase().includes(q)
  );
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
};

const handleSubmit = async () => {
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
    const msg = error.response?.data?.message || 'Ocurrió un error al procesar el usuario.';
    Swal.fire({
      icon: 'error',
      title: 'Error al guardar',
      text: msg,
      confirmButtonColor: '#032C49',
    });
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
  <div class="space-y-6">
    <!-- Encabezado del Módulo -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-[#BDCEE5]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-[#F4F1FA] rounded-full text-[#81299A]">
          <UsersIcon class="h-8 w-8" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-[#032C49]">Gestión de Usuarios</h1>
          <p class="text-sm text-gray-500">Administra cuentas, roles asignados y estados de los usuarios.</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="fetchUsers"
          :disabled="loading"
          class="p-2.5 rounded-lg border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors cursor-pointer"
          title="Actualizar lista"
        >
          <ArrowPathIcon class="h-5 w-5" :class="{ 'animate-spin': loading }" />
        </button>

        <button
          v-if="canManage"
          @click="openCreateModal"
          class="btn-primary inline-flex items-center gap-2 cursor-pointer text-sm"
        >
          <UserPlusIcon class="h-5 w-5" />
          <span>Nuevo Usuario</span>
        </button>
      </div>
    </div>

    <!-- Barra de Búsqueda y Filtros -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-[#BDCEE5]/40 flex items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <MagnifyingGlassIcon class="h-5 w-5" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por usuario, nombre, email o gerencia..."
          class="w-full pl-10 pr-4 py-2 border border-[#BDCEE5]/60 rounded-lg text-sm text-[#032C49] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#81299A]/50 bg-[#F4F1FA]/30"
        />
      </div>
      <div class="text-xs text-gray-500">
        Total: <span class="font-bold text-[#032C49]">{{ filteredUsers.length }}</span> usuarios
      </div>
    </div>

    <!-- Tabla Principal de Usuarios -->
    <div class="bg-white rounded-xl shadow-sm border border-[#BDCEE5]/40 overflow-hidden">
      <!-- Indicador de Carga -->
      <div v-if="loading" class="p-12 text-center text-gray-500 space-y-3">
        <div class="inline-block animate-spin text-2xl text-[#81299A]">⏳</div>
        <p class="text-sm">Cargando usuarios desde el servidor...</p>
      </div>

      <!-- Estado Vacío -->
      <div v-else-if="filteredUsers.length === 0" class="p-12 text-center text-gray-500 space-y-2">
        <p class="text-base font-semibold text-[#032C49]">No se encontraron usuarios</p>
        <p class="text-xs">No hay registros que coincidan con los criterios de búsqueda.</p>
      </div>

      <!-- Tabla Semántica Tailwind -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#F4F1FA] text-[#032C49] uppercase text-xs font-bold border-b border-[#BDCEE5]/40">
            <tr>
              <th class="px-6 py-3.5">ID</th>
              <th class="px-6 py-3.5">Usuario</th>
              <th class="px-6 py-3.5">Nombre Completo</th>
              <th class="px-6 py-3.5">Email</th>
              <th class="px-6 py-3.5">Gerencia</th>
              <th class="px-6 py-3.5">Rol</th>
              <th class="px-6 py-3.5">Estado</th>
              <th v-if="canManage" class="px-6 py-3.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#BDCEE5]/30">
            <tr
              v-for="u in filteredUsers"
              :key="u.id"
              class="hover:bg-[#F4F1FA]/40 transition-colors"
            >
              <td class="px-6 py-4 font-mono text-xs text-gray-500">#{{ u.id }}</td>
              <td class="px-6 py-4 font-semibold text-[#032C49]">{{ u.username }}</td>
              <td class="px-6 py-4 text-gray-700">{{ u.first_name }} {{ u.last_name }}</td>
              <td class="px-6 py-4 text-gray-600">{{ u.email }}</td>
              <td class="px-6 py-4 text-gray-600">
                <span v-if="u.gerencia" class="px-2 py-0.5 rounded text-xs bg-gray-100 text-[#032C49] font-medium">
                  {{ u.gerencia.sigla || u.gerencia.nombre_gerencia }}
                </span>
                <span v-else class="text-xs text-gray-400 italic">Sin gerencia</span>
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F4F1FA] text-[#81299A] border border-[#81299A]/20">
                  {{ formatRoles(u.roles) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-0.5 rounded text-xs font-semibold"
                  :class="u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ u.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td v-if="canManage" class="px-6 py-4 text-center">
                <div class="inline-flex items-center gap-2">
                  <button
                    @click="openEditModal(u)"
                    class="p-1.5 text-[#322CAB] hover:bg-[#F4F1FA] rounded-md transition-colors cursor-pointer"
                    title="Editar usuario"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  <button
                    @click="handleDelete(u)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    title="Eliminar usuario"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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
            class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            placeholder="ej. jdoe"
          />
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
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
              placeholder="Juan"
            />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Apellido
            </label>
            <input
              v-model="form.last_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
              placeholder="Pérez"
            />
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
            class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            placeholder="juan.perez@empresa.com"
          />
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
            class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
            placeholder="••••••••"
          />
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
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
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
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#032C49] mb-1">
              Rol Principal
            </label>
            <select
              :value="form.roles[0] || 'colaborador'"
              @change="(e: any) => form.roles = [e.target.value]"
              required
              class="w-full px-3 py-2 border border-[#BDCEE5] rounded-lg text-sm text-[#032C49] focus:outline-none focus:ring-2 focus:ring-[#81299A]"
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
            Usuario Activo
          </label>
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
            {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Usuario') }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>
