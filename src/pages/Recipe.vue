<template>
  <div class="recipe-page fade-in">
    <h2 class="page-title">Receptek</h2>

    <div class="controls-left">
      <input v-model="searchTerm" @input="page = 1" placeholder="Keresés a receptek között" class="search-input" />
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="paginatedRecipes.length === 0 && !error" class="no-recipes">
      Nincs megjeleníthető recept.
    </div>

    <div class="recipe-list">
      <div v-for="recipe in paginatedRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image-wrapper">
          <img 
            v-if="recipe.imagePath" 
            :src="fullImagePath(recipe)" 
            alt="Recept képe"
            @error="onImgError(recipe.id, $event)"
            class="recipe-img"
          />
          <div v-else class="recipe-no-image">Nincs kép</div>
        </div>

        <div class="recipe-content">
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
        </div>

        <div class="card-buttons">
          <button class="view-btn" @click="viewRecipe(recipe.id)">Megnézem</button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
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
import axios from 'axios';

export default {
  name: 'Recipes',
  data() {
    return {
      allRecipes: [], // Ide töltjük be az összeset egyszerre
      searchTerm: '',
      error: null,
      page: 1,
      pageSize: 8,
      failedImages: new Set()
    }
  },
  computed: {
    // 1. Először szűrünk a kereső alapján
    filteredRecipes() {
      if (!this.searchTerm) return this.allRecipes;
      const q = this.searchTerm.toLowerCase();
      return this.allRecipes.filter(r => 
        r.title && r.title.toLowerCase().includes(q)
      );
    },
    // 2. Kiszámoljuk az oldalak számát a szűrt listából
    totalPages() {
      return Math.ceil(this.filteredRecipes.length / this.pageSize);
    },
    // 3. Kivágjuk az aktuális 8 receptet
    paginatedRecipes() {
      const start = (this.page - 1) * this.pageSize;
      return this.filteredRecipes.slice(start, start + this.pageSize);
    }
  },
  async mounted() {
    await this.fetchRecipes();
  },
  methods: {
    async fetchRecipes() {
      try {
        // Lehívjuk az ÖSSZES receptet (nem küldünk page paramétert)
        const res = await axios.get(`https://localhost:5150/api/Recipes`);
        // Ha a backend listát küld, az res.data lesz, ha objektumot, akkor res.data.items
        this.allRecipes = Array.isArray(res.data) ? res.data : (res.data.items || []);
      } catch (err) { 
        this.error = "Hiba a receptek lekérésekor."; 
        console.error(err);
      }
    },
    fullImagePath(recipe) {
      const baseUrl = "https://localhost:5150/";
      if (this.failedImages.has(recipe.id) || !recipe.imagePath) return baseUrl + "images/recipes/default.jpg";
      let cleanPath = recipe.imagePath.replace(/\\/g, '/');
      if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
      if (!cleanPath.includes('images/')) cleanPath = 'images/recipes/' + cleanPath;
      return baseUrl + cleanPath;
    },
    onImgError(recipeId, event) {
      event.target.onerror = null;
      this.failedImages.add(recipeId);
      event.target.src = "https://localhost:5150/images/recipes/default.jpg";
    },
    formatIngredients(ingredients) {
      if (!ingredients || ingredients.length === 0) return 'Nincs megadva';
      return ingredients.map(i => i.name).join(', ');
    },
    viewRecipe(id) { this.$router.push(`/recept/${id}`); },
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
/* A stílusok maradnak a régiek, az App.vue-ból jön a pagination */
.recipe-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.page-title { font-size: 1.75rem; font-weight: bold; margin-bottom: 20px; background: linear-gradient(to right, #FF8C00, #FFD700); -webkit-background-clip: text; background-clip: text; color: transparent; }
.recipe-list { display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; }
.recipe-card { flex: 0 0 calc(25% - 20px); min-width: 250px; height: 420px; display: flex; flex-direction: column; padding: 15px; border-radius: 16px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: all 0.3s ease; border: 1px solid #eee; }
.recipe-card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
.recipe-image-wrapper { width: 100%; height: 180px; overflow: hidden; border-radius: 12px; background: #f3f3f3; }
.recipe-img { width: 100%; height: 100%; object-fit: cover; }
.recipe-content { flex-grow: 1; display: flex; flex-direction: column; padding-top: 10px; }
.recipe-title { font-size: 1.1rem; font-weight: bold; margin-bottom: 10px; color: #333; height: 2.4em; overflow: hidden; }
.view-btn { width: 100%; background: linear-gradient(to right, #FFD700, #FF8C00); border: none; padding: 10px; border-radius: 8px; cursor: pointer; color: white; font-weight: bold; }
.search-input { width: 250px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px; }
@media (max-width: 1024px) { .recipe-card { flex: 0 0 calc(33.33% - 20px); } }
@media (max-width: 768px) { .recipe-card { flex: 0 0 calc(50% - 20px); } }
@media (max-width: 480px) { .recipe-card { flex: 0 0 100%; } }
</style>