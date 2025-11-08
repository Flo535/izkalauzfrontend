// src/axios.js
import axios from 'axios'
import router from './router'

// 🔹 Axios példány létrehozása
const api = axios.create({
  baseURL: '/api', //  proxy-n keresztül megy, nem közvetlenül
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔹 Globális kérés számláló (loading kezeléshez)
let activeRequests = 0

const showLoading = () => document.body.classList.add('loading')
const hideLoading = () => document.body.classList.remove('loading')

// 🔹 Token automatikus hozzáadása
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 🔹 Hiba kezelés
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn('⛔ Token lejárt vagy érvénytelen. Kijelentkeztetés...')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (!error.response) {
      alert('⚠️ A szerver nem válaszol. Kérlek próbáld meg később.')
    }
    return Promise.reject(error)
  }
)

export default api

