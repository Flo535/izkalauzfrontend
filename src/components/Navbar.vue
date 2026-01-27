<template>
  <nav class="navbar">
    <router-link to="/" class="logo" @click="closeMenu">
      <span class="icon">🍲</span>
      <span class="text">ÍzKalauz</span>
    </router-link>

    <button class="menu-toggle" @click="toggleMenu">
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
      <span :class="{ open: isOpen }"></span>
    </button>

    <ul :class="['nav-links', { open: isOpen }]">
      <li class="spacer"></li>

      <li v-if="!isLoggedIn">
        <router-link to="/login" @click="closeMenu">Bejelentkezés</router-link>
      </li>
      <li v-if="!isLoggedIn">
        <router-link to="/register" @click="closeMenu">Regisztráció</router-link>
      </li>
      <li v-if="isAdmin">
        <router-link to="/admin" @click="closeMenu">Admin</router-link>
      </li>
      <li v-if="isLoggedIn">
        <a href="#" @click.prevent="logout">Kijelentkezés</a>
      </li>
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
    logout() { clearAuth(); this.isOpen = false; this.$router.push('/login') }
  }
}
</script>

<style scoped>
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

.logo { display: flex; align-items: center; gap: 4px; text-decoration: none; }
.logo .icon { font-size: 28px; }
.logo .text {
  font-size: 1.42rem; font-weight: 800;
  background: linear-gradient(45deg,#ff4d2a,#ffcc66);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.nav-links { display: flex; list-style: none; gap: 6px; margin: 0; padding: 0; align-items: center; }
.nav-links a {
  text-decoration: none; font-weight: 600; padding: 6px 10px; border-radius: 6px;
  background: linear-gradient(90deg,#e67e22,#f1c40f);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.nav-links a:hover { -webkit-text-fill-color: #d35400; }
.spacer { flex: 1; }

.menu-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; }
.menu-toggle span { display: block; width: 26px; height: 3px; background: #4b3b2e; border-radius: 3px; transition: all 0.3s ease; }
.menu-toggle span.open:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.menu-toggle span.open:nth-child(2) { opacity: 0; }
.menu-toggle span.open:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }

@media (max-width: 768px) {
  .menu-toggle { display: flex; }
  .nav-links {
    position: absolute; top: 100%; left: 0; right: 0;
    flex-direction: column; background: #fff8e8;
    max-height: 0; overflow: hidden; opacity: 0;
    transition: all 0.3s ease;
  }
  .nav-links.open { max-height: 400px; opacity: 1; }
  .spacer { display: none; }
}
</style>
