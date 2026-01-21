// src/services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: '/api', // ✅ A Vite proxy-n keresztül hívja a backendet
  headers: {
    'Content-Type': 'application/json'
  }
})

// Teszt request (opcionális)
export async function pingServer() {
  try {
    const response = await api.get('/recipes/ping')
    console.log('✅ Backend kapcsolat rendben:', response.data)
  } catch (err) {
    console.error('❌ Backend nem elérhető:', err.message)
  }
}

export default api
