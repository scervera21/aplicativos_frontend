<script setup lang="ts">
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/vue/24/outline';

interface Props {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizes: number[];
  totalRecords: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
}>();

const startIndex = () => {
  if (props.totalRecords === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
};

const endIndex = () => {
  return Math.min(props.currentPage * props.pageSize, props.totalRecords);
};
</script>

<template>
  <div class="p-4 md:p-5 bg-white border-t border-[#BDCEE5]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs md:text-sm text-gray-600 box-border">
    <!-- Información de conteo y selector de filas -->
    <div class="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
      <span>
        Mostrando <strong class="text-[#032C49] font-mono">{{ startIndex() }}</strong> a
        <strong class="text-[#032C49] font-mono">{{ endIndex() }}</strong> de
        <strong class="text-[#032C49] font-mono">{{ totalRecords }}</strong> registros
      </span>

      <div class="flex items-center gap-1.5 pl-2 border-l border-gray-200">
        <label for="page-size" class="text-xs text-gray-500">Filas:</label>
        <select
          id="page-size"
          :value="pageSize"
          @change="emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))"
          class="px-2 py-1 bg-[#F4F1FA] border border-[#BDCEE5]/60 rounded-lg text-xs font-semibold text-[#032C49] focus:outline-none focus:ring-1 focus:ring-[#81299A]"
        >
          <option v-for="size in pageSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>

    <!-- Navegación de páginas -->
    <div class="flex items-center gap-1">
      <button
        type="button"
        @click="emit('update:currentPage', 1)"
        :disabled="currentPage === 1"
        class="p-1.5 rounded-lg border border-[#BDCEE5]/50 text-gray-600 hover:bg-[#F4F1FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Primera página"
      >
        <ChevronDoubleLeftIcon class="h-4 w-4" />
      </button>

      <button
        type="button"
        @click="emit('update:currentPage', currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-1.5 rounded-lg border border-[#BDCEE5]/50 text-gray-600 hover:bg-[#F4F1FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Página anterior"
      >
        <ChevronLeftIcon class="h-4 w-4" />
      </button>

      <span class="px-3 py-1 font-mono font-medium text-xs text-[#032C49]">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <button
        type="button"
        @click="emit('update:currentPage', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="p-1.5 rounded-lg border border-[#BDCEE5]/50 text-gray-600 hover:bg-[#F4F1FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Página siguiente"
      >
        <ChevronRightIcon class="h-4 w-4" />
      </button>

      <button
        type="button"
        @click="emit('update:currentPage', totalPages)"
        :disabled="currentPage === totalPages"
        class="p-1.5 rounded-lg border border-[#BDCEE5]/50 text-gray-600 hover:bg-[#F4F1FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Última página"
      >
        <ChevronDoubleRightIcon class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

