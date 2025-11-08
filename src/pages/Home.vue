
<template>

  <div class="home-container">
    <!-- Nyitó tartalom (mindenki számára látható) -->
    <section class="intro-section">
      <h1>Üdvözöl az ÍzKalauz!</h1>
      <p>
        Tervezd meg a heti menüt, tárold kedvenc receptjeidet, és fedezz fel új ízeket!
      </p>
      <ul>
        <li>✔️ Receptek elmentése</li>
        <li>✔️ Heti menü összeállítása</li>
        <li>✔️ Vásárlólista generálása</li>
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
      logo,          // ✅ itt lesz elérhető a kép
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
.logo-image {
  max-width: 300px;
  height: auto;
  margin: 0 auto 25px;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  border-radius: 10px;
  background-color: #ffffffcc; /* halvány fehér háttér */
  padding: 10px;
}

.home-container {
  max-width: 800px;
  margin: 60px auto;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0,0,0,0.1);
  text-align: center;
  backdrop-filter: blur(2px);
}

.intro-section h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.intro-section p {
  font-size: 18px;
  margin-bottom: 20px;
}

.intro-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.intro-section li {
  font-size: 16px;
  margin: 5px 0;
  color: #333;
}

.user-section,
.guest-section {
  margin-top: 30px;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #d33;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background-color: #b22;
}
</style>
