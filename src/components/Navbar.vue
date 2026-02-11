<template>
  <nav class="navbar">
    <div class="nav-right">

      <!-- Ha nincs bejelentkezve -->
      <template v-if="!user">
        <router-link to="/login" class="nav-btn admin-style">Bejelentkezés</router-link>
        <router-link to="/register" class="nav-btn user-style">Regisztráció</router-link>
      </template>

      <!-- Ha be van jelentkezve -->
      <template v-else>
        <span class="welcome">
          Szép napot kívánok, {{ user.isAdmin ? 'Admin' : 'Felhasználó' }}!
        </span>

        <router-link
          v-if="user.isAdmin"
          to="/admin"
          class="nav-btn admin-style"
        >
          Admin
        </router-link>

        <button @click="logout" class="nav-btn user-style">Kijelentkezés</button>
      </template>

    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return { user: null }
  },
  mounted() {
    this.loadUser()
    window.addEventListener("storage", this.loadUser)
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.loadUser)
  },
  methods: {
    loadUser() {
      const token = localStorage.getItem("token")
      if (!token) { this.user = null; return }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const role = payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

        this.user = {
          role: role,
          isAdmin: role?.toLowerCase() === "admin"
        }
      } catch { this.user = null }
    },
    logout() {
      localStorage.removeItem("token")
      this.user = null
      this.$router.push("/")
    }
  },
  watch: {
    $route() { this.loadUser() }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

.navbar {
  width: 100%;
  display: flex;
  justify-content: center;
  backdrop-filter: blur(12px);
  background: linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05));
  border-bottom: 1px solid rgba(255,255,255,0.2);
  font-family: 'Playfair Display', serif;
}

.nav-right {
  width: 100%;
  max-width: 1400px;
  height: 80px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  padding: 0 40px;
}

.welcome {
  font-size: 0.9rem;
  font-style: italic;
  letter-spacing: 1px;

  /* finom arany-narancs átmenet */
  background: linear-gradient(90deg, #ffd17a, #ffb84d);
  background-clip: text;           /* standard tulajdonság */
  -webkit-background-clip: text;   /* webkit böngészők */
  -webkit-text-fill-color: transparent;

  /* árnyék, hogy a szöveg jobban látszódjon a háttéren */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.25);
}



/* Alap gombstílus minden gombnak */
.nav-btn {
  font-weight: 600;
  font-size: 0.95rem;
  padding: 8px 22px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transition: transform 0.2s ease, box-shadow 0.3s ease, background 0.5s ease;
  font-family: 'Playfair Display', serif;
}

/* Hover effekt minden gombnak */
.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.22);
}

/* Admin és Bejelentkezés stílus - arany-bronz csillogó */
.admin-style {
  background: linear-gradient(135deg, #f9d976, #f39c12);
  color: #fff;
  text-shadow: 0 0 2px rgba(255,255,255,0.3);
}

/* Regisztráció és Kijelentkezés stílus - csillogó barna */
.user-style {
  background: linear-gradient(135deg, #a17c5a, #c49b6c); /* barna-arany */
  color: #fff;
  text-shadow: 0 0 1px rgba(255,255,255,0.2);
}

/* Mobil nézet */
@media (max-width: 768px) {
  .nav-right { gap: 12px; }
  .nav-btn { font-size: 0.85rem; padding: 6px 16px; }
  .welcome { font-size: 0.85rem; }
}
</style>
