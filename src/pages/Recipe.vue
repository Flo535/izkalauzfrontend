<template>
  <div class="recipe-page glass-box">
    <div class="header-row">
      <h1><span class="recipe-icon">🍽️</span>Receptek</h1>
      <input v-model="searchTerm" placeholder="Keresés a receptek között" class="search-input" />
    </div>

    <RecipeList :recipes="filteredRecipes" :is-logged-in="isLoggedIn" />
  </div>
</template>

<script>
import RecipeList from '@/components/Recipe/RecipeList.vue'
import api from '@/axios'

export default {
  components: { RecipeList },
  data() {
    return {
      recipes: [],
      searchTerm: ''
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.recipes
      return this.recipes.filter(r =>
        r.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    },
    isLoggedIn() {
      return !!localStorage.getItem('token')
    }
  },
  async mounted() {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.get('/Recipes', { headers })
      this.recipes = data
    } catch (err) {
      console.error('Hiba a receptek betöltésekor:', err)
      // Tesztadat fallback
      this.recipes = [
        { id: 1, title: "Palacsinta", description: "Egyszerű, klasszikus palacsinta.", ingredients: ["Liszt","Tojás","Tej","Cukor"], authorEmail: "minta@izkalauz.hu" },
        { id: 2, title: "Rántotta", description: "Gyors, finom reggeli.", ingredients: ["Tojás","Só","Olaj"], authorEmail: "chef@izkalauz.hu" }
      ]
    }
  }
}
</script>

<style scoped>
.recipe-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 40px 20px;
}

/* Header row */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Főcím */
.header-row h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(90deg, #ff8c00, #ffb347); /* narancs → világos narancs */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: flex;
  align-items: center;
  margin: 0;
}


/* Ikon a főcím előtt */
.header-row h1 .recipe-icon {
  margin-right: 8px;
  color: white; /* ikon fehér */
  -webkit-text-fill-color: initial;
  font-size: 2rem;
}

/* Keresőmező */
.search-input {
  padding: 8px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 250px;
}

/* Glass-box háttér */
.glass-box {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
</style>
