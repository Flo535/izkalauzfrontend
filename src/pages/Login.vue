<script>
import axios from 'axios'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      error: null,
      success: null,
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.error = null
      this.success = null

      if (!this.email || !this.password) {
        this.error = 'Kérlek, tölts ki minden mezőt.'
        return
      }

      this.loading = true
      try {
        // 🔹 Proxy-n keresztül a backendhez
        const response = await axios.post('/Auth/login', {
          email: this.email,
          password: this.password
        })

        console.log('✅ Sikeres bejelentkezés:', response.data)
        this.success = 'Sikeres bejelentkezés! Átirányítás...'

        // Például token mentése (ha a backend küld)
        // localStorage.setItem('token', response.data.token)

        // 2 mp múlva irány a főoldal
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
      } catch (err) {
        console.error('❌ Bejelentkezési hiba:', err.response?.data || err.message)
        this.error =
          err.response?.data?.message ||
          'Hibás email vagy jelszó.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<template>
  <div class="form-wrapper">
    <div class="form-container glass-box">
      <h2>Bejelentkezés</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" id="email" placeholder="pl. pelda@email.com" required />
        </div>

        <div class="form-group">
          <label for="password">Jelszó:</label>
          <input type="password" v-model="password" id="password" required />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Bejelentkezés...' : 'Bejelentkezés' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>

      <p class="register-link">
        Nincs még fiókod?
        <router-link to="/register">Regisztrálj itt</router-link>.
      </p>
    </div>
  </div>
</template>

<style scoped>
.form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.form-container {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(8px);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #333;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  transition: 0.3s;
}

input:focus {
  border-color: #f39c12;
  box-shadow: 0 0 5px rgba(243,156,18,0.4);
}

button {
  width: 100%;
  background: #f39c12;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}

button:hover:not(:disabled) {
  background: #e67e22;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  margin-top: 10px;
  text-align: center;
}

.success {
  color: #27ae60;
  margin-top: 10px;
  text-align: center;
}

.register-link {
  text-align: center;
  margin-top: 15px;
  color: #555;
}

.register-link a {
  color: #f39c12;
  font-weight: bold;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
