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
      <li v-if="!isLoggedIn"><router-link to="/login" @click="closeMenu">Bejelentkezés</router-link></li>
      <li v-if="!isLoggedIn"><router-link to="/register" @click="closeMenu">Regisztráció</router-link></li>
      <li v-if="isLoggedIn"><router-link to="/profile" @click="closeMenu">Profil</router-link></li>
      <li v-if="isLoggedIn"><a href="#" @click="logout">Kijelentkezés</a></li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return { isOpen: false, tick: 0 } // tick a computed újraszámolásához
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    }
  },
  mounted() {
    // minden másodpercben ellenőrzi a token változást → menü frissül
    this.interval = setInterval(() => this.tick++, 1000)
  },
  beforeUnmount() {
    clearInterval(this.interval)
  },
  methods: {
    toggleMenu() { this.isOpen = !this.isOpen },
    closeMenu() { this.isOpen = false },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('email')
      this.$router.push('/login')
      this.isOpen = false
    }
  }
}
</script>

<style scoped>
.navbar {
  background: rgba(255,253,245,0.9);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.logo { color: #4b3b2e; font-weight: 700; font-size: 1.4rem; text-decoration: none; }

.nav-links {
  list-style: none;
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
}

.nav-links a { color: #4b3b2e; text-decoration: none; font-weight: 500; }

.menu-toggle { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; }

.menu-toggle span {
  display: block; width: 26px; height: 3px; background: #4b3b2e; border-radius: 3px; transition: all 0.3s ease;
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
    padding: 1rem 0;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.3s ease;
  }
  .nav-links.open { max-height: 400px; opacity: 1; }
  .nav-links li { margin: 10px 0; text-align: center; }
}
</style>
