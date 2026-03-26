<template>
  <div id="app">
    <Navbar />
    
    <div class="app-main">
      <SidebarLayout>
        <div class="main-content-stabilizer">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="$route.path" />
            </transition>
          </router-view>
        </div>
      </SidebarLayout>
    </div>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import SidebarLayout from './components/Layout/SidebarLayout.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    SidebarLayout
  }
}
</script>

<style>
/* Google Fonts betöltése */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Háttérkép ── */
html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  color: #2c3e50;
}

html {
  overflow-y: scroll;
  scroll-behavior: smooth;
}

body, #app {
  overflow-y: visible;
  background: #fdddad;
}

/* ── Fő layout ── */
.app-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.15);
}

.main-content-stabilizer {
  flex: 1;
  width: 100%;
  min-height: 85vh;
  position: relative;
  /*contain: layout;*/
}

/* ── Oldal átmenetek ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ── Narancssárga görgetősáv ── */
*::-webkit-scrollbar { width: 10px; }
*::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
*::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ffb84d, #ff8c00);
  border-radius: 10px;
}

/* ── Lapozó (globálisan használható) ── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin: 40px 0;
  padding: 10px;
}

.page-btn {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  /* Fontos: ne örökölje a global.css button szélességét */
  width: 45px;
  padding: 0;
}

.page-btn:hover:not(:disabled) {
  background: #ff8c00;
  transform: translateY(-3px);
  color: white;
  border-color: #ffb84d;
}

.page-btn.active {
  background: linear-gradient(135deg, #ffb84d, #ff8c00);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 140, 0, 0.4);
  border-color: #ffcc66;
}

.page-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.page-btn-long {
  width: auto;
  padding: 0 20px;
  font-size: 1.1rem;
}
</style>