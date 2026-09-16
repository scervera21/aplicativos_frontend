<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
	<section class="flex items-center h-full p-16 dark:bg-gray-50 dark:text-gray-800">
		<div class="container flex flex-col items-center justify-center px-5 mx-auto my-8">
			<div class="max-w-md text-center">
				<h2 class="mb-8 font-extrabold text-9xl dark:text-gray-400">
					<span class="sr-only">Error</span>404
				</h2>
				<p class="text-2xl font-semibold md:text-3xl mb-8">Página no encontrada</p>
				<RouterLink to="/dashboard" tag="button" class="px-8 py-3 font-semibold rounded dark:bg-[#265BC3] dark:text-gray-50 hover:dark:bg-[#2268C2] hover:scale-105 active:scale-95 transition-all duration-200">Volver al inicio</RouterLink>
			</div>
		</div>
	</section>
</template>