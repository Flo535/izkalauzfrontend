<template>
  <div class="recipe-page">
    <div v-if="loading" class="loading">⏳ Recept betöltése...</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>

    <div v-else class="recipe-details">
      <div class="image-wrapper">
        <img :src="fullImagePath(recipe.imagePath)" :alt="recipe.title" @error="onImageError" />
      </div>

      <div v-if="canUpload" class="upload-section">
        <input type="file" @change="handleFileChange" class="upload-input"/>
        <button class="upload-btn" @click="uploadImage">📤 Kép feltöltése</button>
      </div>

      <h1 class="title">{{ recipe.title }}</h1>

      <div class="meta">
        <span>👤 {{ recipe.authorEmail }}</span>
        <span>📅 {{ formattedDate(recipe.createdAt) }}</span>
      </div>

      <section class="section">
        <h2>🧂 Hozzávalók</h2>
        <ul>
          <li v-for="(item, index) in recipe.ingredients" :key="index">
            {{ formatIngredient(item) }}
          </li>
        </ul>
      </section>

      <section class="section">
        <h2>📖 Elkészítés</h2>
        <p class="description">{{ recipe.howToText }}</p>
      </section>
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
      selectedFile: null,
      currentUserEmail: null,
      isAdmin: false
    }
  },
  computed: {
    canUpload() {
      return this.isAdmin || this.recipe?.authorEmail === this.currentUserEmail
    }
  },
  mounted() {
    this.fetchRecipe()
    this.checkUser()
  },
  methods: {
    async fetchRecipe() {
      try {
        const id = this.$route.params.id
        const response = await fetch(`https://localhost:5150/api/Recipes/${id}`)
        if (!response.ok) throw new Error('Recept nem található')
        this.recipe = await response.json()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    checkUser() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const decodeFn = jwtDecodeModule.default || jwtDecodeModule.jwtDecode || jwtDecodeModule;
        const payload = decodeFn(token);
        this.currentUserEmail = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        this.isAdmin = roleClaim === 'Admin';
      } catch (err) {
        console.error("Token hiba:", err);
      }
    },
    fullImagePath(path) {
      if (!path) return "https://localhost:5150/Images/default.jpg";
      if (path.startsWith('http')) return path;
      const fileName = path.split(/[\\/]/).pop();
      return `https://localhost:5150/Images/${fileName}`;
    },
    onImageError(e) {
      e.target.src = "https://localhost:5150/Images/default.jpg";
    },
    formatIngredient(item) {
      if (typeof item === 'string') return item;
      if (!item) return 'Ismeretlen';
      return `${item.name || ''} ${item.quantity || ''} ${item.unit || ''}`.trim();
    },
    formattedDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('hu-HU');
    },
    handleFileChange(e) {
      this.selectedFile = e.target.files[0]
    },
    async uploadImage() {
      if (!this.selectedFile) return alert('Válassz ki egy fájlt!');
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`https://localhost:5150/api/Recipes/${this.recipe.id}/image`, {
          method: 'POST',
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error();
        alert('Kép sikeresen feltöltve!');
        this.fetchRecipe();
      } catch {
        alert('Hiba a feltöltés során.');
      }
    }
  }
}
</script>

<style scoped>
.recipe-page { padding: 20px; max-width: 900px; margin: 80px auto; }
.recipe-details { animation: fadeIn 0.5s ease forwards; }

.image-wrapper {
  width: 100%;
  height: 350px;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 20px;
  background: #eee;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-section {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.upload-btn, .upload-input {
  background: linear-gradient(to right, #ff8c00, #ffd700);
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  font-weight: 500;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(to right, #ff8c00, #ffbb33);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 20px;
}

.section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.section h2 { margin-bottom: 10px; color: #ff8c00; }
.description { white-space: pre-wrap; line-height: 1.7; }

.loading, .error { text-align: center; font-size: 1.2rem; padding: 40px; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .recipe-page { margin-top: 40px; }
  .image-wrapper { height: 200px; }
}
</style>