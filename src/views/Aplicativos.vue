<script setup lang="ts">

</script>

<template>
    <div class="container">
        <h1>Aplicativos</h1>
        <p>En desarrollo...</p>
        <RouterLink to="/dashboard" tag="button" class="btn">Volver al inicio</RouterLink>
    </div>
</template>

<style scoped>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }
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
</style>