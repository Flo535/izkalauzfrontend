<template>
  <nav class="navbar">
    <!-- LOGÓ -->
    <router-link to="/" class="logo">
      <span class="icon">🍲</span>
      <span class="text">ÍzKalauz</span>
    </router-link>

    <!-- HAMBURGER MENU MOBILRA -->
    <button class="menu-toggle" @click="toggleMenu">
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
    </button>

    <!-- MENÜ -->
    <ul :class="['nav-links', { open: isOpen }]">
      <!-- BAL OLDAL EREDETI PONTOK -->
      <li><router-link to="/" @click="closeMenu">🏠 Kezdőlap</router-link></li>
      <li><router-link to="/recipes" @click="closeMenu">🍽 Receptek</router-link></li>

      <li class="spacer"></li>

      <!-- JOBB OLDAL -->
      <li v-if="!isLoggedIn"><router-link to="/login" @click="closeMenu">Bejelentkezés</router-link></li>
      <li v-if="!isLoggedIn"><router-link to="/register" @click="closeMenu">Regisztráció</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/profile" @click="closeMenu">Profil</router-link></li>
      <li v-if="isAdmin"><router-link to="/admin" @click="closeMenu">Admin</router-link></li>
      <li v-if="isLoggedIn"><a href="#" @click="logout">Kijelentkezés</a></li>
    </ul>
  </nav>
</template>

<script>
import { authState, clearAuth } from '../auth.js'

export default {
  name: 'Navbar',
  data() { return { isOpen: false } },
  computed: {
    isLoggedIn() { return authState.isLoggedIn },
    isAdmin() { return authState.isAdmin }
  },
  methods: {
    toggleMenu() { this.isOpen = !this.isOpen },
    closeMenu() { this.isOpen = false },
    logout() {
      clearAuth()
      this.$router.push('/login')
      this.isOpen = false
    }
  }
}
</script>

<style scoped>
/* ---------------- NAVBAR ---------------- */
.navbar {
  background: #fff8e8;
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 22px;
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
}

/* ---------------- LOGÓ PREMIUM ---------------- */
.navbar .logo {
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  transition: transform 0.25s ease, filter 0.25s ease;
  position: relative;
}

.navbar .logo .icon {
  font-size: 28px;
  line-height: 1;
}

.navbar .logo .text {
  font-size: 1.42rem;
  font-weight: 800;
  background: linear-gradient(45deg, #ff4d2a, #ffcc66);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 0 2px rgba(255, 190, 120, 0.5);
  position: relative;
  z-index: 1;
}

/* HOVER: finom scale/lebegés */
.navbar .logo:hover {
  transform: scale(1.06);
  filter: brightness(1.15);
}

/* ---------------- MENÜ ---------------- */
.nav-links {
  display: flex;
  list-style: none;
  gap: 4px; /* szorosabb menüpontok */
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.25s ease, transform 0.3s ease;
  display: inline-block;
  background: linear-gradient(90deg, #e67e22, #f1c40f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Hover menüpontok – finom lebegés és színváltozás */
.nav-links a:hover {
  transform: scale(1.07);
  background-color: rgba(0, 180, 0, 0.16);
  -webkit-text-fill-color: #d35400;
}

/* Spacer a bal-jobb elrendezéshez */
.spacer { flex: 1 }

/* Hamburger */
.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
}

.menu-toggle span {
  display: block;
  width: 26px;
  height: 3px;
  background: #4b3b2e;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.menu-toggle span.open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}
.menu-toggle span.open:nth-child(2) { opacity: 0; }
.menu-toggle span.open:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* ---------------- MOBIL ---------------- */
@media (max-width: 768px) {
  .menu-toggle { display: flex; }
  .nav-links {
    position: absolute;
    top: 100%;
    left: 0; right: 0;
    flex-direction: column;
    background: #fff8e8;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.3s ease;
  }
  .nav-links.open { max-height: 500px; opacity: 1; }
  .nav-links li { margin: 10px 0; text-align: center; }
  .spacer { display: none; }
}
</style>
