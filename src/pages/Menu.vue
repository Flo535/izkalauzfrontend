<template>
  <div class="weekly-menu-page">
    <h1 class="page-title">📅 Heti Menü</h1>

    <!-- ADMIN PANEL -->
    <div v-if="isAdmin" class="admin-panel glass-box">
      <h3>Új napi menü hozzáadása</h3>

      <form @submit.prevent="addMenuItem" class="add-form">
        <select v-model="newItem.day" required>
          <option disabled :value="null">Nap</option>
          <option v-for="d in daysOfWeek" :key="d.value" :value="d.value">
            {{ d.label }}
          </option>
        </select>

        <select v-model="newItem.soupId">
          <option :value="null">— Nincs leves —</option>
          <option v-for="r in soups" :key="r.id" :value="r.id">
            {{ r.title }}
          </option>
        </select>

        <select v-model="newItem.mainCourseId" required>
          <option disabled :value="null">Főétel *</option>
          <option v-for="r in mainCourses" :key="r.id" :value="r.id">
            {{ r.title }}
          </option>
        </select>

        <select v-model="newItem.dessertId">
          <option :value="null">— Nincs desszert —</option>
          <option v-for="r in desserts" :key="r.id" :value="r.id">
            {{ r.title }}
          </option>
        </select>

        <button class="btn-add">Hozzáadás</button>
      </form>

      <p v-if="addError" class="error">{{ addError }}</p>
      <p v-if="addSuccess" class="success">{{ addSuccess }}</p>
    </div>

    <!-- HETI MENÜ -->
    <div class="weekly-menu">
      <div
        v-for="day in orderedDays"
        :key="day.value"
        class="day-row glass-box"
      >
        <div class="day-header">
          <h2>{{ day.label }}</h2>

          <button
            v-if="isAdmin && day.menu"
            class="delete-btn"
            @click="deleteMenuItem(day.menu.id)"
          >
            ✕
          </button>
        </div>

        <div v-if="day.menu" class="meals-row">
          <RecipeList
            :recipes="menuRecipes(day.menu)"
          />
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
import RecipeList from '../components/Recipe/RecipeList.vue'

const API_BASE = 'https://localhost:5150/api'

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
  components: { RecipeList },
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
      return daysOfWeek.map(d => ({
        ...d,
        menu: this.weeklyMenu.find(m => m.dayOfWeek === d.value) || null
      }))
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
      const res = await axios.get(`${API_BASE}/weeklymenu`)
      this.weeklyMenu = res.data
    },
    async loadRecipes() {
      const res = await axios.get(`${API_BASE}/recipes`, {
        params: { page: 1, pageSize: 1000 }
      })
      this.allRecipes = res.data.items
    },
    menuRecipes(menu) {
      return [
        menu.soup,
        menu.mainCourse,
        menu.dessert
      ].filter(Boolean)
    },
    async addMenuItem() {
      if (!this.newItem.mainCourseId) {
        this.addError = 'A főétel kötelező'
        return
      }

      const token = localStorage.getItem('token')
      await axios.post(`${API_BASE}/weeklymenu`, {
        dayOfWeek: this.newItem.day,
        soupId: this.newItem.soupId,
        mainCourseId: this.newItem.mainCourseId,
        dessertId: this.newItem.dessertId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      this.newItem = { day: null, soupId: null, mainCourseId: null, dessertId: null }
      this.addSuccess = 'Sikeres mentés'
      await this.loadWeeklyMenu()
      setTimeout(() => this.addSuccess = '', 3000)
    },
    async deleteMenuItem(id) {
      if (!confirm('Biztos törlöd?')) return
      const token = localStorage.getItem('token')
      await axios.delete(`${API_BASE}/weeklymenu/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await this.loadWeeklyMenu()
    }
  }
}
</script>

<style scoped>
.weekly-menu-page {
  max-width: 1400px;
  margin: auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  color: #e67e22;
  font-size: 2.3rem;
  margin-bottom: 30px;
}

.weekly-menu {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 1 nap = 1 sor */
.day-row {
  width: 100%;
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
}

.meals-row {
  width: 100%;
}

/* FELÜLÍRJUK a RecipeList gridet → vízszintes sor */
.meals-row :deep(.recipe-list) {
  display: flex;
  gap: 20px;
}

/* Receptkártyák egységes szélességgel */
.meals-row :deep(.recipe-card) {
  flex: 1;
  min-width: 280px;
}

.delete-btn {
  background: #e74c3c;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
}

.no-menu {
  text-align: center;
  color: #777;
  padding: 20px;
}

/* Admin */
.add-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.add-form select,
.btn-add {
  padding: 10px;
  border-radius: 8px;
}

.btn-add {
  background: #e67e22;
  color: white;
  border: none;
  grid-column: 1 / -1;
}

.glass-box {
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(6px);
  border-radius: 16px;
  padding: 20px;
}

/* Mobil */
@media (max-width: 900px) {
  .meals-row :deep(.recipe-list) {
    flex-direction: column;
  }
}
</style>
