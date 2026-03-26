<template>
  <div class="recipes-page">

    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h2 class="page-title">Receptek</h2>
      <p class="page-subtitle">Fedezd fel a legjobb fogásokat</p>
    </div>

    <!-- Kereső -->
    <div class="search-wrap">
      <span class="search-icon">🔍</span>
      <input
        v-model="searchTerm"
        @input="page = 1"
        placeholder="Keresés a receptek között..."
        class="search-input"
        name="recipeFinder"
      />
      <button v-if="searchTerm" class="search-clear" @click="searchTerm = ''; page = 1">✕</button>
    </div>

    <!-- Hiba -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Üres állapot -->
    <div v-else-if="paginatedRecipes.length === 0" class="empty-state">
      <p class="empty-icon">🍽️</p>
      <p>Nincs találat a keresésre.</p>
    </div>

    <!-- Kártya grid -->
    <div v-else class="recipe-grid">
      <div
        v-for="recipe in paginatedRecipes"
        :key="recipe.id"
        class="recipe-card"
        name="recipeCards"
        @click="viewRecipe(recipe.id)"
      >
        <!-- Kedvenc gomb -->
        <button
          class="fav-btn"
          name="favBtn"
          :class="favoriteIds.includes(recipe.id) ? 'active' : 'inactive'"
          @click.stop="toggleFavorite(recipe.id)"
          title="Kedvenc"
        >
          {{ favoriteIds.includes(recipe.id) ? '♥' : '♡' }}
        </button>

        <!-- Kép -->
        <div class="card-img-wrap">
          <img
            v-if="!failedImages.has(recipe.id)"
            :src="fullImagePath(recipe)"
            :alt="recipe.title"
            class="card-img"
            @load="onImgLoad"
            @error="onImgError(recipe.id, $event)"
          />
          <div v-else class="card-img-placeholder">📷</div>
        </div>

        <!-- Tartalom -->
        <div class="card-body">
          <p class="card-category">{{ recipe.category || 'Egyéb' }}</p>
          <h3 class="card-title" name="CardTitle">{{ recipe.title }}</h3>
          <p class="card-desc">{{ recipe.description || 'Nincs leírás.' }}</p>
          <div class="card-footer">
            <p class="card-author">✍️ <strong>{{ recipe.authorEmail || 'Ismeretlen' }}</strong></p>
            <div class="card-arrow">→</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lapozó -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="page === 1" class="page-btn page-btn-long">«</button>
      <button
        v-for="p in totalPages"
        :key="p"
        @click="goToPage(p)"
        :class="['page-btn', { active: page === p }]"
      >
        {{ p }}
      </button>
      <button @click="nextPage" :disabled="page >= totalPages" class="page-btn page-btn-long">»</button>
    </div>

  </div>
</template>

<script>
import axios from 'axios'

const API = 'https://localhost:5150/api'

export default {
  name: 'Recipes',

  data() {
    return {
      allRecipes: [],
      searchTerm: '',
      error: null,
      page: parseInt(localStorage.getItem('lastRecipePage')) || 1,
      pageSize: 9,
      failedImages: new Set(),
      favoriteIds: []
    }
  },

  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.allRecipes
      const q = this.searchTerm.toLowerCase()
      return this.allRecipes.filter(r =>
        r.title && r.title.toLowerCase().includes(q)
      )
    },
    totalPages() {
      return Math.ceil(this.filteredRecipes.length / this.pageSize)
    },
    paginatedRecipes() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredRecipes.slice(start, start + this.pageSize)
    }
  },

  async mounted() {
    await this.fetchRecipes()
    await this.fetchFavoriteIds()
    if (this.page > this.totalPages && this.totalPages > 0) {
      this.page = 1
    }
  },

  methods: {
    async fetchRecipes() {
      try {
        const res = await axios.get(`${API}/Recipes`)
        this.allRecipes = Array.isArray(res.data) ? res.data : (res.data.items || [])
      } catch (err) {
        this.error = 'Hiba a receptek lekérésekor.'
        console.error(err)
      }
    },

    async fetchFavoriteIds() {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const res = await axios.get(`${API}/Favorites/ids`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.favoriteIds = res.data || []
      } catch (err) {
        console.error('Kedvenc ID-k betöltése sikertelen', err)
      }
    },

    async toggleFavorite(recipeId) {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$router.push('/login')
        return
      }
      const isFav = this.favoriteIds.includes(recipeId)
      try {
        if (isFav) {
          await axios.delete(`${API}/Favorites/${recipeId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          this.favoriteIds = this.favoriteIds.filter(id => id !== recipeId)
        } else {
          await axios.post(`${API}/Favorites/${recipeId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
          this.favoriteIds = [...this.favoriteIds, recipeId]
        }
      } catch (err) {
        console.error('Kedvenc módosítás sikertelen', err)
      }
    },

    fullImagePath(recipe) {
      const base = 'https://localhost:5150/'
      if (this.failedImages.has(recipe.id) || !recipe.imagePath) {
        return base + 'images/recipes/default.jpg'
      }
      let clean = recipe.imagePath.replace(/\\/g, '/').replace(/^\//, '')
      if (!clean.includes('images/')) clean = 'images/recipes/' + clean
      return base + clean
    },

    onImgLoad(e) {
      e.target.classList.add('is-loaded')
    },

    onImgError(recipeId, e) {
      e.target.onerror = null
      this.failedImages = new Set([...this.failedImages, recipeId])
      e.target.src = 'https://localhost:5150/images/recipes/default.jpg'
    },

    viewRecipe(id) {
      this.$router.push(`/recept/${id}`)
    },

    goToPage(p) {
      this.page = p
      localStorage.setItem('lastRecipePage', p)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    nextPage() { if (this.page < this.totalPages) this.goToPage(this.page + 1) },
    prevPage() { if (this.page > 1) this.goToPage(this.page - 1) }
  }
}
</script>

<style scoped>
/* ── Oldal ── */
.recipes-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}

/* ── Fejléc ── */
.page-header {
  text-align: center;
  margin-bottom: 36px;
}

.page-label {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #FF8C00;
  margin-bottom: 8px;
  font-weight: 600;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px;
  background: #ff9e15;
  /*background: linear-gradient(to right, #FF8C00, #FFD700);*/
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #656565;
  margin: 0;
}

/* ── Kereső ── */
.search-wrap {
  position: relative;
  max-width: 480px;
  width: 100%;
  margin: 0 auto 36px;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.95rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 40px 12px 42px;
  border-radius: 50px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.95rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  background: #fff;
}

.search-clear {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
  width: auto;
  line-height: 1;
}

.search-clear:hover {
  color: #555;
  background: none;
}

/* ── Hiba / Üres ── */
.error-message {
  text-align: center;
  color: #e74c3c;
  background: #fee;
  border: 1.5px solid #fcc;
  padding: 12px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #aaa;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
}

/* ── Grid ── */
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

/* ── Kártya ── */
.recipe-card {
  background: #f5f5f3;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.35s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.recipe-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12);
}

.recipe-card:hover .card-img {
  transform: scale(1.04);
}

/* ── Kedvenc gomb ── */
.fav-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  transition: transform 0.2s ease, background 0.2s ease;
  padding: 0;
  line-height: 1;
}

.fav-btn.inactive {
  background: rgba(255, 255, 255, 0.85);
  color: #888;
}

.fav-btn.active {
  background: rgba(255, 90, 90, 0.92);
  color: white;
}

.fav-btn:hover {
  transform: scale(1.18);
}

/* ── Kép ── */
.card-img-wrap {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #e8e8e4;
  position: relative;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.3s ease;
}

.card-img.is-loaded {
  opacity: 1;
}

.card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #bbb;
}

/* ── Kártya tartalom ── */
.card-body {
  padding: 18px 20px 20px;
}

.card-category {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #FF8C00;
  margin-bottom: 6px;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.35;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  font-size: 0.85rem;
  color: #888;
  line-height: 1.6;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e8e8e4;
  padding-top: 12px;
}

.card-author {
  font-size: 0.75rem;
  color: #aaa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 75%;
  margin: 0;
}

.card-author strong {
  color: #666;
  font-weight: 500;
}

.card-arrow {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #1a1a1a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

/* ── Lapozó ── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 48px;
  flex-wrap: wrap;
}

.page-btn {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  color: #555;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  padding: 0;
  font-family: 'DM Sans', 'Poppins', sans-serif;
}

.page-btn:hover:not(:disabled) {
  background: #FF8C00;
  border-color: #FF8C00;
  color: white;
  transform: translateY(-2px);
}

.page-btn.active {
  background: linear-gradient(135deg, #FF8C00, #FFD700);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.35);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-btn-long {
  width: auto;
  padding: 0 16px;
}

/* ── Reszponzív ── */
@media (max-width: 1024px) {
  .recipe-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.8rem;
  }

  .recipe-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .search-input {
    font-size: 1rem;
  }
}
</style>