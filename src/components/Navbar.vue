<template>
  <nav class="navbar">
    <div class="nav-inner">

      <!-- Bal oldal: logó (helyet hagy a toggle gombnak) -->
      <div class="nav-left">
        <router-link to="/" class="nav-logo">Íz-kalauz</router-link>
      </div>

      <!-- Jobb oldal: gombok -->
      <div class="nav-right">
        <template v-if="!user">
          <router-link to="/login" class="nav-btn btn-outline">Bejelentkezés</router-link>
          <router-link to="/register" class="nav-btn btn-fill">Regisztráció</router-link>
        </template>

        <template v-else>
          <span class="nav-welcome">
            Szép napot, <strong>{{ user.isAdmin ? 'Admin' : 'Felhasználó' }}</strong>!
          </span>
          <router-link v-if="user.isAdmin" to="/admin" class="nav-btn btn-outline">
            Admin
          </router-link>
          <button @click="logout" class="nav-btn btn-fill">Kijelentkezés</button>
        </template>
      </div>

    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',

  data() {
    return { user: null }
  },

  mounted() {
    this.loadUser()
    window.addEventListener('storage', this.loadUser)
  },

  beforeUnmount() {
    window.removeEventListener('storage', this.loadUser)
  },

  watch: {
    $route() { this.loadUser() }
  },

  methods: {
    loadUser() {
      const token = localStorage.getItem('token')
      if (!token) { this.user = null; return }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const role = payload.role ||
          payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        this.user = { role, isAdmin: role?.toLowerCase() === 'admin' }
      } catch {
        this.user = null
      }
    },

    logout() {
      localStorage.removeItem('token')
      this.user = null
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 400;
  width: 100%;
  height: 68px;
  background: #f5f5f3;
  border-bottom: 1px solid #e0ddd8;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
}

.nav-inner {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  /* bal padding helyet ad a fix toggle gombnak */
  padding: 0 28px 0 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* ── Logó ── */
.nav-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a1a1a;
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: color 0.2s ease;
}

.nav-logo:hover {
  color: #FF8C00;
}

/* ── Jobb oldal ── */
.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* ── Üdvözlő ── */
.nav-welcome {
  font-size: 0.83rem;
  color: #999;
  white-space: nowrap;
  margin-right: 4px;
}

.nav-welcome strong {
  color: #555;
  font-weight: 600;
}

/* ── Gombok ── */
.nav-btn {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.83rem;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 50px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: none;
  line-height: 1;
  white-space: nowrap;
}

.nav-btn:hover {
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #555;
  border: 1.5px solid #dddad4;
}

.btn-outline:hover {
  border-color: #FF8C00;
  color: #FF8C00;
}

.btn-fill {
  background: #1a1a1a;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.btn-fill:hover {
  background: #FF8C00;
  box-shadow: 0 4px 14px rgba(255, 140, 0, 0.3);
}

/* ── Reszponzív ── */
@media (max-width: 768px) {
  .nav-inner {
    padding: 0 16px 0 72px;
  }

  .nav-welcome {
    display: none;
  }

  .nav-btn {
    font-size: 0.8rem;
    padding: 7px 14px;
  }
}

@media (max-width: 380px) {
  .nav-inner {
    padding: 0 10px 0 62px;
    gap: 6px;
  }
  .nav-btn {
    font-size: 0.72rem;
    padding: 6px 10px;
  }
}

@media (max-width: 400px) {
  .nav-logo {
    font-size: 1.15rem;
  }
}
</style>