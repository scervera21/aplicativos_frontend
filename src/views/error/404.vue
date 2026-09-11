<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
    <div class="container">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <RouterLink to="/dashboard" tag="button" class="btn">Volver al inicio</RouterLink>
    </div>
</template>

<style scoped>
.btn {
    padding: 10px 20px;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: #0056b3;
    border: 1px solid #0056b3;
}

h1 {
    color: #007bff;
}

h2 {
    color: #007bff;
}

.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
</style>