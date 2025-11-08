// src/axios.js
import axios from 'axios'
import router from './router'

// 🔹 Axios példány létrehozása
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:5150/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔹 Globális kérés számláló (loading kezeléshez)
let activeRequests = 0

const showLoading = () => document.body.classList.add('loading')
const hideLoading = () => document.body.classList.remove('loading')

// ====================
// 🔹 REQUEST INTERCEPTOR
// ====================
api.interceptors.request.use(config => {
  activeRequests++
  showLoading()

  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ====================
// 🔹 RESPONSE INTERCEPTOR
// ====================
api.interceptors.response.use(
  response => {
    activeRequests--
    if (activeRequests === 0) hideLoading()
    return response
  },
  error => {
    activeRequests--
    if (activeRequests === 0) hideLoading()

    if (!error.response) {
      console.warn('⚠️ A backend nem elérhető.')
      alert('A szerver nem válaszol. Kérlek próbáld meg később.')
    } else if (error.response.status === 401) {
      console.warn('⛔ Token lejárt vagy érvénytelen. Kijelentkeztetés...')
      localStorage.removeItem('token')
      router.push('/login')
      alert('A munkamenet lejárt. Kérlek, jelentkezz be újra!')
    } else if (error.response.status >= 500) {
      alert('Szerverhiba történt. Próbáld újra később.')
    }

    return Promise.reject(error)
  }
)

export default api
