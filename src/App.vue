<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div id="app" class="min-h-screen bg-slate-900 text-slate-100 antialiased font-sans">
    <RouterView /> <!-- Este componente se encarga de renderizar la vista actual -->
  </div>
</template>

<style>
  #app {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    min-height: 100vh;
  }
</style>
