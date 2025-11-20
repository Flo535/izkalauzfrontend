<template>
  <div class="login-page">
    <h2>Bejelentkezés</h2>
    <form @submit.prevent="loginUser">
      <div class="form-group">
        <label>Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label>Jelszó:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit">Bejelentkezés</button>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { setAuth } from '../auth.js'

export default {
  setup() {
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const errorMsg = ref('')

    const loginUser = async () => {
      try {
        const res = await axios.post('/api/Auth/Login', { email: email.value, password: password.value })
        const token = res.data.token
        setAuth(token, email.value)
        router.push('/')
      } catch {
        errorMsg.value = 'Hibás bejelentkezés'
      }
    }

    return { email, password, errorMsg, loginUser }
  }
}
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 120px auto;
  padding: 24px;
  background: rgba(255,253,245,0.95);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h2 { text-align: center; margin-bottom: 20px; }

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

input {
  padding: 8px;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4b3b2e;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.error { color: red; margin-top: 8px; text-align: center; }
</style>
