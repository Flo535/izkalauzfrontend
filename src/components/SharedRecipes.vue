<template>
  <div class="recipes-page fade-in">
    <h2 class="page-title">Receptek</h2>

    <div class="controls-left">
      <input v-model="searchTerm" placeholder="Keresés a receptek között" class="search-input" />
    </div>

    <div v-if="loading">⏳ Betöltés...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="recipes.length === 0 && !loading && !error" class="text-gray-500">
      Nincsenek megjeleníthető receptek.
    </div>

    <div class="recipe-list">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image-wrapper">
          <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" />
          <div v-else class="recipe-no-image">Nincs kép</div>
        </div>

        <h4 class="recipe-title">{{ recipe.title }}</h4>
        <p class="ingredients"><strong>Leírás:</strong> {{ recipe.description }}</p>

        <div class="card-buttons">
          <button class="view-btn" @click="viewRecipe(recipe.id)">Megnézem</button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalCount > pageSize">
      <button @click="prevPage" :disabled="page === 1">⬅ Előző</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page === totalPages">Következő ➡</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import router from '@/router'
import { API_BASE_URL, IMAGE_BASE_URL } from '@/config.js'

export default {
  name: 'SharedRecipes',
  data() {
    return {
      recipes: [],
      searchTerm: '',
      error: null,
      loading: true,
      page: 1,
      pageSize: 12,
      totalCount: 0
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.recipes
      return this.recipes.filter(r =>
        r.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    },
    totalPages() {
      return Math.ceil(this.totalCount / this.pageSize)
    }
  },
  async mounted() {
    await this.fetchRecipes()
  },
  watch: {
    page() {
      this.fetchRecipes()
    }
  },
  methods: {
    async fetchRecipes() {
      this.loading = true
      try {
        this.error = null
        const res = await axios.get(
          `${API_BASE_URL}/Recipes?page=${this.page}&pageSize=${this.pageSize}`
        )

        this.recipes = res.data.items || []
        this.totalCount = res.data.totalCount || 0
      } catch (err) {
        console.error(err)
        this.error = err.response?.data?.message || err.message || 'Hiba a receptek lekérésekor.'
        this.recipes = []
        this.totalCount = 0
      } finally {
        this.loading = false
      }
    },
    fullImagePath(path) {
      if (!path) return null
      return `${IMAGE_BASE_URL}/${path.split(/[/\\]/).pop()}`
    },
    viewRecipe(id) {
      router.push({ path: `/recipe/${id}` })
    },
    nextPage() { if (this.page < this.totalPages) this.page++ },
    prevPage() { if (this.page > 1) this.page-- }
  }
}
</script>

<style scoped>
/* A profil oldal stílusának ugyanazai használható, vagy akár külön CSS-t is adhatsz */
.recipes-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.page-title { font-size: 1.75rem; font-weight: bold; margin-bottom: 20px; background: linear-gradient(to right, #FF8C00, #FFD700); -webkit-background-clip: text; background-clip: text; color: transparent; }
.controls-left { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 20px; }
.search-input { width: 200px; padding: 8px; border-radius: 5px; border: 1px solid #ccc; }
.recipe-list { display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; }
.recipe-card { flex: 0 0 20%; display: flex; flex-direction: column; justify-content: space-between; padding: 20px; border-radius: 16px; background: linear-gradient(180deg, rgba(255,165,0,0.5), rgba(255,165,0,0.05)); box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease, opacity 0.4s ease; }
.recipe-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 12px 20px rgba(0,0,0,0.2); filter: brightness(1.05); }
.recipe-image-wrapper { width: 100%; height: 120px; overflow: hidden; border-radius: 10px; margin-bottom: 10px; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.recipe-no-image { width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; background: #eee; color: #888; font-weight: bold; border-radius: 10px; margin-bottom: 10px; }
.recipe-title { font-weight: bold; margin-bottom: 8px; }
.ingredients { font-size: 0.9rem; margin-top: 5px; }
.card-buttons { display: flex; justify-content: flex-end; margin-top: 10px; }
.view-btn { background: linear-gradient(to right, #FFD700, #FF8C00); border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; color: white; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
.pagination button { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; background: linear-gradient(to right, #FF8C00, #FFD700); color: white; font-weight: 500; }
.pagination button:disabled { background: #ccc; cursor: not-allowed; }
.text-gray-500 { color: #888; font-style: italic; }
.fade-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 1024px) { .recipe-card { flex: 0 0 31%; } }
@media (max-width: 768px) { .recipe-card { flex: 0 0 48%; } .recipes-page { padding: 15px; } .search-input { width: 100%; max-width: 200px; } .recipe-image-wrapper { height: 200px; } }
@media (max-width: 480px) { .recipe-card { flex: 0 0 100%; } .recipe-image-wrapper { height: 180px; } }
</style>
