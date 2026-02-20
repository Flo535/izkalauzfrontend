// src/config.js
import axios from 'axios'

// Backend alap URL
const BASE_URL = 'https://localhost:5001'

// Axios példány létrehozása
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: minden kéréshez hozzáadja a Bearer tokent
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// Interceptor: hibák egységes kezelése
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Hálózati hiba
      alert('Hálózati hiba: Nem sikerült csatlakozni a szerverhez.')
    } else if (error.response.status === 401) {
      // Jogosultság hiba
      alert('Nem vagy bejelentkezve, vagy lejárt a token. Kérlek jelentkezz be újra.')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      // Egyéb hibák
      const msg = error.response.data?.message || error.message
      alert('Hiba: ' + msg)
    }
    return Promise.reject(error)
  }
)

export default api
export { BASE_URL }
