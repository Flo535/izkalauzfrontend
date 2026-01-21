import axios from 'axios'

// Axios példány a proxyhoz
const api = axios.create({
  baseURL: '/api', // proxy-n keresztül megy
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

// Token automatikus hozzáadása
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Globális hiba kezelés
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('⛔ Token lejárt vagy érvénytelen. Kijelentkeztetés...')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (!error.response) {
      alert('⚠️ A szerver nem válaszol. Próbáld meg később.')
    }
    return Promise.reject(error)
  }
)

export default api

