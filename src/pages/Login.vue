<template>
  <div class="login-container">
    <h2>Bejelentkezés</h2>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Jelszó" />
    <button @click="login">Bejelentkezés</button>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return { email: '', password: '', error: null }
  },
  methods: {
    async login() {
      try {
        const res = await axios.post('https://localhost:5150/api/Auth/Login', {
          email: this.email,
          password: this.password
        })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('email', res.data.email)
        this.$router.push('/profile')
      } catch (err) {
        this.error = err.response?.data?.message || 'Hibás bejelentkezés'
      }
    }
  }
}
</script>

<style scoped>
.login-container { max-width: 400px; margin: 100px auto; text-align: center; }
input { display: block; width: 100%; margin: 10px 0; padding: 8px; }
button { padding: 8px 16px; cursor: pointer; }
.error { color: red; margin-top: 10px; }
</style>
