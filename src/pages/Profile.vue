<template>
  <div class="profile-page fade-in">
    <h2 class="my-recipes-title">Saját receptjeim:</h2>

    <div class="controls-left">
      <button class="add-button" @click="$router.push({ name: 'NewRecipe' })">
        Új recept hozzáadása
      </button>
      <input v-model="searchTerm" placeholder="Keresés a receptek között" class="search-input" />
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="myRecipes.length === 0 && !error" class="no-recipes">
      Nincs megjeleníthető recept. (Ellenőrizd, hogy az admin@izkalauz.hu címmel vagy-e bent!)
    </div>

    <div class="recipe-list">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image-wrapper">
          <img 
            v-if="recipe.imagePath" 
            :src="fullImagePath(recipe.imagePath)" 
            @error="onImageError"
            :alt="recipe.title" 
          />
          <div v-else class="recipe-no-image">Nincs kép</div>
        </div>

        <h4 class="recipe-title">{{ recipe.title }}</h4>
        <p class="recipe-description">{{ recipe.description }}</p>

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
          <button class="edit-btn" @click="editRecipe(recipe)">
            Szerkesztés
          </button>
          <button class="delete-btn" @click="deleteRecipe(recipe.id)">Törlés</button>
        </div>
      </div>
    </div>

    <div v-if="totalCount > pageSize" class="pagination">
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
      userEmail: '',
      myRecipes: [],
      searchTerm: '',
      error: null,
      page: 1,
      pageSize: 10,
      totalCount: 0
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.myRecipes
      return this.myRecipes.filter(r =>
        r.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    }
  },
  async mounted() {
    this.extractUserEmail()
    await this.fetchRecipes()
  },
  watch: {
    page() {
      this.fetchRecipes()
    }
  },
  methods: {
    extractUserEmail() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          this.userEmail = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || ''
        } catch (err) {
          console.warn('JWT decode error:', err)
        }
      }
    },
    // JAVÍTOTT: Ez a metódus biztosítja, hogy a sima user képe is betöltsön
    fullImagePath(path) {
      if (!path) return null
      if (path.startsWith('http')) return path
      
      // Levágjuk a mappákat (pl. uploads/recipes/), csak a fájlnevet tartjuk meg
      const fileName = path.replace(/\\/g, '/').split('/').pop()
      
      return `https://localhost:5150/Images/${fileName}`
    },
    onImageError(event) {
      // Megpróbáljuk egy alapértelmezett képre cserélni, ha nem találja az eredetit
      event.target.src = "https://localhost:5150/Images/default.jpg"
      
      // Ha az alapértelmezett kép sincs meg, akkor tüntetjük el a keretet
      event.target.onerror = () => {
        event.target.style.display = 'none'
        const wrapper = event.target.parentElement
        if (!wrapper.querySelector('.recipe-no-image')) {
          const noImageDiv = document.createElement('div')
          noImageDiv.className = 'recipe-no-image'
          noImageDiv.innerText = 'Nincs kép'
          wrapper.appendChild(noImageDiv)
        }
      }
    },
    formatIngredients(ingredients) {
      if (!ingredients || ingredients.length === 0) return 'Nincs megadva'
      return ingredients
        .map(ing => {
          if (typeof ing === 'string') return ing
          return `${ing.name} (${ing.quantity} ${ing.unit || ''})`
        })
        .join(', ')
    },
    async fetchRecipes() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }

        const res = await axios.get(
          `https://localhost:5150/api/Recipes/my?page=${this.page}&pageSize=${this.pageSize}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (res.data.items) {
          this.myRecipes = res.data.items
          this.totalCount = res.data.totalCount
        } else {
          this.myRecipes = res.data
          this.totalCount = res.data.length
        }
      } catch (err) {
        console.error("Hiba:", err)
        if (err.response?.status === 401) {
          this.$router.push('/login')
        } else {
          this.error = 'Nem sikerült betölteni a receptjeidet.'
        }
      }
    },
    editRecipe(recipe) {
      this.$router.push({ name: 'EditRecipe', params: { id: recipe.id } })
    },
    async deleteRecipe(id) {
      if (!confirm('Biztos törlöd a receptet?')) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`https://localhost:5150/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.fetchRecipes()
      } catch (err) {
        alert('Hiba a törléskor!')
      }
    }
  }
}
</script>

<style scoped>
.profile-page { max-width: 1200px; margin: 80px auto; padding: 0 20px; }
.my-recipes-title { font-size: 1.75rem; font-weight: bold; background: linear-gradient(to right, #FF8C00, #FFD700); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 16px; }
.controls-left { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 20px; }
.search-input { width: 200px; padding: 8px; border-radius: 5px; border: 1px solid #ccc; }
.add-button { padding: 8px 12px; border-radius: 5px; border: none; cursor: pointer; font-weight: 500; color: #fff; background: linear-gradient(to right, #FF4500, #FFA500); transition: transform 0.2s ease; }
.error-message { color: red; margin: 10px 0; }
.no-recipes { text-align: center; color: #666; margin-top: 40px; font-style: italic; }
.recipe-list { display: flex; flex-wrap: wrap; gap: 20px; }
.recipe-card { flex: 0 0 calc(25% - 20px); min-width: 250px; height: 420px; display: flex; flex-direction: column; padding: 20px; border-radius: 16px; background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05)); box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.recipe-image-wrapper { width: 100%; height: 150px; overflow: hidden; border-radius: 10px; margin-bottom: 10px; background: #ddd; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.recipe-title { font-weight: bold; margin: 10px 0; height: 40px; overflow: hidden; }
.recipe-description { font-size: 0.9rem; height: 50px; overflow-y: auto; margin-bottom: 10px; }
.ingredients-scroll { flex: 1; overflow-y: auto; font-size: 0.85rem; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 5px; }
.card-buttons { display: flex; gap: 10px; margin-top: 15px; }
.edit-btn, .delete-btn { flex: 1; padding: 8px; border-radius: 5px; border: none; color: white; cursor: pointer; font-weight: bold; }
.edit-btn { background: #ffc107; }
.delete-btn { background: #ff4757; }
.pagination { margin-top: 30px; display: flex; justify-content: center; align-items: center; gap: 15px; }
</style>