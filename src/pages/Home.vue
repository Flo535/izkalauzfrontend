<template>
  <div class="home-wrapper fade-in">
    <div class="home-container glass-box-orange">
      <section class="intro-section">
        <h1 class="glow-title">Üdvözöl az Íz-kalauz!</h1>

        <p class="description">
          Tervezd meg a heti menüt, mentsd el kedvenc receptjeidet, és fedezz fel új ízeket!
        </p>
        
        <ul class="feature-list">
          <li class="feature-item">
            <span class="emoji-circle">🍋</span>
            <span class="text">Receptek mentése</span>
          </li>
          <li class="feature-item">
            <span class="emoji-circle">🫑</span>
            <span class="text">Heti menü összeállítása</span>
          </li>
          <li class="feature-item">
            <span class="emoji-circle">🍎</span>
            <span class="text">Vásárlólista készítése</span>
          </li>
        </ul>

        <div class="logo-wrapper">
          <img :src="logo" alt="Logo" class="logo-image" />
        </div>
      </section>

      <section v-if="userEmail" class="user-section">
        <div class="user-badge">
          <p>Bejelentkezve: <strong>{{ userEmail }}</strong></p>
        </div>
        <button class="action-btn logout-btn" @click="handleLogout">Kijelentkezés</button>
      </section>

      <section v-else class="guest-section">
        <div class="guest-card">
          <p>
            <router-link to="/login" class="auth-link">Jelentkezz be</router-link>
            vagy
            <router-link to="/register" class="auth-link">regisztrálj</router-link>,
            hogy elkezdhesd az utazást az ízek világába!
          </p>
        </div>
      </section>
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;500;600&display=swap');

.home-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 85vh;
  padding: 20px;
}

.glass-box-orange {
  max-width: 700px;
  width: 100%;
  padding: 50px 40px;
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.25), rgba(255, 165, 0, 0.05));
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 40px rgba(0,0,0,0.1);
  text-align: center;
}

.glow-title {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  background: linear-gradient(to right, #ff8c00, #ffd700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 20px;
  animation: fadeIn 1.5s ease-out forwards;
}

.description {
  font-family: 'Poppins', sans-serif;
  color: #444;
  font-size: 1.1rem;
  margin-bottom: 35px;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 40px;
}

.feature-item {
  background: rgba(255, 255, 255, 0.4);
  padding: 15px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.feature-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.7);
}

.emoji-circle {
  font-size: 1.5rem;
  background: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.logo-wrapper {
  margin-top: 20px;
}

.logo-image {
  max-width: 220px;
  filter: drop-shadow(0 8px 15px rgba(255, 140, 0, 0.3));
  border-radius: 20px;
  padding: 10px;
  transition: 0.5s;
}

.logo-image:hover {
  transform: rotate(3deg) scale(1.05);
}

.user-badge {
  background: rgba(255, 140, 0, 0.1);
  padding: 10px 20px;
  border-radius: 30px;
  display: inline-block;
  margin-bottom: 15px;
  color: #555;
}

.action-btn {
  background: linear-gradient(135deg, #FF8C00, #FF4500);
  color: white;
  border: none;
  padding: 12px 35px;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 4px 15px rgba(255, 69, 0, 0.3);
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 69, 0, 0.4);
}

.guest-card {
  margin-top: 20px;
  font-size: 1.1rem;
}

.auth-link {
  color: #FF8C00;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: 0.3s;
}

.auth-link:hover {
  border-bottom: 2px solid #FF8C00;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.8s ease-out;
}
</style>