<script setup lang="ts">
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline';
import ModuleHeader from '@/components/common/ModuleHeader.vue';
</script>

<template>
  <div class="space-y-6 md:space-y-8">
    <!-- Encabezado del Módulo -->
    <ModuleHeader
      title="Actividades"
      subtitle="Planificación, seguimiento y porcentaje de avance de actividades."
      :icon="ClipboardDocumentListIcon"
    />

    <!-- Contenido en desarrollo Normalizado -->
    <div class="bg-white p-12 md:p-16 rounded-2xl shadow-xs border border-[#BDCEE5]/40 text-center space-y-4 max-w-3xl mx-auto">
      <div class="inline-flex p-5 bg-[#F4F1FA] rounded-3xl text-[#81299A] ring-1 ring-[#81299A]/20 mb-2">
        <ClipboardDocumentListIcon class="h-12 w-12" />
      </div>
      <h2 class="text-xl md:text-2xl font-bold text-[#032C49]">Módulo de Actividades en desarrollo</h2>
      <p class="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
        Aquí se gestionarán los cronogramas, ponderaciones y estados de las actividades por aplicativo.
      </p>
    </div>
  </div>
</template>

