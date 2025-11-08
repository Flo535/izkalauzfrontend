<template>
  <div class="login-form">
    <h2>Bejelentkezés</h2>

    <form @submit.prevent="loginUser">
      <div class="form-group">
        <label for="email">E-mail</label>
        <input v-model="email" type="email" id="email" required />
      </div>

      <div class="form-group">
        <label for="password">Jelszó</label>
        <input v-model="password" type="password" id="password" required />
      </div>

      <button type="submit" class="btn">Bejelentkezés</button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''
    }
  },
  methods: {
    async loginUser() {
      try {
        const response = await api.post('/login', {
          email: this.email,
          password: this.password
        })

        // Feltételezzük, hogy a backend visszaad egy token-t:
        // { token: "...", user: {...} }
        localStorage.setItem('token', response.data.token)
        this.$router.push('/') // sikeres bejelentkezés után átirányít

      } catch (error) {
        console.error('Login error:', error)
        this.errorMessage = 'Hibás e-mail vagy jelszó!'
      }
    }
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.btn:hover {
  background-color: #34495e;
}

.error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>
