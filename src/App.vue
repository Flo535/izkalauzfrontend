<template>
  <div id="app">
    <Navbar />
    <div class="app-main">
      <SidebarLayout>
        <router-view />
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');

html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100%;
  font-family: 'Playfair Display', serif;
  background-image: url('/src/assets/background-photo.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.app-main {
  flex: 1;
  display: flex;
  min-height: 100vh;
  padding: 20px;
  background: transparent; /* háttérkép látszik */
}

body.loading::after {
  content: 'Betöltés...';
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  color: #2c3e50;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(3px);
}

/* Globális zöld scroll minden listára és overflow-os konténerekre */
* {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #8fbc8f #f0f0f0; /* thumb szín, track szín Firefox */
}

*::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

*::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
}

*::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #a3d9a5, #6fbf6f); /* halvány zöld → sötétebb zöld */
  border-radius: 8px;
}

*::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #92d292, #5faf5f);
}
</style>
