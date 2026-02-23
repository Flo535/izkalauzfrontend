<template>
  <div class="weekly-menu-page fade-in">
    <h1 class="page-title">📅 Heti Menü Tervező</h1>

    <div v-if="isAdmin" class="admin-panel glass-box">
      <h3>🛠️ Új napi menü hozzáadása</h3>
      <form @submit.prevent="addMenuItem" class="add-form">
        <select v-model="newItem.day" required>
          <option :value="null" disabled>Válassz napot...</option>
          <option v-for="d in daysOfWeek" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>

        <select v-model="newItem.soupId">
          <option :value="null">— Nincs leves —</option>
          <option v-for="r in soups" :key="r.id" :value="r.id">{{ r.title }}</option>
        </select>

        <select v-model="newItem.mainCourseId" required>
          <option :value="null" disabled>Főétel kiválasztása *</option>
          <option v-for="r in mainCourses" :key="r.id" :value="r.id">{{ r.title }}</option>
        </select>

        <select v-model="newItem.dessertId">
          <option :value="null">— Nincs desszert —</option>
          <option v-for="r in desserts" :key="r.id" :value="r.id">{{ r.title }}</option>
        </select>

        <button class="btn-add" type="submit">💾 Menü mentése</button>
      </form>
      <p v-if="addError" class="error">{{ addError }}</p>
      <p v-if="addSuccess" class="success">{{ addSuccess }}</p>
    </div>

    <div class="weekly-menu">
      <div v-for="day in orderedDays" :key="day.value" class="day-row glass-box">
        <div class="day-header">
          <h2 class="day-label">{{ day.label }}</h2>
          <button v-if="isAdmin && day.menu" class="delete-btn-top" @click="deleteMenuItem(day.menu.id)" title="Nap törlése">
            ✕
          </button>
        </div>

        <div v-if="day.menu" class="meals-grid">
          <div v-for="recipe in menuRecipes(day.menu)" :key="recipe.id" class="recipe-card">
            <div class="recipe-img-container">
              <img :src="fullImagePath(recipe.imagePath)" @error="onImageError" :alt="recipe.title" />
              <span class="category-badge">{{ recipe.category }}</span>
            </div>
            <div class="recipe-info">
              <h4>{{ recipe.title }}</h4>
              <button class="view-btn" @click="$router.push(`/recept/${recipe.id}`)">
                👁️ Megtekintés
              </button>
            </div>
          </div>
        </div>

        <div v-else class="no-menu">
          <p>🍳 Erre a napra még nem állítottak össze menüt.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { authState } from '@/auth.js'

const API_BASE = 'https://localhost:5150/api'

export default {
  name: 'WeeklyMenu',
  data() {
    return {
      weeklyMenu: [],
      allRecipes: [],
      newItem: { day: null, soupId: null, mainCourseId: null, dessertId: null },
      addError: '',
      addSuccess: '',
      daysOfWeek: [
        { label: 'Hétfő', value: 1 }, { label: 'Kedd', value: 2 },
        { label: 'Szerda', value: 3 }, { label: 'Csütörtök', value: 4 },
        { label: 'Péntek', value: 5 }, { label: 'Szombat', value: 6 },
        { label: 'Vasárnap', value: 0 }
      ]
    }
  },
  computed: {
    isAdmin() { return authState.isAdmin },
    orderedDays() {
      const menuArray = Array.isArray(this.weeklyMenu) ? this.weeklyMenu : [];
      return this.daysOfWeek.map(d => ({
        ...d,
        menu: menuArray.find(m => m.dayOfWeek === d.value) || null
      }))
    },
    soups() { return this.allRecipes.filter(r => r.category === 'Leves') },
    mainCourses() { return this.allRecipes.filter(r => r.category === 'Főétel') },
    desserts() { return this.allRecipes.filter(r => r.category === 'Desszert') }
  },
  async mounted() {
    await Promise.all([this.loadRecipes(), this.loadWeeklyMenu()]);
  },
  methods: {
    async loadWeeklyMenu() {
      try {
        const res = await axios.get(`${API_BASE}/weeklymenu`)
        this.weeklyMenu = res.data || []
      } catch (e) { 
        this.weeklyMenu = [];
      }
    },
    async loadRecipes() {
      try {
        const res = await axios.get(`${API_BASE}/recipes`, { params: { page: 1, pageSize: 1000 } })
        this.allRecipes = res.data.items || []
      } catch (e) { 
        console.error("Recept hiba:", e);
      }
    },
    menuRecipes(menu) {
      if (!menu) return []
      return [menu.soup, menu.mainCourse, menu.dessert].filter(r => r && r.title)
    },
    fullImagePath(path) {
      if (!path) return 'https://localhost:5150/Images/default.jpg'
      const fileName = path.split(/[\\/]/).pop();
      return `https://localhost:5150/Images/${fileName}`
    },
    onImageError(e) { 
      e.target.src = 'https://localhost:5150/Images/default.jpg' 
    },
    async addMenuItem() {
      try {
        const token = localStorage.getItem('token')
        await axios.post(`${API_BASE}/weeklymenu`, {
          dayOfWeek: this.newItem.day,
          soupId: this.newItem.soupId,
          mainCourseId: this.newItem.mainCourseId,
          dessertId: this.newItem.dessertId
        }, { headers: { Authorization: `Bearer ${token}` } })
        
        this.newItem = { day: null, soupId: null, mainCourseId: null, dessertId: null }
        this.addSuccess = '✅ Menü sikeresen mentve!'
        await this.loadWeeklyMenu()
        setTimeout(() => this.addSuccess = '', 3000)
      } catch (err) { 
        this.addError = '❌ Hiba a mentés során.' 
      }
    },
    async deleteMenuItem(id) {
      if (!confirm('Biztosan törlöd?')) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE}/weeklymenu/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await this.loadWeeklyMenu()
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<style scoped>
/* 1. MAIN AREA SZÉLESÍTÉSE ÉS EMELÉSE (9-es szint) */
.weekly-menu-page { 
  max-width: 95%;           /* Szélesebb lett */
  margin: 40px auto; 
  padding: 0 40px;          /* Több margó a széleken */
  min-height: 85vh;         /* Megemelt tartalom */
}

.page-title {
  text-align: center; font-weight: 800; font-size: 3rem;
  font-family: 'Playfair Display', serif;
  background: linear-gradient(to right, #d35400, #ff8c00);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  margin-bottom: 50px;
}

/* 2. NAPOK CÍMEI */
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.day-label {
  font-family: 'Playfair Display', serif;
  color: #a0522d;
  font-weight: 700;
  border-bottom: 3px solid #ffd17a;
  padding-bottom: 5px;
  margin: 0;
}

/* 3. JAVÍTOTT KÁRTYA ELRENDEZÉS - EGY SORBA KÉNYSZERÍTVE */
.meals-grid { 
  display: flex;             /* Grid helyett Flexbox a jobb kontrollért */
  flex-direction: row; 
  gap: 20px; 
  justify-content: flex-start;
  flex-wrap: nowrap;         /* TILOS a törés */
  overflow-x: auto;          /* Ha nem férne ki, görgethető legyen */
  padding-bottom: 10px;
}

.recipe-card {
  flex: 0 0 calc(33.333% - 14px); /* Pontosan a harmada mínusz a gap fele */
  min-width: 280px;          /* De ne legyen túl keskeny */
  background: white; border-radius: 20px; overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08); 
  display: flex; flex-direction: column;
  transition: transform 0.3s;
}

/* Mobilos finomítás */
@media (max-width: 1100px) {
  .meals-grid {
    flex-wrap: wrap;         /* Itt már engedjük a törést */
  }
  .recipe-card {
    flex: 1 1 300px;         /* Kitölti a helyet, ha törik */
  }
}

.recipe-card:hover { transform: translateY(-8px); }
.recipe-img-container { position: relative; height: 200px; }
.recipe-img-container img { width: 100%; height: 100%; object-fit: cover; }

.category-badge {
  position: absolute; top: 12px; left: 12px; 
  background: linear-gradient(135deg, #FF8C00, #e67e22); color: white; 
  padding: 5px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: bold;
}

.recipe-info { padding: 20px; display: flex; flex-direction: column; flex: 1; }
.recipe-info h4 { font-size: 1.2rem; color: #333; margin-bottom: 15px; font-weight: 700; }

.view-btn {
  background: linear-gradient(135deg, #FFB300, #ffa000); color: white; border: none; padding: 12px;
  border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; margin-top: auto;
}

.glass-box {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px); border-radius: 24px; padding: 30px; margin-bottom: 40px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.05); border: 1px solid rgba(255,255,255,0.3);
}

.btn-add { 
  background: linear-gradient(135deg, #FF8C00, #FF4500); color: white; 
  font-weight: bold; border: none; padding: 12px; border-radius: 10px; cursor: pointer;
}

.delete-btn-top { background: #ff5252; color: white; border: none; width: 35px; height: 35px; border-radius: 10px; cursor: pointer; font-weight: bold; }
.no-menu { text-align: center; padding: 30px; color: #777; font-style: italic; }
.fade-in { animation: fadeIn 0.5s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>