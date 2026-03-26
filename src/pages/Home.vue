<template>
  <div class="home-wrapper">

    <!-- Fejléc -->
    <div class="home-card">

      <div class="home-header">
        <p class="home-label">IzKalauz</p>
        <h1 class="home-title">Üdvözöl az Íz-kalauz!</h1>
        <p class="home-desc">
          Tervezd meg a heti menüt, mentsd el kedvenc receptjeidet,
          és fedezz fel új ízeket!
        </p>
      </div>

      <!-- Feature kártyák -->
      <div class="feature-grid">
        <div class="feature-item">
          <span class="feature-icon">🍋</span>
          <span class="feature-text">Receptek mentése</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🫑</span>
          <span class="feature-text">Heti menü összeállítása</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🍎</span>
          <span class="feature-text">Vásárlólista készítése</span>
        </div>
      </div>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Bejelentkezett állapot -->
      <section v-if="userEmail" class="user-section">
        <div class="user-badge">
          <span class="user-badge-dot"></span>
          Bejelentkezve: <strong>{{ userEmail }}</strong>
        </div>
        <button class="btn-dark" @click="handleLogout">Kijelentkezés</button>
      </section>

      <!-- Vendég állapot -->
      <section v-else class="guest-section">
        <p class="guest-text">
          Már van fiókod?
        </p>
        <div class="guest-btns">
          <router-link to="/login" class="btn-dark">Bejelentkezés</router-link>
          <router-link to="/register" class="btn-outline">Regisztráció</router-link>
        </div>
      </section>

      <!-- Logo -->
      <div class="logo-wrap" v-if="logo">
        <img :src="logo" alt="IzKalauz logo" class="logo-img" />
      </div>

    </div>
  </div>
</template>

<script>
import { jwtDecode } from 'jwt-decode'
import logo from '@/assets/logo.png'

export default {
  name: 'Home',

  data() {
    return {
      logo,
      userEmail: null
    }
  },

  mounted() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        console.log('Dekódolt token:', decoded)
        this.userEmail =
          decoded.email ||
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
          'Felhasználó'
      } catch (error) {
        console.error('Érvénytelen token:', error)
        localStorage.removeItem('token')
      }
    }
  },

  methods: {
    handleLogout() {
      localStorage.removeItem('token')
      this.userEmail = null
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* ── Oldal wrapper ── */
.home-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 85vh;
  padding: 48px 20px;
}

/* ── Fő kártya ── */
.home-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #e8e8e4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 48px 44px;
  width: 100%;
  max-width: 620px;
  animation: fadeUp 0.5s ease both;
}

/* ── Fejléc ── */
.home-header {
  text-align: center;
  margin-bottom: 36px;
}

.home-label {
  font-size: 0.68rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #FF8C00;
  font-weight: 600;
  margin-bottom: 12px;
}

.home-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
  margin-bottom: 16px;
  background: #ff9e15;
  /*background: linear-gradient(to right, #FF8C00, #FFD700);*/
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.home-desc {
  font-size: 0.95rem;
  color: #656565;
  line-height: 1.75;
  max-width: 420px;
  margin: 0 auto;
}

/* ── Feature kártyák ── */
.feature-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 36px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f5f3;
  border: 1px solid #e8e8e4;
  border-radius: 50px;
  padding: 10px 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: default;
}

.feature-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.07);
}

.feature-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.feature-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #444;
  white-space: nowrap;
}

/* ── Divider ── */
.divider {
  height: 1px;
  background: #e8e8e4;
  margin-bottom: 32px;
}

/* ── Bejelentkezett ── */
.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff8f0;
  border: 1px solid rgba(255, 140, 0, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  font-size: 0.875rem;
  color: #666;
}

.user-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FF8C00;
  flex-shrink: 0;
}

.user-badge strong {
  color: #333;
  font-weight: 600;
}

/* ── Vendég ── */
.guest-section {
  text-align: center;
}

.guest-text {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 16px;
}

.guest-btns {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* ── Gombok ── */
.btn-dark {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 10px 24px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: background 0.2s ease, transform 0.2s ease;
  line-height: 1;
}

.btn-dark:hover {
  background: #FF8C00;
  transform: translateY(-1px);
}

.btn-outline {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 10px 24px;
  border-radius: 50px;
  border: 1.5px solid #dddad4;
  cursor: pointer;
  background: transparent;
  color: #555;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  line-height: 1;
}

.btn-outline:hover {
  border-color: #FF8C00;
  color: #FF8C00;
  transform: translateY(-1px);
}

/* ── Logo ── */
.logo-wrap {
  display: flex;
  justify-content: center;
  margin-top: 36px;
  padding-top: 28px;
  border-top: 1px solid #e8e8e4;
}

.logo-img {
  max-width: 180px;
  border-radius: 16px;
  transition: transform 0.4s ease;
  opacity: 0.9;
}

.logo-img:hover {
  transform: rotate(2deg) scale(1.04);
  opacity: 1;
}

/* ── Animáció ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Reszponzív ── */
@media (max-width: 600px) {
  .home-card {
    padding: 32px 24px;
  }

  .home-title {
    font-size: 2rem;
  }

  .feature-grid {
    flex-direction: column;
    align-items: stretch;
  }

  .feature-item {
    border-radius: 14px;
    padding: 12px 16px;
  }

  .feature-text {
    white-space: normal;
  }
}
</style>