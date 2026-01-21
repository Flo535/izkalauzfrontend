import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import api from './axios' // 🔹 importáljuk a globális axios beállítást

const app = createApp(App)

// 🔹 Hozzáadjuk az axios-t globálisan, így minden komponensben elérhető lesz this.$api néven
app.config.globalProperties.$api = api

app.use(router)
app.mount('#app')
