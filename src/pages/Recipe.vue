<template>
  <div class="recipes-page fade-in">
    <h1 class="page-title">Receptek</h1>

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
          <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" @error="onImageError" />
          <div v-else class="recipe-no-image">Nincs kép</div>
        </div>

        <div v-if="isAdmin" class="upload-button-wrapper">
          <input type="file" :id="'file-' + recipe.id" style="display:none" @change="uploadImage($event, recipe)" />
          <button @click="triggerFileInput(recipe)">Kép feltöltése</button>
        </div>

        <h4 class="recipe-title">
          <router-link :to="`/recept/${recipe.id}`" class="recipe-title-link">
            <span class="recipe-icon">🍽️</span> {{ recipe.title }}
          </router-link>
        </h4>

        <p class="recipe-description">{{ recipe.description }}</p>

        <div class="ingredients-scroll">
<<<<<<< HEAD
          <p class="ingredients"><strong>Hozzávalók:</strong> {{ recipe.ingredients.join(', ') }}</p>
=======
          <p class="ingredients"><strong>Hozzávalók:</strong> {{ formatIngredients(recipe.ingredients) }}</p>
>>>>>>> fce3b7e (David-update)
        </div>

        <div class="author-info">
          <span class="author-icon">👤</span>
          <span class="author-email">{{ recipe.authorEmail }}</span>
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
  data() {
    return {
      recipes: [],
      searchTerm: '',
      error: null,
      fetchDone: false,
      page: 1,
      pageSize: 8,
      totalCount: 0,
      isAdmin: localStorage.getItem('role') === 'Admin'
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
    async fetchRecipes() {
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get(`https://localhost:5150/api/Recipes?page=${this.page}&pageSize=${this.pageSize}`, { headers })
        this.recipes = res.data.items
        this.totalCount = res.data.totalCount
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a receptek lekérésekor.'
      }
    },
    triggerFileInput(recipe) {
      const input = document.getElementById('file-' + recipe.id)
      if (input) input.click()
    },
<<<<<<< HEAD
=======

    formatIngredients(ingredients) {
      if (!ingredients || ingredients.length === 0) return 'Nincs megadva'
      
      // Ellenőrizzük, hogy objektumok-e vagy stringek
      if (typeof ingredients[0] === 'string') {
        return ingredients.join(', ')
      }
      
      // Ha objektumok, formázzuk őket
      return ingredients
        .map(ing => {
          if (ing.name && ing.quantity && ing.unit) {
            return `${ing.name} (${ing.quantity} ${ing.unit})`
          }
          return ing.name || 'Ismeretlen'
        })
        .join(', ')
    },


>>>>>>> fce3b7e (David-update)
    async uploadImage(event, recipe) {
      const file = event.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.post(`https://localhost:5150/api/Recipes/${recipe.id}/image`, formData, { headers })
        recipe.imagePath = res.data.imagePath
      } catch (err) {
        alert(err.response?.data || 'Hiba a kép feltöltésekor.')
      }
    }
  }
}
</script>

<style scoped>
.recipes-page { 
  max-width: 1200px;  
  margin: 60px auto; 
  padding: 0 20px; 
}
.page-title {
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 20px;
}
.controls-left { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-start; 
  gap: 8px; 
  margin-bottom: 20px; 
}
.search-input { 
  width: 220px; 
  padding: 8px; 
  border-radius: 5px; 
  border: 1px solid #ccc; 
}

.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  justify-content: center;
}

.recipe-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 280px;  
  max-height: 400px;  
  padding: 15px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255,165,0,0.5), rgba(255,165,0,0.05));
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
}
.recipe-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 20px rgba(0,0,0,0.2);
  filter: brightness(1.05);
}

.recipe-image-wrapper { 
  width: 100%; 
  height: 140px; 
  overflow: hidden; 
  border-radius: 10px; 
  margin-bottom: 10px; 
}
.recipe-image-wrapper img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display: block; 
}
.recipe-no-image { 
  width: 100%; 
  height: 140px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: #eee; 
  color: #888; 
  font-weight: bold; 
  border-radius: 10px; 
  margin-bottom: 10px; 
}

.upload-button-wrapper {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}

.upload-button-wrapper button {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  color: white;
  font-weight: 500;
}

.recipe-title { font-weight: bold; margin-bottom: 6px; font-size: 1.1rem; }
.recipe-title-link { color: inherit; text-decoration: none; display: flex; align-items: center; }
.recipe-icon { margin-right: 5px; }

.recipe-description { flex: 1; overflow-y: auto; margin: 8px 0; padding-right: 5px; }
.ingredients-scroll { max-height: 50px; overflow-y: auto; }
.ingredients { font-size: 0.9rem; margin-top: 5px; }

.author-info { display: flex; align-items: center; font-size: 0.85rem; color: #555; margin-top: 8px; }
.author-icon { margin-right: 5px; }

/* LAPOZÓ STÍLUS */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}
.pagination button {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  color: white;
  font-weight: 500;
}
.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Fade-in */
.fade-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* Mobilbarát finomítások */
@media (max-width: 600px) {
  .recipe-card { min-height: 240px; padding: 12px; }
  .recipe-title { font-size: 1rem; }
  .recipe-image-wrapper, .recipe-no-image { height: 120px; }
}
</style>
