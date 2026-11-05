<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

interface Props {
  modelValue: string;
  placeholder?: string;
  totalResults?: number;
  resultsLabel?: string;
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar...',
  resultsLabel: 'registros',
});

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <div class="bg-white p-4 md:p-5 rounded-2xl shadow-xs border border-[#BDCEE5]/40 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 box-border">
    <!-- Campo de Búsqueda -->
    <div class="relative flex-1 min-w-0 max-w-xl">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none flex items-center justify-center">
        <MagnifyingGlassIcon class="w-5 h-5" />
      </span>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-11 pr-4 py-2.5 bg-[#F4F1FA]/50 border border-[#BDCEE5]/60 rounded-xl text-sm text-[#032C49] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#81299A]/30 focus:border-[#81299A] transition-all"
      />
    </div>

    <!-- Slotted Filters o Contador de Resultados -->
    <div class="flex items-center justify-between lg:justify-end gap-4 shrink-0">
      <slot name="extra" />

      <div v-if="totalResults !== undefined" class="text-sm font-medium text-gray-600 shrink-0">
        Total: <span class="font-bold text-[#032C49]">{{ totalResults }}</span> {{ resultsLabel }}
      </div>
    </div>
  </div>
</template>

