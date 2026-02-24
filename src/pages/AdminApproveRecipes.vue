<template>
  <div class="admin-recipes-page fade-in">
    <h1 class="page-title">📋 Receptek jóváhagyása</h1>

    <div v-if="loading" class="loading">⏳ Betöltés...</div>
    <div v-if="error" class="error-message">❌ {{ error }}</div>

    <div v-if="recipes.length === 0 && !loading" class="no-recipes">
      <p>Nincs jóváhagyásra váró recept. Mindenki ügyesen főz! 🍳</p>
    </div>

    <div v-else class="recipe-list">
      <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
        <div class="image-wrapper">
          <img 
            v-if="recipe.imagePath" 
            :src="fullImagePath(recipe.imagePath)" 
            :alt="recipe.title" 
            @error="onImageError"
          />
          <div v-else class="no-image">📸 Nincs kép feltöltve</div>
        </div>

        <div class="card-content">
          <h2 class="recipe-title">{{ recipe.title }}</h2>
          <p class="author-info"><strong>Szerző:</strong> {{ recipe.authorEmail }}</p>
          <p class="category-tag"><strong>Kategória:</strong> {{ recipe.category }}</p>
          
          <div class="card-buttons">
            <button @click="approveRecipe(recipe.id)" class="approve-btn">✅ Jóváhagyás</button>
            <button @click="rejectRecipe(recipe.id)" class="reject-btn">🗑️ Elutasítás</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="recipes.length > 0" class="debug-section">
      <h3>Debug Információ (Csak Admin):</h3>
      <pre>{{ debugResponse }}</pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AdminApproveRecipes',
  data() {
    return {
      recipes: [],
      loading: true,
      error: null,
      token: null,
      debugResponse: null
    }
  },
  async mounted() {
    this.token = localStorage.getItem('token')
    await this.fetchPendingRecipes()
  },
  methods: {
    async fetchPendingRecipes() {
      try {
        this.loading = true
        if (!this.token) {
          this.error = 'Nincs érvényes munkamenet! Kérlek jelentkezz be újra.'
          return
        }

        const res = await axios.get('https://localhost:5150/api/Recipes/pending', {
          headers: { Authorization: `Bearer ${this.token}` }
        })

        this.recipes = res.data
        this.debugResponse = JSON.stringify(res.data, null, 2)
      } catch (err) {
        console.error('Hiba a lekéréskor:', err)
        this.error = 'Nem sikerült betölteni a várólistát.'
        this.debugResponse = err.response?.data || err.message
      } finally {
        this.loading = false
      }
    },

    fullImagePath(path) {
      if (!path) return null
      // Backend URL + a mentett relatív elérési út
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`
    },

    onImageError(e) {
      e.target.src = 'https://localhost:5150/images/recipes/default.jpg' // Tartalék kép ha a fájl nem található
    },

    async approveRecipe(id) {
      try {
        // Backend POST: /api/Recipes/{id}/approve
        await axios.post(`https://localhost:5150/api/Recipes/${id}/approve`, {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        
        this.recipes = this.recipes.filter(r => r.id !== id)
        alert('Siker! A recept mostantól mindenki számára látható.')
      } catch (err) {
        alert('Hiba a jóváhagyás során: ' + (err.response?.data?.message || err.message))
      }
    },

    async rejectRecipe(id) {
      if (!confirm('Biztosan elutasítod és végleg törlöd ezt a receptet?')) return

      try {
        // Backend DELETE: /api/Recipes/{id}
        await axios.delete(`https://localhost:5150/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        
        this.recipes = this.recipes.filter(r => r.id !== id)
        alert('A recept elutasítva és törölve.')
      } catch (err) {
        alert('Hiba az elutasítás során: ' + (err.response?.data?.message || err.message))
      }
    }
  }
}
</script>

<style scoped>
.admin-recipes-page {
  max-width: 1100px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #2c3e50;
  border-bottom: 3px solid #f39c12;
  display: inline-block;
  width: 100%;
}

.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.recipe-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.recipe-card:hover {
  transform: translateY(-5px);
}

.image-wrapper {
  width: 100%;
  height: 200px;
  background: #f4f4f4;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.recipe-title {
  font-size: 1.3rem;
  margin: 0 0 10px 0;
  color: #d35400;
}

.author-info, .category-tag {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 5px 0;
}

.card-buttons {
  margin-top: auto;
  display: flex;
  gap: 10px;
  padding-top: 15px;
}

.approve-btn {
  flex: 1;
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.approve-btn:hover {
  background: #2ecc71;
}

.reject-btn {
  flex: 1;
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.reject-btn:hover {
  background: #c0392b;
}

.debug-section {
  margin-top: 50px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  font-size: 0.8rem;
}

.error-message {
  background: #fdeaea;
  color: #c0392b;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>