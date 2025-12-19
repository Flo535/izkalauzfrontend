<template>
  <div class="recipe-page fade-in">
    <h2 class="recipes-title">Receptek</h2>

    <div class="controls-left">
      <input v-model="searchTerm" placeholder="Keresés a receptek között" class="search-input" />
    </div>

    <div v-if="recipes.length === 0" class="text-center text-gray-500">
      Nincs megjeleníthető recept.
    </div>

    <div class="recipe-list">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image-wrapper">
          <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" @error="onImageError" />
          <div v-else class="recipe-no-image">Nincs kép</div>
        </div>

        <h4 class="recipe-title">
          <router-link :to="`/recept/${recipe.id}`" class="recipe-title-link">
            {{ recipe.title }}
          </router-link>
        </h4>

        <p class="recipe-description">{{ recipe.description }}</p>

        <div class="ingredients-scroll">
          <p class="ingredients"><strong>Hozzávalók:</strong> {{ recipe.ingredients.join(', ') }}</p>
        </div>

        <div class="author-info">
          <span class="author-icon">👤</span>
          <span class="author-email">{{ recipe.authorEmail }}</span>
        </div>
      </div>
    </div>

    <!-- LAPOZÓ -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">⬅ Előző</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page >= totalPages">Következő ➡</button>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  props: {
    recipes: Array
  },
  data() {
    return {
      searchTerm: '',
      page: 1,
      pageSize: 6,
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
  methods: {
    fullImagePath(path) {
      if (!path) return null
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`
    },
    onImageError(event) {
      event.target.style.display = 'none'
      const wrapper = event.target.parentElement
      if (!wrapper.querySelector('.recipe-no-image')) {
        const noImageDiv = document.createElement('div')
        noImageDiv.className = 'recipe-no-image'
        noImageDiv.innerText = 'Nincs kép'
        wrapper.appendChild(noImageDiv)
      }
    },
    nextPage() { if(this.page < this.totalPages) this.page++; this.$emit('page-changed', this.page) },
    prevPage() { if(this.page > 1) this.page--; this.$emit('page-changed', this.page) }
  }
}
</script>

<style scoped>
.recipe-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.recipes-title {
  font-size: 1.75rem;
  font-weight: bold;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 16px;
}
.controls-left { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 20px; }
.search-input { width: 250px; padding: 8px; border-radius: 5px; border: 1px solid #ccc; }
.recipe-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
.recipe-card {
  display: flex; flex-direction: column; justify-content: flex-start;
  min-height: 280px; max-height: 450px; padding: 20px; border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05));
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.recipe-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 12px 20px rgba(0,0,0,0.2); }
.recipe-image-wrapper { width: 100%; height: 150px; overflow: hidden; border-radius: 10px; margin-bottom: 10px; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; }
.recipe-no-image { width: 100%; height: 150px; display: flex; align-items: center; justify-content: center; background: #eee; color: #888; font-weight: bold; border-radius: 10px; margin-bottom: 10px; }
.recipe-title { font-weight: bold; margin-bottom: 8px; }
.recipe-title-link { color: inherit; text-decoration: none; }
.recipe-description { flex: 1; margin: 10px 0; padding-right: 5px; }
.ingredients-scroll { max-height: 50px; overflow-y: auto; }
.ingredients { font-size: 0.9rem; margin-top: 5px; }
.author-info { display: flex; align-items: center; font-size: 0.875rem; color: #555; margin-top: 10px; }
.author-icon { margin-right: 5px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
.pagination button { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; background: linear-gradient(to right, #FF8C00, #FFD700); color: white; font-weight: 500; }
.pagination button:disabled { background: #ccc; cursor: not-allowed; }
@media (max-width: 600px) {
  .recipe-card { min-height: 220px; padding: 16px; }
  .recipe-title { font-size: 1.1rem; }
  .recipe-image-wrapper, .recipe-no-image { height: 120px; }
  .ingredients-scroll { max-height: 40px; }
}
</style>
