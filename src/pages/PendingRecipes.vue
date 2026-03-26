<template>
  <div class="recipe-page fade-in">
    <h2 class="page-title">Függőben lévő receptek</h2>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="recipes.length === 0 && !error" class="text-center text-gray-500">
      Nincs jóváhagyásra váró recept.
    </div>

    <div class="recipe-list">
      <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
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
          <button class="approve-btn" @click="approveRecipe(recipe.id)">✅ Jóváhagy</button>
          <button class="reject-btn" @click="rejectRecipe(recipe.id)">❌ Elutasít</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PendingRecipes',
  data() {
    return {
      recipes: [],
      error: null
    }
  },
  async mounted() {
    await this.fetchPendingRecipes()
  },
  methods: {
    async fetchPendingRecipes() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('https://localhost:5150/api/Recipes/pending', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.recipes = res.data
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
    async approveRecipe(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`https://localhost:5150/api/Recipes/${id}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.recipes = this.recipes.filter(r => r.id !== id)
        alert('Recept jóváhagyva!')
      } catch (err) {
        alert('Hiba a jóváhagyás során.')
      }
    },
    async rejectRecipe(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`https://localhost:5150/api/Recipes/${id}/reject`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.recipes = this.recipes.filter(r => r.id !== id)
        alert('Recept elutasítva!')
      } catch (err) {
        alert('Hiba az elutasítás során.')
      }
    }
  }
}
</script>

<style scoped>
.recipe-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.page-title {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 20px;

  /* Gradient szöveg – minden böngészőhöz */
  background: linear-gradient(to right, #ff8c00, #ffd700);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.recipe-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}

.recipe-card {
  flex: 0 0 31%;
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05));
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 20px rgba(0,0,0,0.2);
}

.recipe-image-wrapper { width: 100%; height: 120px; overflow: hidden; border-radius: 10px; margin-bottom: 10px; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.recipe-no-image { width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; background: #eee; color: #888; font-weight: bold; border-radius: 10px; margin-bottom: 10px; }

.recipe-title { font-weight: bold; margin-bottom: 8px; }
.ingredients-scroll { max-height: 50px; overflow-y: auto; }
.ingredients { font-size: 0.9rem; margin-top: 5px; }
.author-info { display: flex; align-items: center; font-size: 0.875rem; color: #555; margin-top: 10px; }
.card-buttons { display: flex; justify-content: space-between; margin-top: 10px; }
.approve-btn, .reject-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: 500;
}
.approve-btn { background: linear-gradient(to right, #ff8c00, #ffd700); }
.reject-btn { background: linear-gradient(to right, #d9534f, #ff6f61); }

@media (max-width: 768px) {
  .recipe-card { flex: 0 0 48%; }
  .recipe-page { padding: 15px; }
}

@media (max-width: 480px) {
  .recipe-card { flex: 0 0 100%; }
}
</style>
