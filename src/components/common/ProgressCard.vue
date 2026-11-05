<script setup lang="ts">
interface ProgressItem {
  id: string | number;
  label: string;
  category?: string;
  percentage: number;
}

interface Props {
  title: string;
  subtitle?: string;
  items: ProgressItem[];
}

defineProps<Props>();

const getStatusColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-emerald-500';
  if (percentage >= 40) return 'bg-[#81299A]';
  return 'bg-[#322CAB]';
};
</script>

<template>
  <div class="progress-card bg-white p-5 md:p-6 rounded-2xl shadow-xs border border-[#BDCEE5]/40 space-y-4">
    <div class="border-b border-[#BDCEE5]/30 pb-3">
      <h3 class="text-base font-bold text-[#032C49]">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
    </div>

    <div v-if="items.length === 0" class="py-6 text-center text-xs text-gray-400 italic">
      Sin datos de progreso disponibles
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in items" :key="item.id" class="space-y-1.5">
        <div class="flex items-center justify-between text-xs font-semibold">
          <span class="text-[#032C49] truncate max-w-[70%]">{{ item.label }}</span>
          <span class="text-[#81299A] font-mono">{{ item.percentage }}%</span>
        </div>
        <div class="w-full bg-[#F4F1FA] h-2 rounded-full overflow-hidden border border-[#BDCEE5]/30">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="getStatusColor(item.percentage)"
            :style="{ width: `${Math.min(Math.max(item.percentage, 0), 100)}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

