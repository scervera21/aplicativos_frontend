<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

// Definición de propiedades (Props)
interface Props {
  isOpen: boolean;
  title: string;
}

const props = defineProps<Props>();

// Definición de eventos (Emits)
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const closeModal = () => {
  emit('close');
};

// Cerrar modal al presionar la tecla ESC
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-container">
        
        <!-- Cabecera del Modal -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#BDCEE5]">
          <h3 class="text-lg font-bold text-[#032C49]">{{ title }}</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-[#032C49] transition-colors focus:outline-none cursor-pointer"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Cuerpo del Modal (Contenido dinámico mediante Slot) -->
        <div class="p-6 max-h-[80vh] overflow-y-auto">
          <slot />
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Transiciones suaves de apertura y cierre para el modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.25s ease-out;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95);
}
</style>