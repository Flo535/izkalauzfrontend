// src/services/api.js
import axios from 'axios'
import router from '@/router'

// Alap URL dinamikusan környezet alapján
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/Recept`
  : '/api/Recept'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// === 🔐 Token hozzáadása minden kéréshez ===
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// === ⚙️ Hibakezelés minden válaszra ===
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // hálózati hiba vagy a szerver nem válaszol
      alert('Nem sikerült elérni a szervert. Ellenőrizd az internetkapcsolatot.')
      return Promise.reject(error)
    }

    const status = error.response.status

    // 401 = jogosulatlan → kijelentkeztetjük a felhasználót
    if (status === 401) {
      localStorage.removeItem('token')
      alert('A bejelentkezés lejárt, jelentkezz be újra!')
      router.push('/login')
    }

    // 403 = nincs jogosultság
    else if (status === 403) {
      alert('Ehhez a művelethez nincs jogosultságod.')
    }

    // 404 = nem található
    else if (status === 404) {
      console.warn('A kért erőforrás nem található:', error.config.url)
    }

    // 500 = szerverhiba
    else if (status >= 500) {
      alert('Szerverhiba történt. Próbáld meg később újra.')
    }

    return Promise.reject(error)
  }
)

export default api
