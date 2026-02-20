<template>
  <nav class="navbar">
    <div class="nav-right">

      <template v-if="!user">
        <router-link to="/login" class="nav-btn admin-style">Bejelentkezés</router-link>
        <router-link to="/register" class="nav-btn user-style">Regisztráció</router-link>
      </template>

      <template v-else>
        <span class="welcome">
          Szép napot kívánok, <span class="user-name">{{ user.isAdmin ? 'Admin' : 'Felhasználó' }}</span>!
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap');

.navbar {
  width: 100%;
  display: flex;
  justify-content: center;
  backdrop-filter: blur(15px);
  /* Kicsit világosabb réteg a barna háttér felett */
  background: linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08));
  border-bottom: 1px solid rgba(255,255,255,0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-right {
  width: 100%;
  max-width: 1400px;
  height: 80px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 25px;
  padding: 0 40px;
}

.welcome {
  font-family: 'Poppins', sans-serif;
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-right: 10px;

  /* Ragyogó fehér-arany átmenet a sötét háttérhez */
  background: linear-gradient(90deg, #ffffff, #fff3e0, #ffd17a);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;

  /* Árnyék, hogy elváljon a háttértől */
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.6));
}

.user-name {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: rgba(255, 209, 122, 0.4);
}

.nav-btn {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 10px 24px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  color: white !important;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: inline-block;
}

.nav-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.admin-style {
  background: linear-gradient(135deg, #FFD700, #FF8C00);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-style {
  background: linear-gradient(135deg, #a17c5a, #825e3f);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .nav-right { gap: 10px; padding: 0 15px; }
  .nav-btn { font-size: 0.8rem; padding: 8px 14px; }
  .welcome { display: none; } /* Mobilon elrejtjük a szöveget, hogy elférjenek a gombok */
}
</style>