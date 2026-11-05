<script setup lang="ts">
import { ChartBarSquareIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline';
import ModuleHeader from '@/components/common/ModuleHeader.vue';

interface Props {
  actividadID?: string | number;
}

defineProps<Props>();
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Encabezado del Módulo -->
    <ModuleHeader
      title="Project Manager"
      :subtitle="`Seguimiento de entregables para la actividad #${actividadID || 'N/A'}`"
      :icon="ChartBarSquareIcon"
    >
      <template #actions>
        <RouterLink
          to="/actividades"
          class="p-2.5 rounded-xl border border-[#BDCEE5]/60 hover:bg-[#F4F1FA] text-[#032C49] transition-colors inline-flex items-center gap-2 text-sm font-medium"
          title="Regresar a actividades"
        >
          <ArrowLeftIcon class="h-4 w-4" />
          <span>Volver</span>
        </RouterLink>
      </template>
    </ModuleHeader>

    <!-- Contenido en desarrollo Normalizado -->
    <div class="bg-white p-12 md:p-16 rounded-2xl shadow-xs border border-[#BDCEE5]/40 text-center space-y-4 max-w-3xl mx-auto">
      <div class="inline-flex p-5 bg-[#F4F1FA] rounded-3xl text-[#81299A] ring-1 ring-[#81299A]/20 mb-2">
        <ChartBarSquareIcon class="h-12 w-12" />
      </div>
      <h2 class="text-xl md:text-2xl font-bold text-[#032C49]">Project Manager en desarrollo</h2>
      <p class="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
        Control de checklist, cálculo automático de ponderaciones y actualización de porcentajes en tiempo real.
      </p>
    </div>
  </div>
</template>

