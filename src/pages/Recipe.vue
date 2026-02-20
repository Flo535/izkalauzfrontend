<template>
  <div class="recipe-page fade-in">
    <h2 class="page-title">Receptek</h2>

    <div class="controls-left">
      <input v-model="searchTerm" placeholder="Keresés a receptek között" class="search-input" />
    </div>

    <div v-if="error" class="error">{{ error }}</div>
<<<<<<< HEAD
    
=======
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
    <div v-if="filteredRecipes.length === 0 && !error" class="text-center text-gray-500">
      Nincs megjeleníthető recept.
    </div>

    <div class="recipe-list">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image-wrapper">
<<<<<<< HEAD
          <img 
            v-if="recipe.imagePath" 
            :src="fullImagePath(recipe.imagePath)" 
            alt="Recept képe"
            @error="onImgError"
          />
=======
          <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" />
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
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
          <button class="view-btn" @click="viewRecipe(recipe.id)">Megnézem</button>
        </div>
      </div>
    </div>

<<<<<<< HEAD
    <div class="pagination" v-if="totalCount > pageSize">
=======
    <!-- LAPOZÓ -->
    <div class="pagination">
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
      <button @click="page--" :disabled="page === 1">⬅ Előző</button>
      <span>{{ page }} / {{ Math.ceil(totalCount / pageSize) }}</span>
      <button @click="page++" :disabled="page * pageSize >= totalCount">Következő ➡</button>
    </div>
  </div>
</template>

<script>
<<<<<<< HEAD
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
=======
import axios from 'axios'
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40

export default {
  name: 'Recipes',
  data() {
    return {
      recipes: [],
      searchTerm: '',
      error: null,
      page: 1,
<<<<<<< HEAD
      pageSize: 8,
      totalCount: 0,
      currentUserEmail: '',
      currentUserRole: ''
=======
      pageSize: 10,
      totalCount: 0,
      fetchDone: false
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
    }
  },
  computed: {
    filteredRecipes() {
<<<<<<< HEAD
      if (!this.searchTerm) return this.recipes;
      return this.recipes.filter(r => r.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
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
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          this.currentUserEmail = decoded.email || decoded.sub;
          this.currentUserRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        } catch (e) { console.error("Token hiba", e); }
      }
    },
    async fetchRecipes() {
      try {
        const res = await axios.get(`https://localhost:5150/api/Recipes?page=${this.page}&pageSize=${this.pageSize}`);
        this.recipes = res.data.items;
        this.totalCount = res.data.totalCount;
      } catch (err) { this.error = "Hiba a receptek lekérésekor."; }
    },
    fullImagePath(path) {
      if (!path) return null;
      
      // 1. Kicseréljük a Windows-os visszaperjeleket simákra
      const normalizedPath = path.replace(/\\/g, '/');
      
      // 2. Csak a fájlnevet vágjuk le a végéről (pl. "malnas_turotorta.jpg")
      const fileName = normalizedPath.split('/').pop();
      
      // 3. Visszaadjuk a pontos URL-t, amit a böngészőben teszteltünk
      // Az Almás piskóta szóközeit a böngésző magától megoldja, ha így fűzzük össze
      return `https://localhost:5150/Images/${fileName}`;
    },
    onImgError(event) {
      console.warn("Kép betöltési hiba:", event.target.src);
    },
    formatIngredients(ingredients) {
      if (!ingredients || ingredients.length === 0) return 'Nincs megadva';
      return (typeof ingredients[0] === 'string' ? ingredients : ingredients.map(i => i.name)).join(', ');
    },
    viewRecipe(id) {
      this.$router.push(`/recept/${id}`);
=======
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
    async fetchRecipes() {
      try {
        const res = await axios.get(
          `https://localhost:5150/api/Recipes?page=${this.page}&pageSize=${this.pageSize}`
        )
        this.recipes = res.data.items
        this.totalCount = res.data.totalCount
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
    viewRecipe(id) {
      this.$router.push({ path: `/recept/${id}` })
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
    }
  }
}
</script>

<style scoped>
<<<<<<< HEAD
/* AZ EREDETI SZÍNEID ÉS STÍLUSAID */
.recipe-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.page-title { font-size: 1.75rem; font-weight: bold; margin-bottom: 20px; background: linear-gradient(to right, #FF8C00, #FFD700); -webkit-background-clip: text; background-clip: text; color: transparent; }

.controls-left { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 20px; }
.search-input { width: 200px; padding: 8px; border-radius: 5px; border: 1px solid #ccc; }

.recipe-list { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 20px; 
  justify-content: flex-start; 
}

.recipe-card { 
  flex: 0 0 calc(25% - 20px); 
  min-width: 250px;
  height: 380px; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  padding: 20px; 
  border-radius: 16px; 
  /* A kért narancssárga gradient háttér */
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05)); 
  box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
  transition: transform 0.3s ease; 
}

.recipe-card:hover { transform: translateY(-6px); box-shadow: 0 12px 20px rgba(0,0,0,0.2); }

.recipe-image-wrapper { width: 100%; height: 140px; overflow: hidden; border-radius: 10px; background: white; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.recipe-no-image { width: 100%; height: 140px; display: flex; align-items: center; justify-content: center; background: #eee; color: #888; border-radius: 10px; }

.recipe-title { font-weight: bold; margin: 10px 0; color: #333; }
.ingredients-scroll { max-height: 60px; overflow-y: auto; font-size: 0.9rem; margin-bottom: 10px; }
.author-info { font-size: 0.8rem; color: #555; margin-bottom: 10px; }

.view-btn { 
  background: linear-gradient(to right, #FFD700, #FF8C00); 
  border: none; 
  padding: 8px 15px; 
  border-radius: 5px; 
  cursor: pointer; 
  color: white; 
  font-weight: bold;
}

.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 30px; }
.pagination button { 
  padding: 6px 12px; 
  border-radius: 6px; 
  border: none; 
  background: linear-gradient(to right, #FF8C00, #FFD700); 
  color: white; 
  cursor: pointer; 
}
=======
.recipe-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
.page-title { font-size: 1.75rem; font-weight: bold; margin-bottom: 20px; background: linear-gradient(to right, #FF8C00, #FFD700); -webkit-background-clip: text; background-clip: text; color: transparent; }

.controls-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
}
.search-input {
  width: 200px;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.recipe-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}

/* Nagy képernyő: 5 kártya / sor */
.recipe-card {
  flex: 0 0 20%; 
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05));
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease, opacity 0.4s ease;
}

.recipe-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 20px rgba(0,0,0,0.2);
  filter: brightness(1.05);
}

.recipe-image-wrapper { width: 100%; height: 120px; overflow: hidden; border-radius: 10px; margin-bottom: 10px; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.recipe-no-image { width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; background: #eee; color: #888; font-weight: bold; border-radius: 10px; margin-bottom: 10px; }

.recipe-title { font-weight: bold; margin-bottom: 8px; }
.ingredients-scroll { max-height: 50px; overflow-y: auto; }
.ingredients { font-size: 0.9rem; margin-top: 5px; }
.author-info { display: flex; align-items: center; font-size: 0.875rem; color: #555; margin-top: 10px; }
.card-buttons { display: flex; justify-content: flex-end; margin-top: 10px; }
.view-btn { background: linear-gradient(to right, #FFD700, #FF8C00); border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; color: white; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
.pagination button { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; background: linear-gradient(to right, #FF8C00, #FFD700); color: white; font-weight: 500; }
.pagination button:disabled { background: #ccc; cursor: not-allowed; }
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40

.fade-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

<<<<<<< HEAD
@media (max-width: 1024px) { .recipe-card { flex: 0 0 calc(33.33% - 20px); } }
@media (max-width: 768px) { .recipe-card { flex: 0 0 calc(50% - 20px); } }
@media (max-width: 480px) { .recipe-card { flex: 0 0 100%; } }
</style>
=======
/* Közepes képernyő: 3 kártya / sor */
@media (max-width: 1024px) {
  .recipe-card { flex: 0 0 31%; }
}

/* Tablet: 2 kártya / sor */
@media (max-width: 768px) {
  .recipe-card { flex: 0 0 48%; }
  .recipe-page { padding: 15px; }
  .search-input { width: 100%; max-width: 200px; }
  .recipe-image-wrapper { height: 200px; }
}

/* Mobil: 1 kártya / sor */
@media (max-width: 480px) {
  .recipe-card { flex: 0 0 100%; }
  .recipe-image-wrapper { height: 180px; }
}
</style>
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
