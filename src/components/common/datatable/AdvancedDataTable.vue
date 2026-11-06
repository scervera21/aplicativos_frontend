<script setup lang="ts">
import { toRef } from 'vue';
import {
  useDataTable,
  type DataTableColumn,
  type DataTableFeatures
} from '@/composables/useDataTable';
import DataTableToolbar from './DataTableToolbar.vue';
import DataTablePagination from './DataTablePagination.vue';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon
} from '@heroicons/vue/24/outline';

interface Props {
  data: any[];
  columns: DataTableColumn[];
  features?: DataTableFeatures;
  loading?: boolean;
  emptyText?: string;
  exportFileName?: string;
  dateField?: string;
  idField?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: 'No se encontraron registros en el sistema.',
  exportFileName: 'datos_sistema',
  idField: 'id',
  dateField: 'created_at',
  features: () => ({
    searchable: true,
    columnVisibility: true,
    exportExcel: true,
    pagination: true,
    selectable: true,
    dateRangeFilter: false,
  }),
});

const dataRef = toRef(props, 'data');

const {
  columns: allColumns,
  visibleColumns,
  toggleColumnVisibility,
  searchQuery,
  startDate,
  endDate,
  sortColumn,
  sortDirection,
  toggleSort,
  currentPage,
  pageSize,
  pageSizes,
  totalPages,
  totalRecords,
  paginatedData,
  isSelected,
  toggleSelectRow,
  allSelected,
  isIndeterminate,
  toggleSelectAll,
  exportToExcel,
} = useDataTable({
  data: dataRef,
  columns: props.columns,
  features: props.features,
  dateField: props.dateField,
  idField: props.idField,
});

defineExpose({
  exportToExcel: () => exportToExcel(props.exportFileName),
  currentPage,
  pageSize,
  totalRecords,
});
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xs border border-[#BDCEE5]/40 overflow-hidden flex flex-col w-full box-border">
    <!-- Barra de Herramientas y Filtros -->
    <DataTableToolbar
      v-model:search-query="searchQuery"
      v-model:start-date="startDate"
      v-model:end-date="endDate"
      :columns="allColumns"
      :features="features"
      :total-records="totalRecords"
      @toggle-column="toggleColumnVisibility"
      @export="exportToExcel(exportFileName)"
    >
      <template #toolbar-actions>
        <slot name="toolbar-actions" />
      </template>
    </DataTableToolbar>

    <!-- Contenedor con Scroll de la Tabla -->
    <div class="w-full overflow-x-auto">
      <!-- Indicador de Carga -->
      <div v-if="loading" class="p-16 text-center text-gray-500 space-y-3">
        <div class="inline-block animate-spin text-3xl text-[#81299A]">⏳</div>
        <p class="text-sm font-medium">Cargando datos desde el servidor...</p>
      </div>

      <!-- Estado Vacío -->
      <div v-else-if="paginatedData.length === 0" class="p-16 text-center text-gray-500 space-y-2">
        <p class="text-base font-semibold text-[#032C49]">Sin registros</p>
        <p class="text-xs">{{ emptyText }}</p>
      </div>

      <!-- Tabla Principal de Datos -->
      <table v-else class="w-full text-left border-collapse min-w-[700px]">
        <thead class="bg-[#F4F1FA] text-[#032C49] uppercase text-xs font-bold border-b border-[#BDCEE5]/40 tracking-wider">
          <tr>
            <!-- Columna de Checkbox Global -->
            <th v-if="features?.selectable" class="px-4 py-4 w-12 text-center">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
                class="h-4 w-4 rounded border-[#BDCEE5] text-[#81299A] focus:ring-[#81299A] cursor-pointer"
                title="Seleccionar todos"
              />
            </th>

            <!-- Cabeceras Dinámicas -->
            <th
              v-for="col in visibleColumns"
              :key="col.key"
              class="px-5 py-3.5 md:px-6 md:py-4 whitespace-nowrap text-xs font-bold transition-colors"
              :class="[
                col.width || '',
                col.sortable !== false ? 'cursor-pointer select-none hover:bg-[#BDCEE5]/20' : '',
                col.align === 'center' || col.key === 'acciones' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
              ]"
              @click="toggleSort(col.key)"
            >
              <div
                class="inline-flex items-center gap-1.5"
                :class="col.align === 'center' || col.key === 'acciones' ? 'justify-center w-full' : col.align === 'right' ? 'justify-end w-full' : 'justify-start'"
              >
                <!-- Slot de Cabecera Personalizado o Label -->
                <slot :name="`header-${col.key}`" :column="col">
                  <span>{{ col.label }}</span>
                </slot>

                <!-- Icono de Ordenamiento -->
                <span v-if="col.sortable !== false" class="text-gray-400">
                  <ChevronUpIcon v-if="sortColumn === col.key && sortDirection === 'asc'" class="h-3.5 w-3.5 text-[#81299A] font-bold" />
                  <ChevronDownIcon v-else-if="sortColumn === col.key && sortDirection === 'desc'" class="h-3.5 w-3.5 text-[#81299A] font-bold" />
                  <ChevronUpDownIcon v-else class="h-3.5 w-3.5 opacity-50" />
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-[#BDCEE5]/30">
          <tr
            v-for="row in paginatedData"
            :key="row[idField]"
            class="hover:bg-[#F4F1FA]/50 transition-colors"
            :class="{ 'bg-[#81299A]/5': features?.selectable && isSelected(row[idField]) }"
          >
            <!-- Checkbox de Fila -->
            <td v-if="features?.selectable" class="px-4 py-3.5 md:py-4 w-12 text-center">
              <input
                type="checkbox"
                :checked="isSelected(row[idField])"
                @change="toggleSelectRow(row[idField])"
                class="h-4 w-4 rounded border-[#BDCEE5] text-[#81299A] focus:ring-[#81299A] cursor-pointer"
              />
            </td>

            <!-- Celdas Dinámicas -->
            <td
              v-for="col in visibleColumns"
              :key="col.key"
              class="px-5 py-3.5 md:px-6 md:py-4 text-sm text-gray-700 align-middle"
              :class="col.align === 'center' || col.key === 'acciones' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'"
            >
              <!-- Slot Dinámico por Columna (#cell-key) -->
              <slot
                :name="`cell-${col.key}`"
                :row="row"
                :value="row[col.key]"
                :column="col"
              >
                {{ row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '—' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación Integrada -->
    <DataTablePagination
      v-if="features?.pagination !== false && totalRecords > 0"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total-pages="totalPages"
      :page-sizes="pageSizes"
      :total-records="totalRecords"
    />
  </div>
</template>

