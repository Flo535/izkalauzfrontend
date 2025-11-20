<template>
  <nav class="navbar">
    <router-link to="/" class="logo">ÍzKalauz</router-link>

    <button class="menu-toggle" @click="toggleMenu">
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
    </button>

    <ul :class="['nav-links', { open: isOpen }]">
      <li><router-link to="/" @click="closeMenu">Főoldal</router-link></li>
      <li><router-link to="/recipes" @click="closeMenu">🍽 Receptek</router-link></li>

      <li class="spacer"></li>

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
  data() {
    return { isOpen: false }
  },
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
.navbar {
  background: rgba(255,253,245,0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  position: fixed;
  top: 0;
  left: 0; right: 0;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.logo {
  font-weight: 700;
  font-size: 1.4rem;
  color: #4b3b2e;
  text-decoration: none;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 20px;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  font-weight: 500;
  color: #4b3b2e;
}

.spacer { flex: 1 } /* minden gombot jobbra tol */

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

.menu-toggle span.open:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.menu-toggle span.open:nth-child(2) { opacity: 0; }
.menu-toggle span.open:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }

@media (max-width: 768px) {
  .menu-toggle { display: flex; }
  .nav-links {
    position: absolute;
    top: 100%;
    left: 0; right: 0;
    flex-direction: column;
    align-items: center;
    background: rgba(255,253,245,0.95);
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
