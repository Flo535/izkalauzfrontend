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

      // 🧩 Egyszerű validálás
      if (!this.email || !this.password || !this.confirmPassword) {
        this.error = 'Kérlek tölts ki minden mezőt.'
        return
      }

      if (this.password.length < 6) {
        this.error = 'A jelszónak legalább 6 karakter hosszúnak kell lennie.'
        return
      }

      if (this.password !== this.confirmPassword) {
        this.error = 'A jelszavak nem egyeznek.'
        return
      }

      this.loading = true

      try {
        // 🔹 Axios instance használata (automatikus baseURL + header)
        const response = await api.post('/Auth/register', {
          email: this.email,
          password: this.password
        })

        console.log('✅ Sikeres regisztráció:', response.data)
        this.success = 'Sikeres regisztráció! Átirányítás a bejelentkezéshez...'

        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
      } catch (err) {
        console.error('❌ Regisztrációs hiba:', err.response?.data || err.message)
        this.error =
          err.response?.data?.message ||
          'Regisztráció sikertelen. Lehet, hogy ez az email már használatban van.'
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
      <h2>Regisztráció</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" id="email" placeholder="pl. pelda@email.com" required />
        </div>

        <div class="form-group">
          <label for="password">Jelszó:</label>
          <input type="password" v-model="password" id="password" required />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Jelszó megerősítése:</label>
          <input type="password" v-model="confirmPassword" id="confirmPassword" required />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Folyamatban...' : 'Regisztráció' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
</style>



