<template>
  <div class="recipe-detail-page">

    <!-- Töltés -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Recept betöltése...</p>
    </div>

    <!-- Hiba -->
    <div v-else-if="error" class="error-state">
      <p class="error-text">{{ error }}</p>
      <button @click="$router.push('/')" class="btn-primary">Vissza a főoldalra</button>
    </div>

    <!-- Tartalom -->
    <div v-else class="recipe-content">

      <!-- Hero kép -->
      <div class="hero-wrap">
        <img
          :src="currentImageUrl"
          :alt="recipe.title"
          @error="handleImageError"
          @load="onImgLoad"
          class="hero-img"
        />
        <div class="hero-overlay"></div>
        <div class="hero-text">
          <span class="hero-category">{{ recipe.category }}</span>
          <h1 class="hero-title">{{ recipe.title }}</h1>
          <p v-if="recipe.description" class="hero-description">{{ recipe.description }}</p>
        </div>
      </div>

      <!-- Meta sáv -->
      <div class="meta-bar">
        <div class="meta-item">
          <span class="meta-label">Feltöltő</span>
          <span class="meta-value">{{ recipe.authorEmail }}</span>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-item">
          <span class="meta-label">Közzétéve</span>
          <span class="meta-value">{{ formattedDate(recipe.createdAt) }}</span>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-item">
          <span class="meta-label">Kategória</span>
          <span class="meta-value">{{ recipe.category }}</span>
        </div>
      </div>

      <!-- Hozzávalók + Elkészítés -->
      <div class="recipe-grid">

        <div class="card ingredients-card">
          <h2 class="card-title">Hozzávalók</h2>
          <ul class="ingredients-list">
            <li
              v-for="(item, index) in recipe.ingredients"
              :key="index"
              class="ingredient-item"
            >
              <span class="ing-dot"></span>
              <span>{{ formatIngredient(item) }}</span>
            </li>
          </ul>
        </div>

        <div class="card method-card">
          <h2 class="card-title">Elkészítés</h2>
          <p class="method-text">{{ recipe.howToText || 'Nincs leírás megadva.' }}</p>
        </div>

      </div>

      <!-- Vissza gomb -->
      <div class="footer-bar">
        <button @click="$router.go(-1)" class="btn-secondary">← Vissza</button>
      </div>

    </div>
  </div>
</template>

<script>
import * as jwtDecodeModule from 'jwt-decode'

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
      const base = 'https://localhost:5150/images/recipes/'
      const def  = base + 'default.jpg'
      if (this.failedImage || !this.recipe?.imagePath) return def
      const fileName = this.recipe.imagePath.split(/[\\/]/).pop()
      return base + fileName
    },
    canUpload() {
      if (!this.recipe) return false
      return this.isAdmin || this.recipe.authorEmail === this.currentUserEmail
    }
  },

  mounted() {
    this.checkUser()
    this.fetchRecipe()
  },

  methods: {
    async fetchRecipe() {
      try {
        const id = this.$route.params.id
        const res = await fetch(`https://localhost:5150/api/Recipes/${id}`)
        if (!res.ok) throw new Error('A recept nem található.')
        this.recipe = await res.json()
        this.failedImage = false
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    checkUser() {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const decodeFn = jwtDecodeModule.default || jwtDecodeModule.jwtDecode || jwtDecodeModule
        const payload = decodeFn(token)
        this.currentUserEmail = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        const role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        this.isAdmin = role === 'Admin'
      } catch (e) {
        console.error('Token hiba', e)
      }
    },

    onImgLoad(e) {
      e.target.classList.add('is-loaded')
    },

    handleImageError(e) {
      e.target.onerror = null
      this.failedImage = true
    },

    handleFileChange(e) {
      this.selectedFile = e.target.files[0]
    },

    async uploadImage() {
      if (!this.selectedFile) return
      this.uploading = true
      const formData = new FormData()
      formData.append('file', this.selectedFile)
      try {
        const res = await fetch(`https://localhost:5150/api/Recipes/${this.recipe.id}/image`, {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        if (!res.ok) throw new Error('Hiba a feltöltés során.')
        this.selectedFile = null
        this.failedImage = false
        await this.fetchRecipe()
      } catch (err) {
        alert(err.message)
      } finally {
        this.uploading = false
      }
    },

    formatIngredient(item) {
      if (typeof item === 'string') return item
      return `${item.name} – ${item.quantity} ${item.unit}`.trim()
    },

    formattedDate(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('hu-HU', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
/* ── Oldal ── */
.recipe-detail-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}

/* ── Töltés ── */
.loading-state {
  text-align: center;
  padding: 100px 20px;
  color: #aaa;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8e8e4;
  border-top-color: #FF8C00;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Hiba ── */
.error-state {
  text-align: center;
  padding: 80px 20px;
}

.error-text {
  color: #e74c3c;
  font-size: 1rem;
  margin-bottom: 20px;
}

/* ── Hero ── */
.hero-wrap {
  position: relative;
  width: 100%;
  height: 460px;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 24px;
  background: #e8e8e4;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.hero-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 8px 0 0;
  line-height: 1.6;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.hero-img.is-loaded {
  opacity: 1;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.1) 60%, transparent 100%);
}

.hero-text {
  position: absolute;
  bottom: 28px;
  left: 32px;
  right: 32px;
}

.hero-category {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  background: rgba(255, 140, 0, 0.9);
  color: white;
  padding: 4px 12px;
  border-radius: 50px;
  margin-bottom: 10px;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.6rem;
  font-weight: 600;
  color: white;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

/* ── Kép feltöltés ── */
.upload-bar {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.92);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-radius: 50px;
  padding: 7px 7px 7px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.upload-file-hidden {
  display: none;
}

.upload-file-label {
  cursor: pointer;
}

.upload-file-btn {
  font-size: 0.8rem;
  font-weight: 500;
  color: #555;
  white-space: nowrap;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.btn-upload {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 50px;
  border: none;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-upload:hover:not(:disabled) {
  background: #FF8C00;
}

.btn-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Meta sáv ── */
.meta-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8e8e4;
  padding: 18px 28px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.meta-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #bbb;
}

.meta-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
}

.meta-divider {
  width: 1px;
  height: 32px;
  background: #e8e8e4;
  flex-shrink: 0;
}

/* ── Leírás ── */
.description-box {
  background: #fff8f0;
  border: 1.5px solid #ffe0b2;
  border-radius: 16px;
  padding: 18px 24px;
  margin-bottom: 24px;
}

.description-text {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.7;
  margin: 0;
  font-style: italic;
}

/* ── Grid ── */
.recipe-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  margin-bottom: 32px;
}

/* ── Kártyák ── */
.card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e8e8e4;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e8e8e4;
}

/* ── Hozzávalók ── */
.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0ede8;
  font-size: 0.9rem;
  color: #444;
  line-height: 1.5;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #FF8C00;
  flex-shrink: 0;
}

/* ── Elkészítés ── */
.method-text {
  font-size: 0.95rem;
  line-height: 1.85;
  color: #444;
  white-space: pre-wrap;
  margin: 0;
}

/* ── Footer ── */
.footer-bar {
  display: flex;
  justify-content: flex-start;
}

/* ── Gombok ── */
.btn-primary,
.btn-secondary {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-primary {
  background: #1a1a1a;
  color: white;
}

.btn-primary:hover {
  background: #FF8C00;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: #666;
  border: 1.5px solid #dddad4;
}

.btn-secondary:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
  transform: translateY(-1px);
}

/* ── Reszponzív ── */
@media (max-width: 768px) {
  .hero-wrap {
    height: 320px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-text {
    bottom: 20px;
    left: 20px;
    right: 20px;
  }

  .recipe-grid {
    grid-template-columns: 1fr;
  }

  .meta-bar {
    gap: 16px;
    padding: 16px;
  }

  .meta-divider {
    display: none;
  }

  .upload-bar {
    top: 12px;
    right: 12px;
    left: 12px;
    border-radius: 14px;
    padding: 10px 14px;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .hero-wrap {
    height: 260px;
  }

  .hero-title {
    font-size: 1.4rem;
  }

  .card {
    padding: 20px;
  }

  .meta-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .meta-item {
    align-items: flex-start;
  }
}
</style>