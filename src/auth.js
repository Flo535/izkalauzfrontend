import { reactive } from 'vue'

export const authState = reactive({
  token: localStorage.getItem('token') || null,
  userEmail: localStorage.getItem('userEmail') || null,

  get isLoggedIn() { 
    return !!this.token 
  },

  get isAdmin() {
    if (!this.token) return false;
    try {
      // A token középső része (payload) tartalmazza az adatokat
      const base64Url = this.token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Biztonságos base64 dekódolás
      const payload = JSON.parse(window.atob(base64));
      
      // A backend 'role' kulccsal küldi a Claim-et
      const role = payload["role"];
      
      return role === 'Admin' || role === 'admin';
    } catch (e) {
      console.error("Token dekódolási hiba:", e);
      return false;
    }
  }
})

export function setAuth(token, email) {
  authState.token = token;
  authState.userEmail = email;
  localStorage.setItem('token', token);
  localStorage.setItem('userEmail', email);
}

export function clearAuth() {
  authState.token = null;
  authState.userEmail = null;
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  // Opcionális: ilyenkor érdemes a kezdőlapra irányítani a júzert
  window.location.href = '/'; 
}