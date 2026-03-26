<template>
  <div class="layout">

    <!-- Toggle gomb – mindig ugyanott van, sosem mozdul -->
    <button
      class="sidebar-toggle"
      @click="isOpen = !isOpen"
      :title="isOpen ? 'Menü bezárása' : 'Menü megnyitása'"
    >
      {{ isOpen ? '‹' : '›' }}
    </button>

    <!-- Overlay -->
    <transition name="fade-overlay">
      <div v-if="isOpen" class="sidebar-overlay" @click="isOpen = false" />
    </transition>

    <!-- Sidebar panel -->
    <transition name="slide-sidebar">
      <aside v-if="isOpen" class="sidebar">

        <div class="sidebar-header">
          <p class="sidebar-label">IzKalauz</p>
          <h2 class="sidebar-logo">Íz-kalauz</h2>
        </div>

        <nav class="sidebar-nav">
          <ul>
            <li v-for="item in navItems" :key="item.to">
              <router-link
                :to="item.to"
                class="nav-link"
                :class="{ 'is-active': $route.path === item.to }"
                @click="isOpen = false"
              >
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <div class="sidebar-footer">
          <p class="sidebar-footer-text">© 2025 IzKalauz</p>
        </div>

      </aside>
    </transition>

    <!-- Fő tartalom -->
    <main class="main-area">
      <div class="main-content">
        <slot />
      </div>
    </main>

  </div>
</template>

<script>
export default {
  name: 'SidebarLayout',

  data() {
    return {
      isOpen: false,
      navItems: [
        { to: '/',          icon: '🏠', label: 'Kezdőlap'       },
        { to: '/receptek',  icon: '🥘', label: 'Receptek'       },
        { to: '/kedvencek', icon: '❤️', label: 'Kedvencek'      },
        { to: '/jegyzet',   icon: '📝', label: 'Jegyzet'        },
        { to: '/vasarlas',  icon: '🛒', label: 'Bevásárlólista' },
        { to: '/menu',      icon: '📅', label: 'Heti Menü'      },
        { to: '/profile',   icon: '👤', label: 'Profil'         },
      ]
    }
  },

  watch: {
    $route() {
      this.isOpen = false
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  width: 100%;
  min-height: calc(100vh - 68px);
  position: relative;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  overflow-x: hidden;
}

/* ── Toggle gomb – fix pozíció, sosem mozdul ── */
.sidebar-toggle {
  position: fixed;
  top: 14px;
  left: 20px;
  z-index: 500;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid #dddad4;
  background: #f5f5f3;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: border-color 0.2s ease, color 0.2s ease,
              background 0.2s ease, box-shadow 0.2s ease;
  font-size: 1.4rem;
  font-weight: 300;
  line-height: 1;
  padding: 0;
}

.sidebar-toggle:hover {
  border-color: #FF8C00;
  color: #FF8C00;
  box-shadow: 0 4px 14px rgba(255, 140, 0, 0.15);
}

/* ── Overlay ── */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(26, 26, 26, 0.22);
}

/* ── Sidebar panel ── */
.sidebar {
  position: fixed;
  top: 68px;
  left: 0;
  z-index: 350;
  width: 240px;
  height: calc(100vh - 68px);
  background: #f5f5f3;
  border-right: 1px solid #e0ddd8;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  padding: 24px 14px 20px;
  overflow-y: auto;
  position: fixed;
}

/* ── Fejléc ── */
.sidebar-header {
  margin-bottom: 24px;
  padding: 0 8px 20px;
  border-bottom: 1px solid #e0ddd8;
}

.sidebar-label {
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #FF8C00;
  font-weight: 600;
  margin-bottom: 4px;
}

.sidebar-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* ── Navigáció ── */
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 12px;
  color: #777;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
  border: 1px solid transparent;
}

.nav-link:hover {
  background: #eeede9;
  color: #1a1a1a;
  transform: translateX(3px);
}

.nav-link.is-active {
  background: #fff8f0;
  color: #FF8C00;
  border-color: rgba(255, 140, 0, 0.18);
}

.nav-icon {
  width: 22px;
  text-align: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
}

/* ── Lábléc ── */
.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e0ddd8;
}

.sidebar-footer-text {
  font-size: 0.7rem;
  color: #ccc;
  text-align: center;
  margin: 0;
}

/* ── Fő tartalom ── */
.main-area {
  flex: 1;
  padding: 30px 36px;
  width: 100%;
  min-width: 0;
}

.main-content {
  background: #fff;
  border-radius: 20px;
  min-height: 80vh;
  padding: 32px;
  border: 1px solid #e8e8e4;
  max-width: 960px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* ── Animációk ── */
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
}

.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.22s ease;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

/* ── Reszponzív ── */
@media (max-width: 768px) {
  .main-area {
    padding: 12px;
  }

  .main-content {
    padding: 20px;
    border-radius: 16px;
    max-width: 100%
  }
}
</style>