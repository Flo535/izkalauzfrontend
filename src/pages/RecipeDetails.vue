<template>
  <div class="recipe-page fade-in">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Ínycsiklandó recept betöltése...</p>
    </div>

    <div v-else-if="error" class="error-container glass-card">
      <p class="error-text">❌ {{ error }}</p>
      <button @click="$router.push('/')" class="back-btn">Vissza a főoldalra</button>
    </div>

    <div v-else class="recipe-content">
      
      <div class="recipe-header">
        <div class="image-wrapper">
          <img 
            :src="currentImageUrl" 
            :alt="recipe.title" 
            @error="handleImageError" 
            class="main-recipe-img"
          />
          <div class="image-overlay"></div>
          <h1 class="recipe-title-overlay">{{ recipe.title }}</h1>
        </div>

        <div v-if="canUpload" class="upload-bar glass-card">
          <div class="upload-controls">
            <label class="file-label">
              <input type="file" @change="handleFileChange" accept="image/*" />
              <span>{{ selectedFile ? selectedFile.name : '🖼️ Új fotó feltöltése...' }}</span>
            </label>
            <button 
              class="upload-action-btn" 
              @click="uploadImage" 
              :disabled="uploading || !selectedFile"
            >
              {{ uploading ? 'Folyamatban...' : 'Mentés' }}
            </button>
          </div>
        </div>
      </div>

      <div class="recipe-meta-bar glass-card">
        <div class="meta-item">
          <span class="meta-icon">👤</span>
          <div class="meta-text">
            <label>Szakács</label>
            <span>{{ recipe.authorEmail }}</span>
          </div>
        </div>
        <div class="meta-item">
          <span class="meta-icon">📅</span>
          <div class="meta-text">
            <label>Közzétéve</label>
            <span>{{ formattedDate(recipe.createdAt) }}</span>
          </div>
        </div>
        <div class="meta-item">
          <span class="meta-icon">🔥</span>
          <div class="meta-text">
            <label>Kategória</label>
            <span>Házias</span>
          </div>
        </div>
      </div>

      <div class="recipe-grid">
        <section class="ingredients-card glass-card">
          <h2><span class="title-icon">🧂</span> Hozzávalók</h2>
          <ul class="ingredients-list">
            <li v-for="(item, index) in recipe.ingredients" :key="index">
              <span class="check-dot"></span>
              {{ formatIngredient(item) }}
            </li>
          </ul>
        </section>

        <section class="method-card glass-card">
          <h2><span class="title-icon">📖</span> Elkészítés</h2>
          <div class="method-text-container">
            <p class="method-text">{{ recipe.howToText || 'Nincs leírás megadva.' }}</p>
          </div>
        </section>
      </div>

      <div class="footer-actions">
         <button @click="$router.push('/')" class="secondary-btn">← Vissza a böngészéshez</button>
      </div>
    </div>
  </div>
</template>

<script>
// ... (A script rész marad a tiéd, mert az tökéletesen működik! Csak a JWT dekódolást és az útvonalakat tartsd meg)
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
    currentImageUrl() {
      const baseUrl = "https://localhost:5150/images/recipes/";
      const defaultImg = baseUrl + "default.jpg";
      if (this.failedImage || !this.recipe?.imagePath) return defaultImg;
      const fileName = this.recipe.imagePath.split(/[\\/]/).pop();
      return baseUrl + fileName;
    },
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
      } catch (err) { this.error = err.message; }
      finally { this.loading = false; }
    },
    checkUser() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const decodeFn = jwtDecodeModule.default || jwtDecodeModule.jwtDecode || jwtDecodeModule;
        const payload = decodeFn(token);
        this.currentUserEmail = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        const role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        this.isAdmin = role === 'Admin';
      } catch (e) { console.error("Token hiba", e); }
    },
    handleImageError(e) { e.target.onerror = null; this.failedImage = true; },
    handleFileChange(e) { this.selectedFile = e.target.files[0]; },
    async uploadImage() {
      if (!this.selectedFile) return;
      this.uploading = true;
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      try {
        const response = await fetch(`https://localhost:5150/api/Recipes/${this.recipe.id}/image`, {
          method: 'POST',
          body: formData,
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Hiba a feltöltés során.');
        alert('Kép sikeresen frissítve!');
        this.selectedFile = null;
        this.failedImage = false;
        await this.fetchRecipe();
      } catch (err) { alert(err.message); }
      finally { this.uploading = false; }
    },
    formatIngredient(item) {
      if (typeof item === 'string') return item;
      return `${item.name} - ${item.quantity} ${item.unit}`.trim();
    },
    formattedDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }
}
</script>

<style scoped>
.recipe-page {
  max-width: 1100px;
  margin: 80px auto 40px;
  padding: 0 20px;
}

/* Glassmorphism alap kártya */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

/* HEADER ÉS KÉP */
.recipe-header {
  position: relative;
  margin-bottom: 30px;
}

.image-wrapper {
  width: 100%;
  height: 500px;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}

.main-recipe-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}

.recipe-title-overlay {
  position: absolute;
  bottom: 30px;
  left: 40px;
  right: 40px;
  color: white;
  font-size: 3.5rem;
  font-weight: 800;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.5);
  margin: 0;
}

/* INFO BAR */
.recipe-meta-bar {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  margin-bottom: 30px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.meta-icon {
  font-size: 1.8rem;
  background: linear-gradient(135deg, #ff8c00, #ff4500);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.meta-text label {
  display: block;
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.meta-text span {
  font-weight: 600;
  color: #2c3e50;
}

/* GRID ELRENDEZÉS */
.recipe-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
}

.ingredients-card, .method-card {
  padding: 40px;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2c3e50;
}

.title-icon { color: #ff8c00; }

/* HOZZÁVALÓK LISTA */
.ingredients-list {
  list-style: none;
  padding: 0;
}

.ingredients-list li {
  padding: 12px 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 12px;
  color: #444;
}

.check-dot {
  width: 8px;
  height: 8px;
  background: #ff8c00;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ELKÉSZÍTÉS SZÖVEG */
.method-text {
  line-height: 1.8;
  white-space: pre-wrap;
  color: #444;
  font-size: 1.1rem;
}

/* FELTÖLTÉS MODAL-SZERŰ SÁV */
.upload-bar {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  z-index: 10;
}

.upload-action-btn {
  background: linear-gradient(135deg, #ff8c00, #ff4500);
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.upload-action-btn:hover { transform: scale(1.05); }

/* GOMBOK */
.secondary-btn {
  background: none;
  border: 2px solid #ff8c00;
  color: #ff8c00;
  padding: 12px 25px;
  border-radius: 15px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 30px;
}

/* ANIMÁCIÓK */
.fade-in { animation: fadeIn 0.8s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* MOBIL NÉZET */
@media (max-width: 900px) {
  .recipe-grid { grid-template-columns: 1fr; }
  .recipe-title-overlay { font-size: 2.2rem; }
  .image-wrapper { height: 350px; }
  .recipe-meta-bar { flex-direction: column; gap: 20px; }
}
</style>