<template>
  <div id="app">
    <Navbar />
    
    <div class="app-main">
      <SidebarLayout>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
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
/* Betűtípusok: Poppins a szövegnek, Playfair Display a címeknek */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');

/* Alapbeállítások a teljes oldalra */
html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  
  /* A közös háttérkép beállítása */
  background-image: url('/src/assets/background-photo.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  
  /* Simább görgetés */
  scroll-behavior: smooth;
  color: #2c3e50;
}

/* Fő tartály az oldalsáv és a tartalom számára */
.app-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* Egy leheletnyi sötétítés a háttérképen, hogy az üveghatás jobban érvényesüljön */
  background: rgba(0, 0, 0, 0.15); 
}

/* --- GLOBÁLIS NARANCSSÁRGA GÖRGETŐSÁV (SCROLLBAR) --- */

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #ff8c00 rgba(255, 255, 255, 0.1);
}

/* Chrome, Safari, Edge */
*::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

*::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

*::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ffb84d, #ff8c00); 
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 6px rgba(0,0,0,0.1);
}

*::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #ffcc66, #ffa500);
}

/* --- ANIMÁCIÓK --- */

/* Oldalváltási effekt (Fade) */
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

/* --- BETÖLTÉSI ÁLLAPOT --- */
body.loading::after {
  content: 'Ízek betöltése...';
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  color: #ff8c00;
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(15px);
}

/* Közös címsor stílus az egész appban */
h1, h2, h3 {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}

/* --- GLOBÁLIS LAPOZÓ (PAGINATION) STÍLUS --- */

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
  border: none;
  background: rgba(255, 255, 255, 0.1); /* Finom üveghatás */
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
  transform: none;
}

/* Szélesebb gomb az előző/következő nyilakhoz */
.page-btn-long {
  width: auto;
  padding: 0 20px;
  font-size: 1.2rem;
}
</style>