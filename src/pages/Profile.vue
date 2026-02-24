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
            :src="getImageUrl(recipe)" 
            @error="onImageError(recipe.id, $event)"
            :alt="recipe.title" 
            class="recipe-img"
          />
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
      totalCount: 0,
      failedImages: new Set()
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.myRecipes
      return this.myRecipes.filter(r =>
        r.title && r.title.toLowerCase().includes(this.searchTerm.toLowerCase())
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
    // JAVÍTOTT: Most már a rövid 'unique_name' vagy 'sub' mezőt is nézi a tokenben
    extractUserEmail() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          // Megnézzük a rövid és a hosszú neveket is a biztonság kedvéért
          this.userEmail = payload.unique_name || payload.email || payload.sub || '';
        } catch (err) {
          console.warn('JWT decode error:', err)
        }
      }
    },

    // JAVÍTOTT: Egységesített képkezelés a remegés ellen
    getImageUrl(recipe) {
      const baseUrl = "https://localhost:5150/";
      const defaultImg = baseUrl + "Images/default.jpg";

      if (this.failedImages.has(recipe.id) || !recipe.imagePath) {
        return defaultImg;
      }

      if (recipe.imagePath.startsWith('http')) return recipe.imagePath;

      // Tisztítjuk az útvonalat: csak a fájlnevet tartjuk meg, és a /images/recipes mappába mutatunk
      const fileName = recipe.imagePath.split(/[\\/]/).pop();
      return `${baseUrl}images/recipes/${fileName}`;
    },

    onImageError(recipeId, event) {
      const defaultImg = "https://localhost:5150/Images/default.jpg";
      event.target.onerror = null;
      this.failedImages.add(recipeId);
      event.target.src = defaultImg;
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
        // Fontos: Ha kijelentkeztél, ne is próbálkozzon
        if (!token) {
           this.$router.push('/login');
           return;
        }
        const res = await axios.get(
          `https://localhost:5150/api/Recipes/my?page=${this.page}&pageSize=${this.pageSize}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        // Kezeljük mindkét lehetséges API válaszformátumot
        this.myRecipes = res.data.items || (Array.isArray(res.data) ? res.data : []);
        this.totalCount = res.data.totalCount || this.myRecipes.length;
      } catch (err) {
        this.error = 'Nem sikerült betölteni a receptjeidet.'
        if (err.response?.status === 401) this.$router.push('/login');
      }
    },

    async deleteRecipe(id) {
      if (!confirm('Biztosan törölni szeretnéd ezt a receptet?')) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`https://localhost:5150/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await this.fetchRecipes()
      } catch (err) {
        alert('Hiba történt a törlés során! Csak a saját receptedet törölheted.')
      }
    }
  }
}
</script>

<style scoped>
/* A stílusaidat érintetlenül hagytam, mert azok szuperek! */
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
}
.search-input { padding: 8px 12px; border-radius: 10px; border: 1px solid #ddd; width: 220px; }
.recipe-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
.recipe-card { 
  height: 400px; display: flex; flex-direction: column; padding: 15px; border-radius: 20px; 
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.35), rgba(255, 165, 0, 0.05)); 
  backdrop-filter: blur(8px); box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}
.recipe-image-wrapper { width: 100%; height: 130px; min-height: 130px; overflow: hidden; border-radius: 12px; margin-bottom: 8px; background: #eee; }
.recipe-img { width: 100%; height: 100%; object-fit: cover; }
.ingredients-scroll { flex: 1; overflow-y: auto; font-size: 0.75rem; background: rgba(255,255,255,0.25); padding: 8px; border-radius: 10px; margin-bottom: 10px; }
.card-buttons { display: flex; gap: 6px; margin-top: auto; }
.edit-btn { background: #FFB300; flex: 1; color: white; border: none; padding: 8px; border-radius: 8px; cursor: pointer; }
.delete-btn { background: #FF5252; flex: 1; color: white; border: none; padding: 8px; border-radius: 8px; cursor: pointer; }
</style>