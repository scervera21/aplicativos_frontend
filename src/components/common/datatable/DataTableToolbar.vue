<script setup lang="ts">
import type { DataTableColumn, DataTableFeatures } from '@/composables/useDataTable';
import ColumnVisibilityDropdown from './ColumnVisibilityDropdown.vue';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

interface Props {
  searchQuery: string;
  startDate: string;
  endDate: string;
  columns: DataTableColumn[];
  features?: DataTableFeatures;
  totalRecords: number;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'update:startDate', val: string): void;
  (e: 'update:endDate', val: string): void;
  (e: 'toggleColumn', key: string): void;
  (e: 'export'): void;
}>();
</script>

<template>
  <div class="p-4 md:p-5 bg-white border-b border-[#BDCEE5]/30 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 box-border">
    <!-- Bloque de Búsqueda y Rango de Fechas -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
      <!-- Búsqueda Rápida -->
      <div v-if="features?.searchable !== false" class="relative flex-1 min-w-0 max-w-md">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none flex items-center justify-center">
          <MagnifyingGlassIcon class="w-4 h-4" />
        </span>
        <input
          :value="searchQuery"
          @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Buscar en la tabla..."
          class="w-full pl-10 pr-8 py-2 bg-[#F4F1FA]/50 border border-[#BDCEE5]/60 rounded-xl text-xs sm:text-sm text-[#032C49] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#81299A]/30 focus:border-[#81299A] transition-all"
        />
        <button
          v-if="searchQuery"
          @click="emit('update:searchQuery', '')"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
        >
          <XMarkIcon class="h-3.5 w-3.5" />
        </button>
      </div>

      <!-- Filtro por Rango de Fechas -->
      <div v-if="features?.dateRangeFilter" class="flex items-center gap-2 flex-wrap">
        <div class="relative flex items-center">
          <span class="absolute left-2.5 text-gray-400 pointer-events-none">
            <CalendarDaysIcon class="h-3.5 w-3.5" />
          </span>
          <input
            :value="startDate"
            @input="emit('update:startDate', ($event.target as HTMLInputElement).value)"
            type="date"
            class="pl-8 pr-2 py-1.5 bg-[#F4F1FA]/50 border border-[#BDCEE5]/60 rounded-xl text-xs text-[#032C49] focus:outline-none focus:ring-1 focus:ring-[#81299A]"
            title="Fecha inicio"
          />
        </div>
        <span class="text-xs text-gray-400">a</span>
        <input
          :value="endDate"
          @input="emit('update:endDate', ($event.target as HTMLInputElement).value)"
          type="date"
          class="px-2 py-1.5 bg-[#F4F1FA]/50 border border-[#BDCEE5]/60 rounded-xl text-xs text-[#032C49] focus:outline-none focus:ring-1 focus:ring-[#81299A]"
          title="Fecha fin"
        />
      </div>
    </div>

    <!-- Acciones secundarias (Exportar, Visibilidad de Columnas, Custom Slot) -->
    <div class="flex items-center justify-end gap-2.5 shrink-0">
      <slot name="toolbar-actions" />

      <!-- Dropdown Visibilidad de Columnas -->
      <ColumnVisibilityDropdown
        v-if="features?.columnVisibility !== false"
        :columns="columns"
        @toggle="(key) => emit('toggleColumn', key)"
      />

      <!-- Botón Exportar Excel -->
      <button
        v-if="features?.exportExcel !== false"
        type="button"
        @click="emit('export')"
        class="p-2.5 rounded-xl border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors cursor-pointer inline-flex items-center gap-2 text-sm font-medium"
        title="Exportar registros filtrados a CSV/Excel"
      >
        <ArrowDownTrayIcon class="h-4 w-4 text-emerald-600" />
        <span class="hidden sm:inline">Exportar</span>
      </button>
    </div>
  </div>
</template>

