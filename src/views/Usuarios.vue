<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/plugins/axios';
import type { ApiResponse } from '@/interfaces/api';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
// const roles = authStore.roles;

const users = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get('/v1/users');
    users.value = response.data;
    console.log(users.value);
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (authStore.permissions?.access.includes('users.index')) {
    fetchUsers();
  } else {
    error.value = 'No tiene permisos para acceder a esta funcionalidad';
  }
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Usuarios</h1>

        <v-card
          :loading="loading"
          :disabled="loading"
        >
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Usuarios del Sistema</span>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              @click="$router.push('/users/registro')"
              :disabled="!authStore.permissions?.actions.includes('users.store')"
            >
              Nuevo Usuario
            </v-btn>
          </v-card-title>

          <v-card-text v-if="loading">
            <div class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <p class="mt-4 text-body-1">Cargando usuarios...</p>
            </div>
          </v-card-text>

          <v-card-text v-else-if="error">
            <v-alert
              type="error"
              variant="tonal"
              icon="mdi-alert-circle"
            >
              {{ error }}
            </v-alert>
          </v-card-text>

          <v-card-text v-else-if="users.length === 0">
            <v-alert
              type="info"
              variant="tonal"
              icon="mdi-information-outline"
            >
              No hay usuarios registrados en el sistema.
            </v-alert>
          </v-card-text>

          <v-card-text v-else>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">ID</th>
                  <th class="text-left">Usuario</th>
                  <th class="text-left">Email</th>
                  <th class="text-left">Nombre</th>
                  <th class="text-left">Apellido</th>
                  <th class="text-left">Rol</th>
                  <th class="text-left">Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in users"
                  :key="user.id"
                >
                  <td>{{ user.id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.first_name }}</td>
                  <td>{{ user.last_name }}</td>
                  <td>
                    <v-chip>{{ user.roles }}</v-chip>
                  </td>
                  <td>
                    <v-chip
                      :color="user.status === true ? 'success' : 'error'"
                      density="comfortable"
                    >
                      {{ user.status === true ? 'Activo' : 'Inactivo' }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <!-- <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="info"
                      @click="$router.push(`/usuarios/${user.id}`)"
                      :disabled="!roles.includes('Admin')"
                      title="Ver detalles"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn> -->
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="warning"
                      @click="$router.push(`/users/actualizar/${user}`)"
                      :disabled="!authStore.permissions?.actions.includes('users.update')"
                      title="Editar"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <!-- <v-btn
                      icon
                      variant="text"
                      size="small"
                      :color="user.status === true ? 'error' : 'success'"
                      @click="toggleStatus(user)"
                      :disabled="!authStore.permissions?.actions.includes('users.status')"
                      :title="user.status === true ? 'Desactivar' : 'Activar'"
                    >
                      <v-icon>{{ user.status === true ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
                    </v-btn> -->
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      color="error"
                      :disabled="!authStore.permissions?.actions.includes('users.delete')"
                      title="Eliminar"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>

</style>