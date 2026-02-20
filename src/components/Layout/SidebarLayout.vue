<template>
  <div class="layout">
    <aside class="sidebar desktop glass-orange">
      <div class="sidebar-header">
        <h2 class="logo-text">Íz-kalauz</h2>
      </div>
      <nav>
        <ul>
          <li><router-link to="/">🏠 Kezdőlap</router-link></li>
          <li><router-link to="/receptek">🥘 Receptek</router-link></li>
          <li><router-link to="/kedvencek">❤️ Kedvencek</router-link></li>
          <li><router-link to="/jegyzet">📝 Jegyzet</router-link></li>
          <li><router-link to="/vasarlas">🛒 Bevásárlólista</router-link></li>
          <li><router-link to="/menu">📅 Heti Menü</router-link></li>
          <li><router-link to="/profile">👤 Profil</router-link></li>
        </ul>
      </nav>
    </aside>

    <button class="mobile-menu-btn" @click="isOpen = !isOpen">
      {{ isOpen ? '✕' : '☰' }}
    </button>

    <transition name="slide-up">
      <aside v-if="isOpen" class="sidebar mobile glass-orange">
        <nav>
          <ul>
            <li><router-link @click="isOpen = false" to="/">🏠 Kezdőlap</router-link></li>
            <li><router-link @click="isOpen = false" to="/receptek">🥘 Receptek</router-link></li>
            <li><router-link @click="isOpen = false" to="/kedvencek">❤️ Kedvencek</router-link></li>
            <li><router-link @click="isOpen = false" to="/jegyzet">📝 Jegyzet</router-link></li>
            <li><router-link @click="isOpen = false" to="/vasarlas">🛒 Bevásárlólista</router-link></li>
            <li><router-link @click="isOpen = false" to="/menu">📅 Heti Menü</router-link></li>
            <li><router-link @click="isOpen = false" to="/profile">👤 Profil</router-link></li>
          </ul>
        </nav>
      </aside>
    </transition>

    <main class="main-area">
      <div class="main-content-glass">
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "SidebarLayout",
  data() {
    return {
      isOpen: false
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

.layout {
  display: flex;
  width: 100%;
  min-height: calc(100vh - 80px);
  margin-top: 15px;
  font-family: 'Poppins', sans-serif;
}

/* --- NAVBAR-STÍLUSÚ ÁTLÁTSZÓ OLDALSÁV --- */
.glass-orange {
  /* Ugyanaz a finom átlátszóság, mint a Navbar-nál */
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* Finom narancsos keret és csillogás */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.sidebar {
  padding: 20px;
  color: white; /* Fehér szöveg a sötét háttérkép felett */
  z-index: 1000;
  border-radius: 20px;
}

.sidebar-header {
  text-align: center;
  margin-bottom: 25px;
}

.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  /* Ragyogó fehér-arany átmenet, mint a köszönő szövegnél */
  background: linear-gradient(90deg, #ffffff, #ffd17a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.5));
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin: 10px 0;
}

.sidebar a {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 12px;
  font-size: 0.9rem;
}

/* Hover és Aktív állapot - hogy passzoljon a Navbar gombjaihoz */
.sidebar a:hover, .router-link-active {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.2));
  color: #fff !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transform: translateX(5px);
}

/* MÉRET ÉS POZÍCIÓ */
.sidebar.desktop {
  position: fixed;
  left: 20px;
  width: 190px;
  height: calc(100vh - 120px);
}

/* --- FŐ TARTALOM TERÜLETE --- */
.main-area {
  flex: 1;
  padding: 0 50px 40px 50px; /* Megnöveltük a távolságot */
  margin-left: 230px;
}

.main-content-glass {
  background: rgba(255, 255, 255, 0.6); /* Marad a világos tartalom, hogy olvasható legyen */
  backdrop-filter: blur(10px);
  border-radius: 25px;
  min-height: 80vh;
  padding: 35px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  max-width: 950px;
  margin: 0 auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

/* MOBIL GOMB ÉS PANEL */
.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 1200;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 55px;
  height: 55px;
  color: white;
}

@media (max-width: 1024px) {
  .sidebar.desktop { display: none; }
  .mobile-menu-btn { display: block; }
  .main-area { margin-left: 0; padding: 20px; }
}
</style>