<template>
  <div class="home-container">
    <!-- Nyitó tartalom -->
    <section class="intro-section">
      
      <h1>Üdvözöl az Íz-kalauz!</h1>

      <p>
        Tervezd meg a heti menüt, mentsd el kedvenc receptjeidet, és fedezz fel új ízeket!
      </p>
      
      <ul class="feature-list">
        <li>
          <span class="check check-yellow">🍋</span>
          <span class="text">Receptek mentése</span>
        </li>
        <li>
          <span class="check check-orange">🫑</span>
          <span class="text">Heti menü összeállítása</span>
        </li>
        <li>
          <span class="check check-green">🍎</span>
          <span class="text">Vásárlólista készítése</span>
        </li>
      </ul>

      <!-- Logo -->
      <img :src="logo" alt="Logo" class="logo-image" />
    </section>

    <!-- Feltételes tartalom -->
    <section v-if="userEmail" class="user-section">
      <p>Be vagy jelentkezve mint <strong>{{ userEmail }}</strong>.</p>
      <button @click="handleLogout">Kijelentkezés</button>
    </section>

    <section v-else class="guest-section">
      <p>
        <router-link to="/login">Jelentkezz be</router-link>
        vagy
        <router-link to="/register">regisztrálj</router-link>,
        hogy elkezdhesd az utazást az ízek világába!
      </p>
    </section>
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
        this.userEmail = decoded.email
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

.home-container {
  max-width: 800px;
  margin: 60px auto;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0,0,0,0.15);
  text-align: center;
  backdrop-filter: blur(2px);
  background: linear-gradient(135deg, rgba(255,200,120,0.2) 0%, rgba(255,220,150,0.2) 100%);
}

/* 🔥 Narancs–arany átmenetes cím + fade-in + pulzálás */
.intro-section h1 {
  font-family: 'Playfair Display', serif;
  font-size: 2.4rem;
  background: linear-gradient(to right, #ff8c00, #ffbb33, #ffcc66);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;

  opacity: 0;
  animation: fadeIn 2s ease forwards, pulse 4s ease-in-out infinite;
}

/* Fade-in */
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Finom pulzálás */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.intro-section p {
  font-size: 18px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.feature-list li {
  display: flex;
  align-items: center;
  min-width: 240px;
}

.check {
  font-size: 20px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

/* Színek */
.check-orange { color: #ff6a00 !important; }
.check-green  { color: #28a745 !important; }
.check-yellow { color: #f7dc6f !important; }

/* Hover */
.check:hover {
  transform: scale(1.3) rotate(-10deg);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
}

.text {
  color: #2c3e50;
  font-weight: 500;
  font-size: 16px;
}

.logo-image {
  max-width: 300px;
  height: auto;
  margin: 25px auto 0;
  display: block;
  filter: drop-shadow(0 4px 10px rgba(255, 106, 0, 0.5));
  border-radius: 12px;
  background-color: #ffffffcc;
  padding: 10px;
}

.user-section,
.guest-section {
  margin-top: 30px;
}

button {
  margin-top: 15px;
  padding: 10px 25px;
  background: linear-gradient(to right, #ff6a00, #ee0979);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

button:hover {
  background: linear-gradient(to right, #ee0979, #ff6a00);
  transform: scale(1.05);
}
</style>
