<template>
  <div class="profile-page fade-in">
    <h2 class="my-recipes-title">Saját receptjeim:</h2>

    <div class="controls-left">
      <button class="add-button" @click="$router.push('/uj-recept')">
        ➕ Új recept hozzáadása
      </button>
      <input v-model="searchTerm" placeholder="Keresés..." class="search-input" />
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="myRecipes.length === 0 && !error" class="no-recipes">
      Nincs megjeleníthető recept.
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

    <div v-if="totalCount > pageSize" class="pagination">
      <button @click="page--" :disabled="page === 1">⬅</button>
      <span>{{ page }} / {{ Math.ceil(totalCount / pageSize) }}</span>
      <button @click="page++" :disabled="page * pageSize >= totalCount">➡</button>
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
    fullImagePath(path) {
      if (!path) return null
      if (path.startsWith('http')) return path
      const fileName = path.replace(/\\/g, '/').split('/').pop()
      return `https://localhost:5150/Images/${fileName}`
    },
    onImageError(event) {
      event.target.src = "https://localhost:5150/Images/default.jpg"
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
        const res = await axios.get(
          `https://localhost:5150/api/Recipes/my?page=${this.page}&pageSize=${this.pageSize}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.myRecipes = res.data.items || res.data
        this.totalCount = res.data.totalCount || res.data.length
      } catch (err) {
        this.error = 'Nem sikerült betölteni a receptjeidet.'
      }
    },
    async deleteRecipe(id) {
      if (!confirm('Biztosan törölni szeretnéd ezt a receptet?')) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`https://localhost:5150/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.fetchRecipes()
      } catch (err) {
        alert('Hiba történt a törlés során!')
      }
    }
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
  transition: transform 0.2s;
}
.add-button:hover { transform: scale(1.02); }

.search-input { 
  padding: 8px 12px; border-radius: 10px; border: 1px solid #ddd; 
  background: rgba(255,255,255,0.9); width: 220px; font-size: 0.9rem;
}

.error-message { color: #e74c3c; padding: 10px; background: #fdeaea; border-radius: 8px; margin-bottom: 15px; }

/* RÁCSRENDSZER MINT A RECEPTEK OLDALON */
.recipe-list { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 20px; 
}

/* KISEBB KÁRTYA STÍLUS */
.recipe-card { 
  height: 400px; 
  display: flex; flex-direction: column; 
  padding: 15px; border-radius: 20px; 
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.35), rgba(255, 165, 0, 0.05)); 
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.4);
  transition: transform 0.2s;
}
.recipe-card:hover { transform: translateY(-3px); }

.recipe-image-wrapper { width: 100%; height: 130px; overflow: hidden; border-radius: 12px; margin-bottom: 8px; background: #eee; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }

.recipe-title { font-weight: bold; color: #333; margin: 5px 0; height: 38px; overflow: hidden; font-size: 1rem; line-height: 1.2; }

.ingredients-scroll { 
  flex: 1; overflow-y: auto; font-size: 0.75rem; 
  background: rgba(255,255,255,0.25); padding: 8px; border-radius: 10px;
  margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.3);
}

.author-info { font-size: 0.7rem; color: #777; margin-bottom: 10px; }

/* GOMBOK SZÖVEGGEL */
.card-buttons { display: flex; gap: 6px; margin-top: auto; }

.edit-btn, .delete-btn { 
  flex: 1; padding: 8px 2px; border-radius: 8px; border: none; color: white; 
  cursor: pointer; font-size: 0.75rem; font-weight: bold; 
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s;
}

.edit-btn { background: #FFB300; }
.delete-btn { background: #FF5252; }

.edit-btn:hover, .delete-btn:hover { opacity: 0.85; }

.pagination { margin-top: 30px; display: flex; justify-content: center; align-items: center; gap: 15px; }

.fade-in { animation: fadeIn 0.5s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.no-recipes { text-align: center; color: #888; margin-top: 50px; font-style: italic; }
</style>