<template>
  <div class="layout">
    <!-- DESKTOP SIDEBAR -->
    <aside class="sidebar desktop">
      <nav>
        <ul>
          <li><router-link to="/">🏠 Kezdőlap</router-link></li>
          <li><router-link to="/receptek">🍽 Receptek</router-link></li>
          <li><router-link to="/kedvencek">❤️ Kedvencek</router-link></li>
          <li><router-link to="/vasarlas">🛒 Bevásárlólista</router-link></li>
          <li><router-link to="/menu">📅 Heti Menü</router-link></li>
          <li><router-link to="/profile">👤 Profil</router-link></li>
        </ul>
      </nav>
    </aside>

    <!-- MOBILE HAMBURGER -->
    <button class="mobile-menu-btn" @click="isOpen = !isOpen">☰</button>

    <!-- MOBILE SIDEBAR PANEL -->
    <transition name="slide-up">
      <aside v-if="isOpen" class="sidebar mobile">
        <button class="close-btn" @click="isOpen = false">✕</button>
        <nav>
          <ul>
            <li><router-link @click="isOpen = false" to="/">🏠 Kezdőlap</router-link></li>
            <li><router-link @click="isOpen = false" to="/receptek">🍽 Receptek</router-link></li>
            <li><router-link @click="isOpen = false" to="/kedvencek">❤️ Kedvencek</router-link></li>
            <li><router-link @click="isOpen = false" to="/vasarlas">🛒 Bevásárlólista</router-link></li>
            <li><router-link @click="isOpen = false" to="/menu">📅 Heti Menü</router-link></li>
            <li><router-link @click="isOpen = false" to="/profile">👤 Profil</router-link></li>
          </ul>
        </nav>
      </aside>
    </transition>

    <!-- MAIN CONTENT -->
    <main class="main-area">
      <div class="main-content glass-box">
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
.layout {
  display: flex;
  width: 100%;
  min-height: calc(100vh - 70px);
  margin-top: 70px;
  font-family: 'Segoe UI', sans-serif;
}

/* SIDEBAR COMMON */
.sidebar {
  padding: 20px;
  background: rgba(247, 243, 238, 0.85);
  backdrop-filter: blur(10px);
  color: #3B3B3B;
  border-radius: 12px;
  z-index: 1000;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin: 12px 0;
}

.sidebar a {
  position: relative;
  display: block;
  padding: 8px 12px 8px 16px; /* 🔹 Extra bal padding a pseudo-element miatt */
  border-radius: 8px;
  font-weight: 500;
  color: #3B3B3B;
  text-decoration: none;
  transition: background 0.4s ease, padding-left 0.3s ease;
}

.sidebar a::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: rgba(255, 165, 80, 0.7);
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.sidebar a:hover::before {
  opacity: 1;
}

.sidebar a:hover {
  background: linear-gradient(to right, rgba(255, 247, 150, 0.5), rgba(255, 165, 80, 0.5));
  padding-left: 20px; /* 🔹 Hoverkor kicsit nagyobb */
  z-index: 0;
}

/* DESKTOP SIDEBAR */
.sidebar.desktop {
  width: 240px;
  min-height: 100%;
  box-shadow: 4px 0 12px rgba(0,0,0,0.06);
  flex-shrink: 0;
}

/* MAIN CONTENT */
.main-area {
  flex: 1;
  padding: 20px;
}

.glass-box {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(6px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.25);
}

/* MOBILE HAMBURGER BUTTON */
.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1200;
  background: rgba(247,243,238,0.95);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.6rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* MOBILE SIDEBAR PANEL */
.sidebar.mobile {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 250px;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  float: right;
  cursor: pointer;
}

/* SLIDE UP TRANSITION */
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter {
  transform: translateY(100%);
}
.slide-up-leave-to {
  transform: translateY(100%);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .sidebar.desktop {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .main-area {
    flex: 1;
    padding: 20px;
    margin-top: 70px;
  }
}
</style>
