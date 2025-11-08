<template>
  <div class="register-form">
    <h2>Regisztráció</h2>

    <form @submit.prevent="registerUser">
      <div class="form-group">
        <label for="name">Név</label>
        <input v-model="name" id="name" type="text" required />
      </div>

      <div class="form-group">
        <label for="email">E-mail</label>
        <input v-model="email" id="email" type="email" required />
      </div>

      <div class="form-group">
        <label for="password">Jelszó</label>
        <input v-model="password" id="password" type="password" required />
      </div>

      <button type="submit" class="btn">Regisztráció</button>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'RegisterForm',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      successMessage: '',
      errorMessage: ''
    }
  },
  methods: {
    async registerUser() {
      try {
        const response = await api.post('/register', {
          name: this.name,
          email: this.email,
          password: this.password
        })

        this.successMessage = 'Sikeres regisztráció! Most bejelentkezhetsz.'
        this.errorMessage = ''

        setTimeout(() => this.$router.push('/login'), 1500)
      } catch (error) {
        console.error('Register error:', error)
        this.errorMessage = 'Hiba történt a regisztráció során!'
        this.successMessage = ''
      }
    }
  }
}
</script>

<style scoped>
.register-form {
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

.success {
  color: green;
  margin-top: 10px;
  text-align: center;
}
</style>
