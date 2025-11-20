import { reactive } from 'vue'

export const authState = reactive({
  token: localStorage.getItem('token') || null,
  userEmail: localStorage.getItem('userEmail') || null,

  get isLoggedIn() {
    return !!this.token
  },

  get isAdmin() {
    if (!this.token) return false
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]))
      return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?.toLowerCase() === 'admin'
    } catch {
      return false
    }
  }
})

export function setAuth(token, email) {
  authState.token = token
  authState.userEmail = email
  localStorage.setItem('token', token)
  localStorage.setItem('userEmail', email)
}

export function clearAuth() {
  authState.token = null
  authState.userEmail = null
  localStorage.removeItem('token')
  localStorage.removeItem('userEmail')
}
