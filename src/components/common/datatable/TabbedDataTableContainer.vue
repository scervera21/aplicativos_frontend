<script setup lang="ts">
import type { TabItem } from '@/composables/useTabbedDataTable';

interface Props {
  tabs: TabItem[];
  activeTabKey: string;
  darkInactiveTabs?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  darkInactiveTabs: true,
});

const emit = defineEmits<{
  (e: 'change-tab', tabKey: string): void;
}>();

const selectTab = (tabKey: string) => {
  emit('change-tab', tabKey);
};
</script>

<template>
  <div class="tabbed-container w-full flex flex-col">
    <!-- Barra superior de pestañas ajustada exactamente al ancho completo del datatable -->
    <div class="tabs-header w-full flex items-stretch gap-1 sm:gap-2 z-10 overflow-x-auto scrollbar-none">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        @click="selectTab(tab.key)"
        class="tab-item group flex-1 min-w-[150px] sm:min-w-0 flex items-center justify-center gap-2 px-3 py-3 md:px-4 md:py-3.5 rounded-t-2xl font-semibold text-xs md:text-sm transition-all border-t border-x cursor-pointer select-none text-center"
        :class="[
          activeTabKey === tab.key
            ? 'active bg-white text-[#81299A] border-t-2 border-t-[#81299A] border-x border-[#BDCEE5]/60 shadow-xs -mb-[1px] z-20'
            : (darkInactiveTabs
                ? 'inactive bg-[#032C49] text-white/80 hover:text-white hover:bg-[#032C49]/90 border-[#032C49]/40'
                : 'inactive bg-[#F4F1FA]/80 text-gray-500 hover:text-[#032C49] hover:bg-white/70 border-[#BDCEE5]/30'
              )
        ]"
      >
        <component
          v-if="tab.icon"
          :is="tab.icon"
          class="h-4 w-4 shrink-0 transition-colors"
          :class="[
            activeTabKey === tab.key
              ? 'text-[#81299A]'
              : (darkInactiveTabs ? 'text-white/70 group-hover:text-white' : 'text-gray-400 group-hover:text-[#032C49]')
          ]"
        />
        <span class="truncate">{{ tab.label }}</span>

        <!-- Badge de conteo de registros -->
        <span
          v-if="tab.count !== undefined"
          class="px-2 py-0.5 rounded-full text-[11px] font-mono transition-colors shrink-0"
          :class="[
            activeTabKey === tab.key
              ? 'bg-[#F4F1FA] text-[#81299A] font-bold border border-[#81299A]/20'
              : (darkInactiveTabs
                  ? 'bg-white/15 text-white border border-white/20 group-hover:bg-white/25 font-semibold'
                  : 'bg-white/80 text-gray-500 border border-gray-200 group-hover:bg-[#F4F1FA]'
                )
          ]"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Panel de contenido unificado sin doble borde ni márgenes interiores -->
    <div class="tab-content-panel w-full -mt-[1px]">
      <slot />
    </div>
  </div>
</template>

