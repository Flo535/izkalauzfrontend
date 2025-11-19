<template>
  <div class="login-container">
    <h2>Bejelentkezés</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label for="password">Jelszó:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Bejelentkezés</button>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      errorMsg: ''
    }
  },
  methods: {
    async login() {
      try {
        const response = await api.post('/Auth/Login', { email: this.email, password: this.password })
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('email', this.email)
        this.$router.push('/')
      } catch (err) {
        this.errorMsg = 'Hiba a bejelentkezés során'
      }
    }
  }
}
</script>

<style scoped>
.login-container { max-width: 400px; margin: 100px auto; padding: 24px; background: rgba(255,253,245,0.9); border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
input { width: 100%; padding: 8px; margin-bottom: 12px; border-radius: 4px; border: 1px solid #ccc; }
button { width: 100%; padding: 10px; background-color: #4b3b2e; color: white; border: none; border-radius: 4px; cursor: pointer; }
.error { color: red; margin-top: 8px; }
</style>
