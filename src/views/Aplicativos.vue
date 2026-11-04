<script setup lang="ts">
import { ComputerDesktopIcon } from '@heroicons/vue/24/outline';
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado del Módulo -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-[#BDCEE5]/40 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-[#F4F1FA] rounded-full text-[#81299A]">
          <ComputerDesktopIcon class="h-8 w-8" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-[#032C49]">Aplicativos</h1>
          <p class="text-sm text-gray-500">Catálogo general de sistemas y aplicaciones institucionales.</p>
        </div>
      </div>
    </div>

    <!-- Contenido en desarrollo -->
    <div class="bg-white p-12 rounded-xl shadow-sm border border-[#BDCEE5]/40 text-center space-y-4">
      <div class="inline-flex p-4 bg-[#F4F1FA] rounded-full text-[#81299A]">
        <ComputerDesktopIcon class="h-12 w-12" />
      </div>
      <h2 class="text-xl font-bold text-[#032C49]">Módulo de Aplicativos en desarrollo</h2>
      <p class="text-gray-500 max-w-md mx-auto text-sm">
        Aquí se gestionarán los detalles técnicos, lenguajes, bases de datos y responsables de cada aplicativo.
      </p>
    </div>
  </div>
</template>