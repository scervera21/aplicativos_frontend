<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  title: string;
  subtitle?: string;
  icon?: Component;
}

defineProps<Props>();
</script>

<template>
  <div class="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-[#BDCEE5]/40 flex flex-col md:flex-row md:items-center md:justify-between gap-6 box-border">
    <!-- Bloque de Identidad del Módulo -->
    <div class="flex items-start md:items-center gap-4 min-w-0">
      <div v-if="icon" class="p-3.5 bg-[#F4F1FA] rounded-2xl text-[#81299A] ring-1 ring-[#81299A]/20 shrink-0 flex items-center justify-center">
        <component :is="icon" class="h-8 w-8" />
      </div>
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl md:text-3xl font-extrabold text-[#032C49] tracking-tight truncate">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-1 leading-relaxed">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Área de Acciones Dinámicas (Botones, Filtros) -->
    <div v-if="$slots.actions" class="flex items-center gap-3 shrink-0 flex-wrap">
      <slot name="actions" />
    </div>
  </div>
</template>

