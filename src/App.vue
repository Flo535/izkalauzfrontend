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
/* 1. ALAPOK ÉS BETŰTÍPUSOK */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');

html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  
  /* Háttérkép rögzítése */
  background-image: url('/src/assets/background-photo.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  
  /* Mindig kényszerített görgetősáv a vízszintes ugrálás ellen */
  overflow-y: scroll;
  scroll-behavior: smooth;
  color: #2c3e50;
}

.app-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.15); /* Finom sötétítés az üveghatásért */
}

/* 2. STABILIZÁLÓ RÉTEG (Nem látszik, de fogja a tartalmat) */
.main-content-stabilizer {
  flex: 1;
  width: 100%;
  min-height: 85vh;
  position: relative;
  contain: layout; /* Ez gátolja a remegést */
}

/* 3. ANIMÁCIÓK - Visszatért a finom mozgás */
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

/* 4. GLOBÁLIS KÁRTYA STÍLUS ÉS LEBEGÉS (Uniform méretek) */
.recipe-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease !important;
  backface-visibility: hidden;
  transform: translateZ(0);
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-8px) scale(1.02); /* Finom lebegés és pici nagyítás */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2) !important;
}

/* 5. NARANCSSÁRGA GÖRGETŐSÁV */
*::-webkit-scrollbar { width: 10px; }
*::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
*::-webkit-scrollbar-thumb { 
  background: linear-gradient(180deg, #ffb84d, #ff8c00); 
  border-radius: 10px; 
}

h1, h2, h3 { font-family: 'Playfair Display', serif; font-weight: 700; }

/* 6. GLOBÁLIS LAPOZÓ (PAGINATION) - Visszaállítva a szép dizájn */
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
  background: rgba(255, 255, 255, 0.1); 
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
}

.page-btn-long {
  width: auto;
  padding: 0 20px;
  font-size: 1.1rem;
}
</style>