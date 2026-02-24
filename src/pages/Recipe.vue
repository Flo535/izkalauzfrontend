<template>
  <div class="recipe-page fade-in">
    <h2 class="page-title">Receptek</h2>

    <div class="controls-left">
      <input v-model="searchTerm" placeholder="Keresés a receptek között" class="search-input" />
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="filteredRecipes.length === 0 && !error" class="no-recipes">
      Nincs megjeleníthető recept.
    </div>

    <div class="recipe-list">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image-wrapper">
          <img 
            v-if="recipe.imagePath" 
            :src="fullImagePath(recipe)" 
            alt="Recept képe"
            @error="onImgError(recipe.id, $event)"
            class="recipe-img"
          />
          <div v-else class="recipe-no-image">Nincs kép</div>
        </div>

        <div class="recipe-content">
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
        </div>

        <div class="card-buttons">
          <button class="view-btn" @click="viewRecipe(recipe.id)">Megnézem</button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalCount > pageSize">
      <button @click="prevPage" :disabled="page === 1">⬅ Előző</button>
      <span>{{ page }} / {{ Math.ceil(totalCount / pageSize) }}</span>
      <button @click="nextPage" :disabled="page * pageSize >= totalCount">Következő ➡</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
  name: 'Recipes',
  data() {
    return {
      recipes: [],
      searchTerm: '',
      error: null,
      page: 1,
      pageSize: 8,
      totalCount: 0,
      currentUserEmail: '',
      currentUserRole: '',
      // Itt tároljuk a hibás képek ID-it, hogy ne próbálkozzon újra
      failedImages: new Set()
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.recipes;
      return this.recipes.filter(r => 
        r.title && r.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  },
  async mounted() {
    this.setUserFromToken();
    await this.fetchRecipes();
  },
  watch: {
    page() {
      this.fetchRecipes();
    }
  },
  methods: {
    setUserFromToken() {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          this.currentUserEmail = decoded.email || decoded.sub;
          this.currentUserRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        } catch (e) { 
          console.error("Token hiba", e); 
        }
      }
    },
    async fetchRecipes() {
      try {
        const res = await axios.get(`https://localhost:5150/api/Recipes?page=${this.page}&pageSize=${this.pageSize}`);
        this.recipes = res.data.items || [];
        this.totalCount = res.data.totalCount || 0;
      } catch (err) { 
        this.error = "Hiba a receptek lekérésekor."; 
        console.error(err);
      }
    },
    fullImagePath(recipe) {
      const baseUrl = "https://localhost:5150/";
      const defaultImg = baseUrl + "images/recipes/default.jpg";

      // Ha már elbukott a kép, vagy nincs elérési út, azonnal defaultot adunk
      if (this.failedImages.has(recipe.id) || !recipe.imagePath) {
        return defaultImg;
      }
      
      let cleanPath = recipe.imagePath.replace(/\\/g, '/');
      if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
      
      if (!cleanPath.includes('images/')) {
        cleanPath = 'images/recipes/' + cleanPath;
      }

      return baseUrl + cleanPath;
    },
    onImgError(recipeId, event) {
      const defaultImg = "https://localhost:5150/images/recipes/default.jpg";
      const imgTag = event.target;

      // Megállítjuk az eseménykezelőt, hogy ne fusson le többször
      imgTag.onerror = null;

      // Hozzáadjuk a tiltólistához
      this.failedImages.add(recipeId);

      if (imgTag.src !== defaultImg) {
        console.warn(`Kép hiba (ID: ${recipeId}), váltás alapértelmezettre.`);
        imgTag.src = defaultImg;
      } else {
        // Ha a default is hiányzik, elrejtjük
        imgTag.style.display = 'none';
      }
    },
    formatIngredients(ingredients) {
      if (!ingredients || ingredients.length === 0) return 'Nincs megadva';
      return ingredients.map(i => i.name).join(', ');
    },
    viewRecipe(id) {
      this.$router.push(`/recept/${id}`);
    },
    nextPage() {
      if (this.page * this.pageSize < this.totalCount) this.page++;
    },
    prevPage() {
      if (this.page > 1) this.page--;
    }
  }
}
</script>

<style scoped>
.recipe-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.page-title { font-size: 1.75rem; font-weight: bold; margin-bottom: 20px; background: linear-gradient(to right, #FF8C00, #FFD700); -webkit-background-clip: text; background-clip: text; color: transparent; }

.recipe-list { display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start; }

.recipe-card { 
  flex: 0 0 calc(25% - 20px); 
  min-width: 250px; 
  height: 420px; 
  display: flex; 
  flex-direction: column; 
  padding: 15px; 
  border-radius: 16px; 
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
  transition: all 0.3s ease;
  border: 1px solid #eee;
  overflow: hidden; /* Szigorú keret */
}

.recipe-card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }

.recipe-image-wrapper { 
  width: 100%; 
  height: 180px; 
  min-height: 180px; /* Fix magasság a remegés ellen */
  max-height: 180px;
  overflow: hidden; 
  border-radius: 12px; 
  background: #f3f3f3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recipe-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display: block;
}

.recipe-no-image { 
  width: 100%; 
  height: 100%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: #eee; 
  color: #888; 
}

.recipe-content { flex-grow: 1; display: flex; flex-direction: column; padding-top: 10px; }
.recipe-title { font-size: 1.1rem; font-weight: bold; margin: 0 0 10px 0; color: #333; height: 2.4em; overflow: hidden; }
.ingredients-scroll { max-height: 50px; overflow-y: auto; font-size: 0.85rem; color: #666; margin-bottom: 10px; }
.author-info { font-size: 0.8rem; color: #888; margin-top: auto; padding-bottom: 10px; }

.view-btn { 
  width: 100%;
  background: linear-gradient(to right, #FFD700, #FF8C00); 
  border: none; 
  padding: 10px; 
  border-radius: 8px; 
  cursor: pointer; 
  color: white; 
  font-weight: bold; 
}

.pagination { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 40px; padding-bottom: 40px; }
.pagination button { padding: 8px 16px; border-radius: 8px; border: none; background: #FF8C00; color: white; cursor: pointer; }
.pagination button:disabled { background: #ccc; }

.fade-in { animation: fadeIn 0.6s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.search-input { width: 250px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px; }

@media (max-width: 1024px) { .recipe-card { flex: 0 0 calc(33.33% - 20px); } }
@media (max-width: 768px) { .recipe-card { flex: 0 0 calc(50% - 20px); } }
@media (max-width: 480px) { .recipe-card { flex: 0 0 100%; } }
</style>