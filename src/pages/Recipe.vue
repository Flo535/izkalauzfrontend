<template>
  <div class="recipe-page fade-in">
    <h2 class="page-title">Receptek</h2>

    <div class="controls-left">
      <input v-model="searchTerm" placeholder="Keresés a receptek között" class="search-input" />
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="filteredRecipes.length === 0 && !error" class="text-center text-gray-500">
      Nincs megjeleníthető recept.
    </div>

    <div class="recipe-list">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image-wrapper">
          <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" />
          <div v-else class="recipe-no-image">Nincs kép</div>
        </div>

        <h4 class="recipe-title">{{ recipe.title }}</h4>

        <div class="ingredients-scroll">
          <p class="ingredients"><strong>Hozzávalók:</strong> {{ formatIngredients(recipe.ingredients) }}</p>
        </div>

        <div class="author-info">
          <span class="author-icon">👤</span>
          <span class="author-email">{{ recipe.authorEmail }}</span>
        </div>

        <div class="card-buttons">
          <button class="view-btn" @click="viewRecipe(recipe.id)">Megnézem</button>
        </div>
      </div>
    </div>

    <!-- LAPOZÓ -->
    <div class="pagination">
      <button @click="page--" :disabled="page === 1">⬅ Előző</button>
      <span>{{ page }} / {{ Math.ceil(totalCount / pageSize) }}</span>
      <button @click="page++" :disabled="page * pageSize >= totalCount">Következő ➡</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Recipes',
  data() {
    return {
      recipes: [],
      searchTerm: '',
      error: null,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      fetchDone: false
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.recipes
      return this.recipes.filter(r =>
        r.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    }
  },
  async mounted() {
    if (!this.fetchDone) {
      await this.fetchRecipes()
      this.fetchDone = true
    }
  },
  watch: {
    page() {
      this.fetchRecipes()
    }
  },
  methods: {
    async fetchRecipes() {
      try {
        const res = await axios.get(
          `https://localhost:5150/api/Recipes?page=${this.page}&pageSize=${this.pageSize}`
        )
        this.recipes = res.data.items
        this.totalCount = res.data.totalCount
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a receptek lekérésekor.'
      }
    },
    fullImagePath(path) {
      if (!path) return null
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`
    },
    formatIngredients(ingredients) {
      if (!ingredients || ingredients.length === 0) return 'Nincs megadva'
      if (typeof ingredients[0] === 'string') return ingredients.join(', ')
      return ingredients.map(i => i.name || 'Ismeretlen').join(', ')
    },
    viewRecipe(id) {
      this.$router.push({ path: `/recept/${id}` })
    }
  }
}
</script>

<style scoped>
.recipe-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.page-title { font-size: 1.75rem; font-weight: bold; margin-bottom: 20px; background: linear-gradient(to right, #FF8C00, #FFD700); -webkit-background-clip: text; background-clip: text; color: transparent; }

.controls-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
}
.search-input {
  width: 200px;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.recipe-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}

/* Nagy képernyő: 5 kártya / sor */
.recipe-card {
  flex: 0 0 20%; 
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05));
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease, opacity 0.4s ease;
}

.recipe-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 20px rgba(0,0,0,0.2);
  filter: brightness(1.05);
}

.recipe-image-wrapper { width: 100%; height: 120px; overflow: hidden; border-radius: 10px; margin-bottom: 10px; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.recipe-no-image { width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; background: #eee; color: #888; font-weight: bold; border-radius: 10px; margin-bottom: 10px; }

.recipe-title { font-weight: bold; margin-bottom: 8px; }
.ingredients-scroll { max-height: 50px; overflow-y: auto; }
.ingredients { font-size: 0.9rem; margin-top: 5px; }
.author-info { display: flex; align-items: center; font-size: 0.875rem; color: #555; margin-top: 10px; }
.card-buttons { display: flex; justify-content: flex-end; margin-top: 10px; }
.view-btn { background: linear-gradient(to right, #FFD700, #FF8C00); border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; color: white; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
.pagination button { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; background: linear-gradient(to right, #FF8C00, #FFD700); color: white; font-weight: 500; }
.pagination button:disabled { background: #ccc; cursor: not-allowed; }

.fade-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* Közepes képernyő: 3 kártya / sor */
@media (max-width: 1024px) {
  .recipe-card { flex: 0 0 31%; }
}

/* Tablet: 2 kártya / sor */
@media (max-width: 768px) {
  .recipe-card { flex: 0 0 48%; }
  .recipe-page { padding: 15px; }
  .search-input { width: 100%; max-width: 200px; }
  .recipe-image-wrapper { height: 200px; }
}

/* Mobil: 1 kártya / sor */
@media (max-width: 480px) {
  .recipe-card { flex: 0 0 100%; }
  .recipe-image-wrapper { height: 180px; }
}
</style>
