<template>
  <div class="form-wrapper fade-in">
    <div class="form-container glass-box-orange">
      <h2 class="form-title">📝 Regisztráció</h2>
      
      <form @submit.prevent="handleRegister" class="styled-form">
        <div class="form-group">
          <label>Email cím:</label>
          <input type="email" v-model="email" placeholder="pelda@email.com" required />
        </div>
        
        <div class="form-group">
          <label>Jelszó:</label>
          <input type="password" v-model="password" placeholder="Legalább 6 karakter" required />
        </div>
        
        <div class="form-group">
          <label>Jelszó megerősítése:</label>
          <input type="password" v-model="confirmPassword" placeholder="Jelszó újra" required />
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '⏳ Feldolgozás...' : 'Fiók létrehozása' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Már van fiókod? <router-link to="/login" class="link">Jelentkezz be!</router-link></p>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>
      <p v-if="success" class="success-msg">{{ success }}</p>
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
      
      if (!this.email || !this.password || !this.confirmPassword) { 
        this.error = 'Kérlek tölts ki minden mezőt.'; 
        return 
      }
      if (this.password.length < 6) { 
        this.error = 'A jelszó túl rövid (min. 6 karakter).'; 
        return 
      }
      if (this.password !== this.confirmPassword) { 
        this.error = 'A két jelszó nem egyezik.'; 
        return 
      }

      this.loading = true
      try {
        await api.post('/Auth/register', { email: this.email, password: this.password })
        this.success = 'Sikeres regisztráció! Átirányítás...'
        setTimeout(() => { this.$router.push('/login') }, 2000)
      } catch (err) {
        this.error = err.response?.data?.message || 'Regisztráció sikertelen.'
      } finally { 
        this.loading = false 
      }
    }
  }
}
</script>

<style scoped>
.form-wrapper { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  min-height: 80vh; 
  padding: 20px;
}

.glass-box-orange {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.25), rgba(255, 165, 0, 0.05));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.form-title {
  text-align: center;
  font-weight: bold;
  font-size: 1.8rem;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 25px;
}

.form-group { margin-bottom: 18px; }

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 140, 0, 0.2);
  background: rgba(255, 255, 255, 0.8);
  outline: none;
  transition: 0.3s;
}

input:focus {
  border-color: #FF8C00;
  background: white;
  box-shadow: 0 0 10px rgba(255, 140, 0, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #FF8C00, #FF4500);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 69, 0, 0.3);
}

.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 0.9rem;
  color: #666;
}

.link { color: #FF8C00; font-weight: bold; text-decoration: none; }
.link:hover { text-decoration: underline; }

.error-msg { color: #e74c3c; text-align: center; margin-top: 15px; font-weight: bold; }
.success-msg { color: #27ae60; text-align: center; margin-top: 15px; font-weight: bold; }

.fade-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; }
}
</style>