<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: Component;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'purple' | 'blue' | 'navy' | 'emerald';
}

withDefaults(defineProps<Props>(), {
  colorScheme: 'purple',
});
</script>

<template>
  <div class="metric-card bg-white p-5 md:p-6 rounded-2xl shadow-xs border border-[#BDCEE5]/40 hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-bold uppercase tracking-wider text-gray-500">{{ title }}</span>
      <div
        v-if="icon"
        class="p-2.5 rounded-xl flex items-center justify-center"
        :class="{
          'bg-[#F4F1FA] text-[#81299A]': colorScheme === 'purple',
          'bg-blue-50 text-[#322CAB]': colorScheme === 'blue',
          'bg-slate-100 text-[#032C49]': colorScheme === 'navy',
          'bg-emerald-50 text-emerald-600': colorScheme === 'emerald'
        }"
      >
        <component :is="icon" class="h-6 w-6" />
      </div>
    </div>

    <div class="flex items-baseline gap-2">
      <span class="text-2xl md:text-3xl font-extrabold text-[#032C49]">{{ value }}</span>
      <span
        v-if="trend"
        class="text-xs font-semibold px-2 py-0.5 rounded-full"
        :class="trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
      >
        {{ trend.isPositive ? '↑' : '↓' }} {{ trend.value }}
      </span>
    </div>

    <p v-if="subtitle" class="mt-2 text-xs text-gray-500 font-medium">
      {{ subtitle }}
    </p>
  </div>
</template>

