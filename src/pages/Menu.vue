<template>
  <div class="weekly-menu-page fade-in">
    <h1 class="page-title">📅 Heti Menü Tervező</h1>

    <div v-if="isAdmin" class="admin-panel glass-box">
      <h3>🛠️ Új napi menü hozzáadása</h3>
      <form @submit.prevent="addMenuItem" class="add-form">
        <div class="form-grid">
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
        </div>
        <button class="btn-add" type="submit">💾 Menü mentése</button>
      </form>
      <p v-if="addError" class="error">{{ addError }}</p>
      <p v-if="addSuccess" class="success">{{ addSuccess }}</p>
    </div>

    <div class="weekly-menu">
      <div v-for="day in orderedDays" :key="day.value" class="day-row glass-box">
        <div class="day-header">
          <h2 class="day-label">{{ day.label }}</h2>
          <button v-if="isAdmin && day.menu" class="delete-btn-top" @click="deleteMenuItem(day.menu.id)" title="Nap törlése">✕</button>
        </div>

        <div v-if="day.menu" class="meals-grid">
          <div v-for="recipe in menuRecipes(day.menu)" :key="recipe.id" class="recipe-card">
            <div class="recipe-img-container">
              <img 
                :src="getImageUrl(recipe)" 
                @error="handleImgError(recipe)" 
                :alt="recipe.title" 
              />
              <span class="category-badge">{{ recipe.category }}</span>
            </div>
            <div class="recipe-info">
              <h4>{{ recipe.title }}</h4>
              <button class="view-btn" @click="$router.push(`/recept/${recipe.id}`)">👁️ Megtekintés</button>
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

export default {
  name: 'WeeklyMenu',
  data() {
    return {
      weeklyMenu: [],
      allRecipes: [],
      brokenImages: [],
      newItem: { day: null, soupId: null, mainCourseId: null, dessertId: null },
      addError: '',
      addSuccess: '',
      daysOfWeek: [
        { label: 'Hétfő', value: 1 },
        { label: 'Kedd', value: 2 },
        { label: 'Szerda', value: 3 },
        { label: 'Csütörtök', value: 4 },
        { label: 'Péntek', value: 5 },
        { label: 'Szombat', value: 6 },
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
        const res = await axios.get('https://localhost:5150/api/weeklymenu');
        this.weeklyMenu = res.data || [];
      } catch (e) {
        this.weeklyMenu = [];
      }
    },
    async loadRecipes() {
      try {
        const res = await axios.get('https://localhost:5150/api/recipes', { params: { page: 1, pageSize: 1000 } });
        this.allRecipes = res.data.items || [];
      } catch (e) {
        console.error("Hiba a receptek betöltésekor:", e);
      }
    },
    menuRecipes(menu) {
      if (!menu) return [];
      // Csak azokat adjuk vissza, amik tényleg léteznek
      return [menu.soup, menu.mainCourse, menu.dessert].filter(r => r && r.title);
    },
    getImageUrl(recipe) {
      if (!recipe) return 'https://localhost:5150/images/default.jpg';
      
      // Ha már elbukott a kép betöltése, placeholder-t adunk (NEM remeg)
      if (this.brokenImages.includes(recipe.id)) {
        return `https://placehold.co/400x300?text=${recipe.title}`;
      }
      
      if (!recipe.imagePath) {
        return 'https://localhost:5150/images/default.jpg';
      }

      // Pontos útvonal a recipes mappába
      const fileName = recipe.imagePath.split(/[\\/]/).pop();
      return `https://localhost:5150/images/recipes/${fileName}`;
    },
    handleImgError(recipe) {
      if (!this.brokenImages.includes(recipe.id)) {
        this.brokenImages.push(recipe.id);
      }
    },
    async addMenuItem() {
      try {
        const token = localStorage.getItem('token');
        await axios.post('https://localhost:5150/api/weeklymenu', 
          { 
            dayOfWeek: this.newItem.day, 
            soupId: this.newItem.soupId, 
            mainCourseId: this.newItem.mainCourseId, 
            dessertId: this.newItem.dessertId 
          }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        this.newItem = { day: null, soupId: null, mainCourseId: null, dessertId: null };
        this.addSuccess = '✅ Menü sikeresen elmentve!';
        await this.loadWeeklyMenu();
        setTimeout(() => this.addSuccess = '', 3000);
      } catch (err) {
        this.addError = '❌ Hiba történt a mentés során.';
        setTimeout(() => this.addError = '', 3000);
      }
    },
    async deleteMenuItem(id) {
      if (!confirm('Biztosan törölni szeretnéd ezt a napi menüt?')) return;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://localhost:5150/api/weeklymenu/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await this.loadWeeklyMenu();
      } catch (e) {
        console.error("Törlési hiba:", e);
      }
    }
  }
}
</script>

<style scoped>
.weekly-menu-page { max-width: 95%; margin: 40px auto; padding: 0 40px; min-height: 85vh; }

.page-title { 
  text-align: center; 
  font-weight: 800; 
  font-size: 3rem; 
  font-family: 'Playfair Display', serif; 
  background: linear-gradient(to right, #d35400, #ff8c00); 
  -webkit-background-clip: text; 
  background-clip: text; /* Ez a standard sor a kompatibilitáshoz */
  color: transparent; 
  margin-bottom: 50px; 
}

.glass-box { 
  background: rgba(255, 255, 255, 0.6); 
  backdrop-filter: blur(12px); 
  border-radius: 24px; 
  padding: 30px; 
  margin-bottom: 40px; 
  box-shadow: 0 8px 32px rgba(0,0,0,0.05); 
  border: 1px solid rgba(255,255,255,0.3); 
}

.day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.day-label { font-family: 'Playfair Display', serif; color: #a0522d; font-weight: 700; border-bottom: 3px solid #ffd17a; padding-bottom: 5px; margin: 0; }

.meals-grid { display: flex; flex-direction: row; gap: 20px; overflow-x: auto; padding-bottom: 10px; }

.recipe-card { flex: 0 0 320px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; transition: transform 0.3s; }
.recipe-card:hover { transform: translateY(-8px); }

.recipe-img-container { position: relative; height: 200px; background: #f0f0f0; }
.recipe-img-container img { width: 100%; height: 100%; object-fit: cover; }

.category-badge { position: absolute; top: 12px; left: 12px; background: #FF8C00; color: white; padding: 5px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: bold; }

.recipe-info { padding: 20px; flex: 1; display: flex; flex-direction: column; }
.view-btn { background: #FFB300; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; margin-top: auto; }

.btn-add { background: linear-gradient(135deg, #FF8C00, #FF4500); color: white; font-weight: bold; border: none; padding: 15px 30px; border-radius: 12px; cursor: pointer; margin-top: 20px; width: 100%; }
.delete-btn-top { background: #ff5252; color: white; border: none; width: 35px; height: 35px; border-radius: 10px; cursor: pointer; }

.error { color: #d63031; text-align: center; margin-top: 10px; }
.success { color: #27ae60; text-align: center; margin-top: 10px; }
.fade-in { animation: fadeIn 0.5s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
select { padding: 12px; border-radius: 10px; border: 1px solid #ddd; background: white; }
</style>