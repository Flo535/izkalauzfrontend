<template>
  <div class="admin-recipes-page">
    <h1 class="page-title">Receptek jóváhagyása</h1>

    <div v-if="loading" class="loading">⏳ Betöltés...</div>
    <div v-if="error" class="error">❌ {{ error }}</div>

    <div v-if="recipes.length === 0 && !loading" class="no-recipes">
      Nincs jóváhagyásra váró recept.
    </div>

    <div class="recipe-list">
      <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
        <div class="image-wrapper">
          <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" :alt="recipe.title" />
          <div v-else class="no-image">Nincs kép</div>
        </div>

        <h2 class="recipe-title">{{ recipe.title }}</h2>
        <p><strong>Szerző:</strong> {{ recipe.authorEmail }}</p>
        <p><strong>Státusz:</strong> {{ recipe.status }}</p>

        <div class="card-buttons">
          <button @click="approveRecipe(recipe.id)" class="approve-btn">✅ Jóváhagyás</button>
          <button @click="rejectRecipe(recipe.id)" class="reject-btn">❌ Elutasítás</button>
        </div>
      </div>
    </div>

    <!-- Debug token és válasz -->
    <div class="debug" style="margin-top:20px; font-size:0.9rem; color:gray;">
      <p><strong>Token:</strong> {{ token }}</p>
      <p><strong>Backend válasz (debug):</strong> {{ debugResponse }}</p>
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
    await this.fetchPendingRecipes()
  },
  methods: {
    async fetchPendingRecipes() {
      try {
        this.loading = true
        this.token = localStorage.getItem('token')
        if (!this.token) {
          this.error = 'Nincs token a localStorage-ban! Jelentkezz be adminként.'
          return
        }

        const res = await axios.get('https://localhost:5150/api/Recipes/pending', {
          headers: { Authorization: `Bearer ${this.token}` }
        })

        this.debugResponse = JSON.stringify(res.data, null, 2)
        this.recipes = res.data
      } catch (err) {
        console.error('Hiba az axios hívás során:', err)
        this.debugResponse = err.response ? JSON.stringify(err.response.data, null, 2) : err.message
        this.error = err.response?.data?.message || 'Hiba a receptek lekérésekor. Ellenőrizd a tokent és jogosultságot.'
      } finally {
        this.loading = false
      }
    },

    fullImagePath(path) {
      if (!path) return null
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`
    },

    async approveRecipe(id) {
      try {
        await axios.post(`https://localhost:5150/api/Recipes/${id}/approve`, null, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.recipes = this.recipes.filter(r => r.id !== id)
        alert('Recept jóváhagyva!')
      } catch (err) {
        alert('Hiba a jóváhagyás során: ' + (err.response?.data?.message || err.message))
      }
    },

    async rejectRecipe(id) {
      try {
        await axios.post(`https://localhost:5150/api/Recipes/${id}/reject`, null, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.recipes = this.recipes.filter(r => r.id !== id)
        alert('Recept elutasítva.')
      } catch (err) {
        alert('Hiba az elutasítás során: ' + (err.response?.data?.message || err.message))
      }
    }
  }
}
</script>

<style scoped>
.admin-recipes-page {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}
.page-title {
  font-size: 2rem;
  margin-bottom: 20px;
  background: linear-gradient(to right, #ff8c00, #ffd700);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.loading, .error, .no-recipes {
  text-align: center;
  font-size: 1.2rem;
  padding: 20px 0;
}
.recipe-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.recipe-card {
  flex: 0 0 30%;
  background: #fff7e6;
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.image-wrapper {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 10px;
}
.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-image {
  width: 100%;
  height: 150px;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #888;
  font-weight: bold;
}
.recipe-title {
  font-weight: bold;
  margin-bottom: 5px;
}
.card-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.approve-btn, .reject-btn {
  flex: 1;
  margin: 2px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: white;
}
.approve-btn {
  background: linear-gradient(to right, #ffd700, #ff8c00);
}
.reject-btn {
  background: #d9534f;
}
.debug {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
