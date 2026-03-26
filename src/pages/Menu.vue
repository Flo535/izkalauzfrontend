<template>
  <div class="menu-page">

    <transition name="modal">
      <div v-if="confirm.visible" class="modal-overlay" @click.self="cancelConfirm">
        <div class="modal-box">
          <p class="modal-msg">{{ confirm.message }}</p>
          <div class="modal-btns">
            <button class="modal-btn modal-btn--cancel" @click="cancelConfirm">Mégse</button>
            <button class="modal-btn modal-btn--confirm" @click="doConfirm">Igen, törlöm</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h1 class="page-title">Heti Menü Tervező</h1>
      <p class="page-subtitle">A hét minden napjára összeállított fogások</p>
    </div>

    <!-- Admin panel -->
    <div v-if="isAdmin" class="admin-panel">
      <div class="admin-panel-header">
        <span class="admin-badge">Admin</span>
        <h3 class="admin-title">Új napi menü hozzáadása</h3>
      </div>

      <form @submit.prevent="addMenuItem" class="add-form">
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label">Nap *</label>
            <select v-model="newItem.day" required class="form-select" name="daySelector">
              <option :value="null" disabled>Válassz napot...</option>
              <option v-for="d in daysOfWeek" :key="d.value" :value="d.value">{{ d.label }}</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label">Leves</label>
            <select v-model="newItem.soupId" class="form-select" name="levesSelector">
              <option :value="null">— Nincs leves —</option>
              <option v-for="r in soups" :key="r.id" :value="r.id">{{ r.title }}</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label">Főétel *</label>
            <select v-model="newItem.mainCourseId" required class="form-select" name="foetelSelector">
              <option :value="null" disabled>Főétel kiválasztása...</option>
              <option v-for="r in mainCourses" :key="r.id" :value="r.id">{{ r.title }}</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-label">Desszert</label>
            <select v-model="newItem.dessertId" class="form-select" name="desszertSelector">
              <option :value="null">— Nincs desszert —</option>
              <option v-for="r in desserts" :key="r.id" :value="r.id">{{ r.title }}</option>
            </select>
          </div>
        </div>

        <div class="form-footer">
          <p v-if="addError" class="status-error">{{ addError }}</p>
          <p v-if="addSuccess" class="status-success">{{ addSuccess }}</p>
          <button class="btn-save" name="menuSaveBtn" type="submit">💾 Menü mentése</button>
        </div>
      </form>
    </div>

    <!-- Heti menü napok -->
    <div class="weekly-menu">
      <div v-for="day in orderedDays" :key="day.value" class="day-section">

        <!-- Nap fejléc -->
        <div class="day-header">
          <div class="day-header-left">
            <h2 class="day-label">{{ day.label }}</h2>
          </div>
          <button
            v-if="isAdmin && day.menu"
            class="btn-delete-day"
            @click="deleteMenuItem(day.menu.id)"
            title="Nap törlése"
          >
            ✕
          </button>
        </div>

        <!-- Receptek -->
        <div v-if="day.menu" class="meals-row">
          <div
            v-for="recipe in menuRecipes(day.menu)"
            :key="recipe.id"
            class="recipe-card"
            @click="$router.push(`/recept/${recipe.id}`)"
          >
            <div class="card-img-wrap">
              <img
                v-if="!brokenImages.includes(recipe.id)"
                :src="getImageUrl(recipe)"
                :alt="recipe.title"
                class="card-img"
                @load="onImgLoad"
                @error="handleImgError(recipe)"
              />
              <div v-else class="card-img-placeholder">📷</div>
              <span class="category-badge">{{ recipe.category }}</span>
            </div>
            <div class="card-body">
              <h4 class="card-title">{{ recipe.title }}</h4>
              <div class="card-footer">
                <span class="card-hint">Kattints a megtekintéshez</span>
                <div class="card-arrow">→</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Üres nap -->
        <div v-else class="empty-day">
          <span class="empty-day-icon">🍳</span>
          <p>Erre a napra még nem állítottak össze menüt.</p>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
import { authState } from '@/auth.js'

export default {
  name: 'WeeklyMenu',

  data() {
    return {
      weeklyMenu: [],
      allRecipes: [],
      brokenImages: [],
      confirm: { visible: false, message: '', resolve: null },
      newItem: { day: null, soupId: null, mainCourseId: null, dessertId: null },
      addError: '',
      addSuccess: '',
      daysOfWeek: [
        { label: 'Hétfő',     value: 1 },
        { label: 'Kedd',      value: 2 },
        { label: 'Szerda',    value: 3 },
        { label: 'Csütörtök', value: 4 },
        { label: 'Péntek',    value: 5 },
        { label: 'Szombat',   value: 6 },
        { label: 'Vasárnap',  value: 0 }
      ]
    }
  },

  computed: {
    isAdmin() { return authState.isAdmin },
    orderedDays() {
      const menuArray = Array.isArray(this.weeklyMenu) ? this.weeklyMenu : []
      return this.daysOfWeek.map(d => ({
        ...d,
        menu: menuArray.find(m => m.dayOfWeek === d.value) || null
      }))
    },
    soups()       { return this.allRecipes.filter(r => r.category === 'Leves')   },
    mainCourses() { return this.allRecipes.filter(r => r.category === 'Főétel')  },
    desserts()    { return this.allRecipes.filter(r => r.category === 'Desszert') }
  },

  async mounted() {
    await Promise.all([this.loadRecipes(), this.loadWeeklyMenu()])
  },

  methods: {
    async loadWeeklyMenu() {
      try {
        const res = await axios.get('https://localhost:5150/api/weeklymenu')
        this.weeklyMenu = res.data || []
      } catch {
        this.weeklyMenu = []
      }
    },

    async loadRecipes() {
      try {
        const res = await axios.get('https://localhost:5150/api/recipes', {
          params: { page: 1, pageSize: 1000 }
        })
        this.allRecipes = res.data.items || []
      } catch (e) {
        console.error('Hiba a receptek betöltésekor:', e)
      }
    },

    menuRecipes(menu) {
      if (!menu) return []
      return [menu.soup, menu.mainCourse, menu.dessert].filter(r => r && r.title)
    },

    getImageUrl(recipe) {
      if (!recipe) return 'https://localhost:5150/images/default.jpg'
      if (this.brokenImages.includes(recipe.id)) return 'https://localhost:5150/images/default.jpg'
      if (!recipe.imagePath) return 'https://localhost:5150/images/default.jpg'
      const fileName = recipe.imagePath.split(/[\\/]/).pop()
      return `https://localhost:5150/images/recipes/${fileName}`
    },

    onImgLoad(e) {
      e.target.classList.add('is-loaded')
    },

    handleImgError(recipe) {
      if (!this.brokenImages.includes(recipe.id)) {
        this.brokenImages.push(recipe.id)
      }
    },

    async addMenuItem() {
      this.addError = ''
  
      // Explicit validáció
      if (this.newItem.day === null || this.newItem.day === undefined) {
        this.addError = '❌ Kérlek válassz napot!'
        return
      }
      if (!this.newItem.mainCourseId) {
        this.addError = '❌ Kérlek válassz főételt!'
        return
      }


      try {
        const token = localStorage.getItem('token')
        await axios.post(
          'https://localhost:5150/api/weeklymenu',
          {
            dayOfWeek:    this.newItem.day,
            soupId:       this.newItem.soupId,
            mainCourseId: this.newItem.mainCourseId,
            dessertId:    this.newItem.dessertId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.newItem = { day: null, soupId: null, mainCourseId: null, dessertId: null }
        this.addSuccess = '✅ Menü sikeresen elmentve!'
        await this.loadWeeklyMenu()
        setTimeout(() => { this.addSuccess = '' }, 3000)
      } catch {
        this.addError = '❌ Hiba történt a mentés során.'
        setTimeout(() => { this.addError = '' }, 3000)
      }
    },

    async deleteMenuItem(id) {
      const ok = await this.askConfirm('Biztosan törölni szeretnéd ezt a napi menüt?')
      if (!ok) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`https://localhost:5150/api/weeklymenu/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await this.loadWeeklyMenu()
      } catch (e) {
        console.error('Törlési hiba:', e)
      }
    },

    // ── Megerősítő modál ──
    askConfirm(message) {
      return new Promise(resolve => {
        this.confirm = { visible: true, message, resolve }
      })
    },
    doConfirm() {
      this.confirm.resolve(true)
      this.confirm.visible = false
    },
    cancelConfirm() {
      this.confirm.resolve(false)
      this.confirm.visible = false
    }

  }
}
</script>

<style scoped>
/* ── Oldal ── */
.menu-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}

/* ── Fejléc ── */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-label {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #FF8C00;
  font-weight: 600;
  margin-bottom: 8px;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 600;
  margin: 0 0 8px;
  background: #ff9e15;
  /*background: linear-gradient(to right, #FF8C00, #FFD700);*/
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #656565;
  margin: 0;
}

/* ── Admin panel ── */
.admin-panel {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e8e8e4;
  padding: 28px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.admin-panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e4;
}

.admin-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: #1a1a1a;
  color: white;
  padding: 4px 10px;
  border-radius: 50px;
}

.admin-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* ── Form ── */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #888;
  text-transform: uppercase;
}

.form-select {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.875rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  /* cross-browser appearance */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}

.form-select:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  background-color: #fff;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.status-error   { font-size: 0.875rem; color: #e74c3c; font-weight: 500; margin: 0; }
.status-success { font-size: 0.875rem; color: #27ae60; font-weight: 500; margin: 0; }

.btn-save {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 11px 24px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  background: #1a1a1a;
  color: white;
  transition: background 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  width: auto;
  line-height: 1;
}

.btn-save:hover {
  background: #FF8C00;
  transform: translateY(-1px);
}

/* ── Heti menü ── */
.weekly-menu {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* ── Nap ── */
.day-section {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #ededed;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 24px;
  border-bottom: 1px solid #e8e8e4;
  background: #ffe3c6;  /*#ffdbb5*/
  position: relative;
}

.day-header-left {
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF8C00, #FFD700);
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.day-label {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.btn-delete-day {
  position: absolute;
  right: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid #fcc;
  background: #a55050;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: background 0.2s ease, transform 0.2s ease;
  padding: 0;
  width: auto;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.78rem;
  font-weight: 600;
  width: auto;
}

.btn-delete-day:hover {
  background: #4a2020;
  transform: scale(1.04);
}

/* ── Receptek ── */
.meals-row {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  justify-content: space-evenly;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #e8e8e4 transparent;
}

.meals-row::-webkit-scrollbar {
  height: 4px;
}

.meals-row::-webkit-scrollbar-thumb {
  background: #e0ddd8;
  border-radius: 4px;
}

/* ── Recept kártya ── */
.recipe-card {
  flex: 0 0 260px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2);
}

.recipe-card:hover .card-img {
  transform: scale(1.04);
}

/* ── Kép ── */
.card-img-wrap {
  position: relative;
  width: 100%;
  height: 170px;
  overflow: hidden;
  background: #e8e8e4;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.3s ease;
}

.card-img.is-loaded {
  opacity: 1;
}

.card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #bbb;
}

.category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 140, 0, 0.92);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 50px;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

/* ── Kártya tartalom ── */
.card-body {
  padding: 14px 16px 16px;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #141414;
  margin: 0 0 12px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e8e8e4;
  padding-top: 10px;
}

.card-hint {
  font-size: 0.72rem;
  color: #656565;
}

.card-arrow {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1a1a1a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  flex-shrink: 0;
}

/* ── Üres nap ── */
.empty-day {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  color: #bbb;
  font-size: 0.875rem;
}

.empty-day-icon {
  font-size: 1.3rem;
  opacity: 0.5;
}


/* ── Megerősítő modál ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 24px;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}

.modal-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 28px 24px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-msg {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #1a1a1a;
  margin: 0 0 24px;
  line-height: 1.5;
}

.modal-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.modal-btn {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.modal-btn--cancel {
  background: #f5f5f3;
  color: #555;
  border: 1.5px solid #e0ddd8;
}

.modal-btn--cancel:hover {
  border-color: #aaa;
  color: #1a1a1a;
}

.modal-btn--confirm {
  background: #e74c3c;
  color: white;
  border: 1.5px solid #e74c3c;
}

.modal-btn--confirm:hover {
  background: #c0392b;
  border-color: #c0392b;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.92);
  opacity: 0;
}

@media (max-width: 480px) {
  .modal-box {
    padding: 24px 20px 20px;
  }

  .modal-btns {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
    text-align: center;
  }
}

/* ── Reszponzív ── */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.8rem;
  }

  .form-grid {
    grid-template-columns: 1fr 1fr;
  }

  .admin-panel {
    padding: 20px;
  }

  .day-header {
    padding: 14px 16px;
  }

  .meals-row {
    padding: 20px;
    gap: 12px;
  }

  .recipe-card {
    flex: 0 0 220px;
  }
}

@media (max-width: 480px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .recipe-card {
    flex: 0 0 200px;
  }

  .form-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-save {
    text-align: center;
    justify-content: center;
  }
}
</style>