<script setup lang="ts">
import { ChartBarSquareIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline';

interface Props {
  actividadID?: string | number;
}

defineProps<Props>();
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado del Módulo -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-[#BDCEE5]/40 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <RouterLink
          to="/actividades"
          class="p-2.5 rounded-lg border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors"
          title="Regresar a actividades"
        >
          <ArrowLeftIcon class="h-5 w-5" />
        </RouterLink>
        <div class="p-3 bg-[#F4F1FA] rounded-full text-[#81299A]">
          <ChartBarSquareIcon class="h-8 w-8" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-[#032C49]">Project Manager</h1>
          <p class="text-sm text-gray-500">
            Seguimiento de entregables para la actividad <span class="font-semibold text-[#81299A]">#{{ actividadID || 'N/A' }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Contenido en desarrollo -->
    <div class="bg-white p-12 rounded-xl shadow-sm border border-[#BDCEE5]/40 text-center space-y-4">
      <div class="inline-flex p-4 bg-[#F4F1FA] rounded-full text-[#81299A]">
        <ChartBarSquareIcon class="h-12 w-12" />
      </div>
      <h2 class="text-xl font-bold text-[#032C49]">Project Manager en desarrollo</h2>
      <p class="text-gray-500 max-w-md mx-auto text-sm">
        Control de checklist, cálculo automático de ponderaciones y actualización de porcentajes en tiempo real.
      </p>
    </div>
  </div>
</template>

