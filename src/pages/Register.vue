<template>
  <div class="register-page">

    <div class="register-card">

      <!-- Fejléc -->
      <div class="card-header">
        <p class="page-label">IzKalauz</p>
        <h2 class="page-title">Regisztráció</h2>
        <p class="page-subtitle">Hozz létre egy új fiókot</p>
      </div>

      <!-- Üzenetek -->
      <div v-if="error" class="msg msg-error">{{ error }}</div>
      <div v-if="success" class="msg msg-success">{{ success }}</div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="register-form">

        <div class="form-group">
          <label class="form-label">Email cím</label>
          <input
            type="email"
            v-model="email"
            placeholder="pelda@email.com"
            class="form-input"
            name="regEmailText"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Jelszó</label>
          <input
            type="password"
            v-model="password"
            placeholder="Legalább 6 karakter"
            class="form-input"
            name="regPswText1"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Jelszó megerősítése</label>
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="Jelszó újra"
            class="form-input"
            name="regPswText2"
            required
          />
        </div>

        <button type="submit" class="btn-submit" name="regSubmitBtn" :disabled="loading">
          {{ loading ? '⏳ Feldolgozás...' : 'Fiók létrehozása' }}
        </button>

      </form>

      <!-- Lábléc -->
      <div class="card-footer">
        <p>Már van fiókod?
          <router-link to="/login" class="footer-link">Jelentkezz be!</router-link>
        </p>
      </div>

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
        this.error = 'Kérlek tölts ki minden mezőt.'
        return
      }
      if (this.password.length < 6) {
        this.error = 'A jelszó túl rövid (min. 6 karakter).'
        return
      }
      if (this.password !== this.confirmPassword) {
        this.error = 'A két jelszó nem egyezik.'
        return
      }

      this.loading = true
      try {
        await api.post('/Auth/register', { email: this.email, password: this.password })
        this.success = '✅ Sikeres regisztráció! Átirányítás...'
        setTimeout(() => this.$router.push('/login'), 2000)
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
/* ── Oldal ── */
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 24px;
  box-sizing: border-box;
}

/* ── Kártya ── */
.register-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 24px;
  border: 1px solid #e8e8e4;
  padding: 40px 36px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

/* ── Fejléc ── */
.card-header {
  text-align: center;
  margin-bottom: 28px;
}

.page-label {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #FF8C00;
  font-weight: 600;
  margin-bottom: 8px;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.9rem;
  font-weight: 600;
  margin: 0 0 6px;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 0.88rem;
  color: #999;
  margin: 0;
}

/* ── Üzenetek ── */
.msg {
  padding: 11px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.msg-error {
  background: #fee;
  border: 1.5px solid #fcc;
  color: #e74c3c;
}

.msg-success {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  color: #16a34a;
}

/* ── Form ── */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #888;
}

.form-input {
  width: 100%;
  padding: 11px 16px;
  border-radius: 12px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.9rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  background: #fff;
}

/* ── Gomb ── */
.btn-submit {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 13px;
  border-radius: 50px;
  border: none;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  width: 100%;
  margin-top: 6px;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  line-height: 1;
}

.btn-submit:hover:not(:disabled) {
  background: #FF8C00;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(255, 140, 0, 0.3);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Lábléc ── */
.card-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e4;
  font-size: 0.875rem;
  color: #999;
}

.card-footer p {
  margin: 0;
}

.footer-link {
  color: #FF8C00;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #d97000;
  text-decoration: underline;
}

/* ── Reszponzív ── */
@media (max-width: 480px) {
  .register-card {
    padding: 28px 20px;
    border-radius: 20px;
  }

  .page-title {
    font-size: 1.6rem;
  }
}
</style>