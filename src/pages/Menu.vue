<template>
  <div class="weekly-menu-page">
    <h1 class="page-title">📅 Heti Menü</h1>

    <!-- ADMIN: Új menü hozzáadása -->
    <div v-if="isAdmin" class="admin-panel glass-box">
      <h3>Új napi menü hozzáadása</h3>
      <form @submit.prevent="addMenuItem" class="add-form">
        <div class="form-group">
          <label>Nap</label>
          <select v-model="newItem.day" required>
            <option :value="null" disabled>Válassz napot...</option>
            <option v-for="day in daysOfWeek" :key="day.value" :value="day.value">
              {{ day.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Leves (opcionális)</label>
          <select v-model="newItem.soupId">
            <option :value="null">— Nincs leves —</option>
            <option v-for="r in soups" :key="r.id" :value="r.id">{{ r.title }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Főétel (kötelező)</label>
          <select v-model="newItem.mainCourseId" required>
            <option :value="null" disabled>Válassz főételt...</option>
            <option v-for="r in mainCourses" :key="r.id" :value="r.id">{{ r.title }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Desszert (opcionális)</label>
          <select v-model="newItem.dessertId">
            <option :value="null">— Nincs desszert —</option>
            <option v-for="r in desserts" :key="r.id" :value="r.id">{{ r.title }}</option>
          </select>
        </div>

        <button type="submit" class="btn-add">Hozzáadás</button>
      </form>

      <p v-if="addError" class="error">{{ addError }}</p>
      <p v-if="addSuccess" class="success">{{ addSuccess }}</p>
    </div>

    <!-- Heti menü megjelenítése -->
    <div class="menu-grid">
      <div
        v-for="day in orderedDays"
        :key="day.value"
        class="day-card glass-box"
        :class="{ 'has-menu': day.menu }"
      >
        <div class="day-header">
          <h2>{{ day.label }}</h2>
          <button
            v-if="isAdmin && day.menu"
            @click="deleteMenuItem(day.menu.id)"
            class="delete-btn"
            title="Törlés"
          >
            ✕
          </button>
        </div>

        <div v-if="day.menu" class="meals">
          <div class="meal" v-if="day.menu.soup">
            <strong>Leves:</strong> {{ day.menu.soup.title }}
          </div>
          <div class="meal">
            <strong>Főétel:</strong> {{ day.menu.mainCourse.title }}
          </div>
          <div class="meal" v-if="day.menu.dessert">
            <strong>Desszert:</strong> {{ day.menu.dessert.title }}
          </div>
        </div>

        <div v-else class="no-menu">
          <em>Még nincs menü erre a napra</em>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { authState } from '@/auth.js'

const API_BASE = 'https://localhost:5150/api' // <--- igazítsd a saját backend URL-edhez!

const daysOfWeek = [
  { label: 'Hétfő', value: 1 },
  { label: 'Kedd', value: 2 },
  { label: 'Szerda', value: 3 },
  { label: 'Csütörtök', value: 4 },
  { label: 'Péntek', value: 5 },
  { label: 'Szombat', value: 6 },
  { label: 'Vasárnap', value: 0 }
]

export default {
  name: 'WeeklyMenu',
  data() {
    return {
      weeklyMenu: [],
      allRecipes: [],
      newItem: {
        day: null,
        soupId: null,
        mainCourseId: null,
        dessertId: null
      },
      addError: '',
      addSuccess: '',
      daysOfWeek
    }
  },
  computed: {
    isAdmin() {
      return authState.isAdmin
    },
    orderedDays() {
      return daysOfWeek.map(d => {
        const menuItem = this.weeklyMenu.find(m => m.dayOfWeek === d.value)
        return { ...d, menu: menuItem || null }
      })
    },
    soups() {
      return this.allRecipes.filter(r => r.category === 'Leves')
    },
    mainCourses() {
      return this.allRecipes.filter(r => r.category === 'Főétel')
    },
    desserts() {
      return this.allRecipes.filter(r => r.category === 'Desszert')
    }
  },
  async mounted() {
    await this.loadWeeklyMenu()
    await this.loadRecipes()
  },
  methods: {
    async loadWeeklyMenu() {
      try {
        const res = await axios.get(`${API_BASE}/weeklymenu`)
        this.weeklyMenu = res.data // már tartalmazza a Soup, MainCourse, Dessert objektumokat
      } catch (err) {
        console.error('Heti menü betöltése sikertelen', err)
      }
    },
    async loadRecipes() {
      try {
        const res = await axios.get(`${API_BASE}/recipes`)
        this.allRecipes = res.data
      } catch (err) {
        console.error('Receptek betöltése sikertelen', err)
      }
    },
    async addMenuItem() {
      this.addError = ''
      this.addSuccess = ''

      if (!this.newItem.mainCourseId) {
        this.addError = 'A főétel kötelező!'
        return
      }

      const payload = {
        dayOfWeek: this.newItem.day,
        soupId: this.newItem.soupId || null,
        mainCourseId: this.newItem.mainCourseId,
        dessertId: this.newItem.dessertId || null
      }

      try {
        const token = localStorage.getItem('token')
        await axios.post(`${API_BASE}/weeklymenu`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.addSuccess = 'Menü sikeresen hozzáadva!'
        this.newItem = { day: null, soupId: null, mainCourseId: null, dessertId: null }
        await this.loadWeeklyMenu()
        setTimeout(() => (this.addSuccess = ''), 4000)
      } catch (err) {
        this.addError = err.response?.data || 'Hiba történt a hozzáadáskor'
      }
    },
    async deleteMenuItem(id) {
      if (!confirm('Biztosan törlöd ezt a napi menüt?')) return

      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE}/weeklymenu/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await this.loadWeeklyMenu()
      } catch (err) {
        alert('Hiba történt a törléskor')
      }
    }
  }
}
</script>

<style scoped>
.weekly-menu-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  color: #e67e22;
  margin-bottom: 30px;
  font-size: 2.2rem;
}

/* Admin panel */
.admin-panel {
  margin-bottom: 40px;
  padding: 20px;
}

.admin-panel h3 {
  margin-top: 0;
  color: #d35400;
}

.add-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
}

.form-group select {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
}

.btn-add {
  grid-column: 1 / -1;
  padding: 12px;
  background: #e67e22;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-add:hover {
  background: #d35400;
}

.error { color: #e74c3c; margin-top: 10px; }
.success { color: #27ae60; margin-top: 10px; }

/* Menü grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.day-card {
  position: relative;
  padding: 20px;
  border-radius: 16px;
  min-height: 180px;
  transition: transform 0.3s;
}

.day-card:hover {
  transform: translateY(-4px);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.day-header h2 {
  margin: 0;
  color: #e67e22;
  font-size: 1.5rem;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #c0392b;
}

.meals .meal {
  margin: 12px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  font-size: 1.05rem;
}

.no-menu {
  color: #777;
  font-style: italic;
  text-align: center;
  padding-top: 30px;
}

/* Glass effektus (az oldal többi részéhez illő) */
.glass-box {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(6px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Reszponzív */
@media (max-width: 768px) {
  .add-form {
    grid-template-columns: 1fr;
  }
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>