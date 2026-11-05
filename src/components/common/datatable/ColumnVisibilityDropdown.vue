<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { DataTableColumn } from '@/composables/useDataTable';
import { ViewColumnsIcon } from '@heroicons/vue/24/outline';

interface Props {
  columns: DataTableColumn[];
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'toggle', key: string): void;
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block text-left">
    <button
      type="button"
      @click.stop="toggleDropdown"
      class="p-2.5 rounded-xl border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors cursor-pointer inline-flex items-center gap-2 text-sm font-medium"
      title="Mostrar u ocultar columnas"
    >
      <ViewColumnsIcon class="h-4 w-4 text-[#81299A]" />
      <span class="hidden sm:inline">Columnas</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#BDCEE5]/50 p-3 z-30 space-y-2 animate-in fade-in zoom-in-95 duration-100"
    >
      <div class="text-xs font-bold uppercase tracking-wider text-gray-500 pb-1 border-b border-gray-100">
        Columnas Visibles
      </div>

      <div class="max-h-60 overflow-y-auto space-y-1.5 pt-1">
        <label
          v-for="col in columns.filter(c => c.key !== 'select' && c.key !== 'acciones')"
          :key="col.key"
          class="flex items-center gap-2 text-xs text-[#032C49] hover:bg-[#F4F1FA] p-1.5 rounded-lg cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            :checked="col.visible !== false"
            @change="emit('toggle', col.key)"
            class="h-4 w-4 rounded border-[#BDCEE5] text-[#81299A] focus:ring-[#81299A]"
          />
          <span class="truncate">{{ col.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

