<template>
  <div class="profile-page fade-in">
    <h2 class="my-recipes-title">Saját receptjeim:</h2>

    <div class="controls-left">
      <button class="add-button" @click="$router.push('/uj-recept')">
        ➕ Új recept hozzáadása
      </button>
      <input v-model="searchTerm" @input="page = 1" placeholder="Keresés..." class="search-input" />
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="paginatedRecipes.length === 0 && !error" class="no-recipes">
      Nincs megjeleníthető recept.
    </div>

    <div class="recipe-list">
      <div v-for="recipe in paginatedRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image-wrapper">
          <img 
            :src="getImageUrl(recipe)" 
            @error="onImageError(recipe.id, $event)"
            :alt="recipe.title" 
            class="recipe-img"
          />
        </div>

        <h4 class="recipe-title">{{ recipe.title }}</h4>

        <div class="ingredients-scroll">
          <p class="ingredients">
            <strong>Hozzávalók:</strong> {{ formatIngredients(recipe.ingredients) }}
          </p>
        </div>

        <div class="author-info">
          <span class="author-icon">👤</span>
          <span class="author-email">{{ recipe.authorEmail }}</span>
        </div>

        <div class="card-buttons">
          <button class="edit-btn" @click.stop="$router.push(`/szerkesztes/${recipe.id}`)">
            <span>📝 Szerkesztés</span>
          </button>
          <button class="delete-btn" @click.stop="deleteRecipe(recipe.id)">
            <span>🗑️ Törlés</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="page === 1" class="page-btn page-btn-long">«</button>
      <button 
        v-for="p in totalPages" 
        :key="p" 
        @click="goToPage(p)" 
        :class="['page-btn', { active: page === p }]"
      >
        {{ p }}
      </button>
      <button @click="nextPage" :disabled="page >= totalPages" class="page-btn page-btn-long">»</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ProfilePage',
  data() {
    return {
      userEmail: '',
      myRecipes: [],
      searchTerm: '',
      error: null,
      page: 1,
      pageSize: 8,
      failedImages: new Set()
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.myRecipes
      const q = this.searchTerm.toLowerCase()
      return this.myRecipes.filter(r =>
        r.title && r.title.toLowerCase().includes(q)
      )
    },
    totalPages() {
      return Math.ceil(this.filteredRecipes.length / this.pageSize);
    },
    paginatedRecipes() {
      const start = (this.page - 1) * this.pageSize;
      return this.filteredRecipes.slice(start, start + this.pageSize);
    }
  },
  async mounted() {
    this.extractUserEmail()
    await this.fetchRecipes()
  },
  methods: {
    extractUserEmail() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          this.userEmail = payload.unique_name || payload.email || payload.sub || '';
        } catch (err) { console.warn('JWT decode error:', err) }
      }
    },
    getImageUrl(recipe) {
      const baseUrl = "https://localhost:5150/";
      const defaultImg = baseUrl + "images/recipes/default.jpg";
      if (this.failedImages.has(recipe.id) || !recipe.imagePath) return defaultImg;
      if (recipe.imagePath.startsWith('http')) return recipe.imagePath;
      const fileName = recipe.imagePath.split(/[\\/]/).pop();
      return `${baseUrl}images/recipes/${fileName}`;
    },
    onImageError(recipeId, event) {
      event.target.onerror = null;
      this.failedImages.add(recipeId);
      event.target.src = "https://localhost:5150/images/recipes/default.jpg";
    },
    formatIngredients(ingredients) {
      if (!ingredients || ingredients.length === 0) return 'Nincs megadva'
      return ingredients
        .map(ing => (typeof ing === 'string' ? ing : `${ing.name} (${ing.quantity} ${ing.unit || ''})`))
        .join(', ')
    },
    async fetchRecipes() {
      try {
        const token = localStorage.getItem('token')
        if (!token) { this.$router.push('/login'); return; }
        const res = await axios.get(`https://localhost:5150/api/Recipes/my`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.myRecipes = res.data.items || (Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        this.error = 'Nem sikerült betölteni a receptjeidet.'
        if (err.response?.status === 401) this.$router.push('/login');
      }
    },
    async deleteRecipe(id) {
      if (!confirm('Biztosan törölni szeretnéd ezt a receptet?')) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`https://localhost:5150/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await this.fetchRecipes()
      } catch (err) {
        alert('Hiba történt a törlés során!')
      }
    },
    goToPage(p) {
      this.page = p;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    nextPage() { if (this.page < this.totalPages) this.goToPage(this.page + 1); },
    prevPage() { if (this.page > 1) this.goToPage(this.page - 1); }
  }
}
</script>

<style scoped>
.profile-page { max-width: 1200px; margin: 60px auto; padding: 0 20px; }
.my-recipes-title { 
  font-size: 1.6rem; font-weight: bold; 
  background: linear-gradient(to right, #FF8C00, #FFD700); 
  -webkit-background-clip: text; background-clip: text; color: transparent; 
  margin-bottom: 20px;
}
.controls-left { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; }
.add-button { 
  padding: 8px 16px; border-radius: 10px; border: none; cursor: pointer; 
  background: linear-gradient(135deg, #FF8C00, #FF4500); color: white; 
  font-weight: bold; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(255,140,0,0.2);
}
.search-input { padding: 8px 12px; border-radius: 10px; border: 1px solid #ddd; width: 220px; background: rgba(255,255,255,0.9); }

.recipe-list { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 20px; 
}

/* --- ITT A JAVÍTÁS A STÍLUS MEGTARTÁSÁVAL --- */
.recipe-card { 
  height: 400px; 
  display: flex; 
  flex-direction: column; 
  padding: 15px; 
  border-radius: 20px; 
  /* Megtartott eredeti stílus */
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.35), rgba(255, 165, 0, 0.05)); 
  backdrop-filter: blur(8px); 
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.2);

  /* A remegés elleni védelem: Elszigeteljük a kártyát a külvilágtól */
  contain: layout;
  transform: translateZ(0);
  will-change: transform;
}

.recipe-image-wrapper { 
  width: 100%; 
  height: 130px; 
  min-height: 130px; 
  overflow: hidden; 
  border-radius: 12px; 
  margin-bottom: 8px; 
  background: rgba(255,255,255,0.1); 
  flex-shrink: 0;
}

.recipe-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  /* Kényszerítjük a böngészőt, hogy ne akarja betöltés közben rángatni */
  image-rendering: -webkit-optimize-contrast;
}

.ingredients-scroll { 
  flex: 1; 
  overflow-y: auto; 
  font-size: 0.75rem; 
  background: rgba(255,255,255,0.25); 
  padding: 8px; 
  border-radius: 10px; 
  margin-bottom: 10px; 
}

.card-buttons { display: flex; gap: 6px; margin-top: auto; }
.edit-btn { background: #FFB300; flex: 1; color: white; border: none; padding: 8px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.delete-btn { background: #FF5252; flex: 1; color: white; border: none; padding: 8px; border-radius: 8px; cursor: pointer; font-weight: bold; }

/* Belső görgetősáv dizájn */
.ingredients-scroll::-webkit-scrollbar { width: 4px; }
.ingredients-scroll::-webkit-scrollbar-thumb { background: rgba(255, 140, 0, 0.5); border-radius: 4px; }
</style>