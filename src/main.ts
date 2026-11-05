import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Importar las directivas de Tailwind CSS v4 (debe ir primero para ser la base)
import './style.css';

// Importar el archivo principal de SCSS (Arquitectura modular 7-1 SASS que sobrescribe y extiende)
import './assets/scss/main.scss';

// Crear la instancia de la aplicación.
const app = createApp(App)

// Crear la instancia de Pinia.
app.use(createPinia())

// Crear la instancia de Vue Router.
app.use(router)

// Montar la aplicación.
app.mount('#app')
