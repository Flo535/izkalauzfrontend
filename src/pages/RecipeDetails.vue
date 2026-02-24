<template>
  <div class="recipe-page fade-in">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Recept betöltése...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>❌ {{ error }}</p>
      <button @click="$router.push('/')" class="back-btn">Vissza a főoldalra</button>
    </div>

    <div v-else class="recipe-content">
      
      <div class="image-section">
        <div class="image-wrapper">
          <img 
            :src="currentImageUrl" 
            :alt="recipe.title" 
            @error="handleImageError" 
            class="main-recipe-img"
          />
        </div>

        <div v-if="canUpload" class="upload-bar">
          <div class="upload-controls">
            <label class="file-label">
              <input type="file" @change="handleFileChange" accept="image/*" />
              <span>{{ selectedFile ? selectedFile.name : 'Válassz képet...' }}</span>
            </label>
            <button 
              class="upload-action-btn" 
              @click="uploadImage" 
              :disabled="uploading || !selectedFile"
            >
              {{ uploading ? 'Feltöltés...' : '📤 Kép mentése' }}
            </button>
          </div>
        </div>
      </div>

      <div class="details-wrapper">
        <h1 class="recipe-title">{{ recipe.title }}</h1>
        
        <div class="recipe-meta">
          <span class="meta-item">👤 {{ recipe.authorEmail }}</span>
          <span class="meta-item">📅 {{ formattedDate(recipe.createdAt) }}</span>
        </div>

        <div class="recipe-grid">
          <section class="ingredients-card">
            <h2>🧂 Hozzávalók</h2>
            <ul class="ingredients-list">
              <li v-for="(item, index) in recipe.ingredients" :key="index">
                {{ formatIngredient(item) }}
              </li>
            </ul>
          </section>

          <section class="method-card">
            <h2>📖 Elkészítés</h2>
            <p class="method-text">{{ recipe.howToText || 'Nincs leírás megadva.' }}</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as jwtDecodeModule from 'jwt-decode';

export default {
  name: 'RecipeDetails',
  data() {
    return {
      recipe: null,
      loading: true,
      error: null,
      uploading: false,
      selectedFile: null,
      failedImage: false,
      currentUserEmail: null,
      isAdmin: false
    }
  },
  computed: {
    // Kép útvonalának generálása a logjaid alapján javítva
    currentImageUrl() {
      // A currentImageUrl részben írd át az alap útvonalat:
      const baseUrl = "https://localhost:5150/images/recipes/";
      const defaultImg = baseUrl + "default.jpg";

      if (this.failedImage || !this.recipe?.imagePath) {
        return defaultImg;
      }

      // Csak a fájlnevet vesszük ki (levágjuk a felesleges mappaneveket)
      const fileName = this.recipe.imagePath.split(/[\\/]/).pop();
      return baseUrl + fileName;
    },
    // Jogosultság ellenőrzése
    canUpload() {
      if (!this.recipe) return false;
      return this.isAdmin || this.recipe.authorEmail === this.currentUserEmail;
    }
  },
  mounted() {
    this.checkUser();
    this.fetchRecipe();
  },
  methods: {
    async fetchRecipe() {
      try {
        const id = this.$route.params.id;
        const response = await fetch(`https://localhost:5150/api/Recipes/${id}`);
        if (!response.ok) throw new Error('A recept nem található.');
        this.recipe = await response.json();
        this.failedImage = false;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    checkUser() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const decodeFn = jwtDecodeModule.default || jwtDecodeModule.jwtDecode || jwtDecodeModule;
        const payload = decodeFn(token);
        
        // Email és Role kinyerése (Microsoft sémák kezelésével)
        this.currentUserEmail = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        const role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        this.isAdmin = role === 'Admin';
      } catch (e) {
        console.error("Token hiba", e);
      }
    },
    handleImageError(e) {
      e.target.onerror = null;
      this.failedImage = true;
    },
    handleFileChange(e) {
      this.selectedFile = e.target.files[0];
    },
    async uploadImage() {
      if (!this.selectedFile) return;
      
      this.uploading = true;
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        const response = await fetch(`https://localhost:5150/api/Recipes/${this.recipe.id}/image`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Hiba a feltöltés során.');

        alert('Kép sikeresen frissítve!');
        this.selectedFile = null;
        this.failedImage = false;
        await this.fetchRecipe(); // Frissítés az új képpel
      } catch (err) {
        alert(err.message);
      } finally {
        this.uploading = false;
      }
    },
    formatIngredient(item) {
      if (typeof item === 'string') return item;
      return `${item.name} - ${item.quantity} ${item.unit}`.trim();
    },
    formattedDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('hu-HU');
    }
  }
}
</script>

<style scoped>
.recipe-page {
  max-width: 1000px;
  margin: 100px auto 40px;
  padding: 0 20px;
}

/* Kép tároló - FIX MAGASSÁG */
.image-wrapper {
  width: 100%;
  height: 450px;
  background: #f0f0f0;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.main-recipe-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Feltöltő sáv */
.upload-bar {
  margin-top: -30px;
  background: white;
  padding: 15px 25px;
  border-radius: 15px;
  display: inline-block;
  margin-left: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: relative;
  z-index: 2;
}

.upload-controls { display: flex; gap: 15px; align-items: center; }

.file-label {
  background: #f8f9fa;
  padding: 8px 15px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.file-label input { display: none; }

.upload-action-btn {
  background: #ff8c00;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.upload-action-btn:disabled { background: #ccc; }

/* Tartalom stílus */
.details-wrapper { margin-top: 40px; }

.recipe-title {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.recipe-meta {
  color: #7f8c8d;
  margin-bottom: 40px;
  display: flex;
  gap: 20px;
}

.recipe-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.ingredients-card, .method-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  border: 1px solid #eee;
}

h2 { color: #ff8c00; margin-bottom: 20px; }

.ingredients-list { list-style: none; padding: 0; }
.ingredients-list li {
  padding: 10px 0;
  border-bottom: 1px solid #f9f9f9;
}

.method-text {
  line-height: 1.8;
  white-space: pre-wrap;
  color: #34495e;
}

/* Animáció */
.fade-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .recipe-grid { grid-template-columns: 1fr; }
  .image-wrapper { height: 300px; }
  .recipe-title { font-size: 2rem; }
}
</style>