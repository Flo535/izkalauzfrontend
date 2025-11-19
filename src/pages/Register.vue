<template>
  <div class="form-wrapper">
    <div class="form-container glass-box">
      <h2>Regisztráció</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Jelszó:</label>
          <input type="password" v-model="password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Jelszó megerősítése:</label>
          <input type="password" v-model="confirmPassword" required />
        </div>
        <button type="submit" :disabled="loading">{{ loading ? 'Folyamatban...' : 'Regisztráció' }}</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'Register',
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      error: null,
      success: null,
      loading: false
    }
  },
  methods: {
    async handleRegister() {
      this.error = null
      this.success = null
      if (!this.email || !this.password || !this.confirmPassword) { this.error = 'Kérlek tölts ki minden mezőt.'; return }
      if (this.password.length < 6) { this.error = 'A jelszó túl rövid.'; return }
      if (this.password !== this.confirmPassword) { this.error = 'Jelszavak nem egyeznek.'; return }

      this.loading = true
      try {
        const response = await api.post('/Auth/register', { email: this.email, password: this.password })
        this.success = 'Sikeres regisztráció! Átirányítás a bejelentkezéshez...'
        setTimeout(() => { this.$router.push('/login') }, 2000)
      } catch (err) {
        this.error = err.response?.data?.message || 'Regisztráció sikertelen.'
      } finally { this.loading = false }
    }
  }
}
</script>

<style scoped>
.form-wrapper { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
.form-container { width: 100%; max-width: 400px; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); background: rgba(255,255,255,0.65); backdrop-filter: blur(8px); }
input { width: 100%; padding: 10px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #ccc; }
button { width: 100%; padding: 10px; background: #f39c12; color: white; border: none; border-radius: 8px; cursor: pointer; }
.error { color: red; text-align: center; margin-top: 10px; }
.success { color: green; text-align: center; margin-top: 10px; }
</style>
      