import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Crear la instancia de la aplicación.
const app = createApp(App)

// Crear la instancia de Pinia.
app.use(createPinia())

// Crear la instancia de Vue Router.
app.use(router)

// Montar la aplicación.
app.mount('#app')
