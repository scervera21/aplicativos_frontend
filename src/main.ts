import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Importar el archivo principal de SCSS (Arquitectura modular 7-1 SASS)
import './assets/scss/main.scss';

// Importar las directivas de Tailwind CSS v3 (@tailwind base; components; utilities;)
import './style.css';

// Crear la instancia de la aplicación.
const app = createApp(App)

// Crear la instancia de Pinia.
app.use(createPinia())

// Crear la instancia de Vue Router.
app.use(router)

// Montar la aplicación.
app.mount('#app')
