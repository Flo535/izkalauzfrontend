<template>
  <div class="profile-page">

    <transition name="modal">
      <div v-if="confirm.visible" class="modal-overlay" @click.self="cancelConfirm">
        <div class="modal-box">
          <p class="modal-msg">{{ confirm.message }}</p>
          <div class="modal-btns">
            <button class="modal-btn modal-btn--cancel" @click="cancelConfirm">Mégse</button>
            <button class="modal-btn modal-btn--confirm" @click="doConfirm">Igen, törlöm</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h2 class="page-title">Saját Receptjeim</h2>
      <p class="page-subtitle" v-if="userEmail">{{ userEmail }}</p>
    </div>

    <!-- Kontrollok -->
    <div class="controls">
      <button class="btn-dark" @click="$router.push('/uj-recept')">
        + Új recept
      </button>
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchTerm"
          @input="page = 1"
          placeholder="Keresés..."
          class="search-input"
        />
        <button v-if="searchTerm" class="search-clear" @click="searchTerm = ''; page = 1">✕</button>
      </div>
    </div>

    <!-- Hiba -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Üres állapot -->
    <div v-else-if="paginatedRecipes.length === 0" class="empty-state">
      <p class="empty-icon">🍽️</p>
      <p>Még nincs feltöltött recepted.</p>
      <button class="btn-dark" style="margin-top: 16px" @click="$router.push('/uj-recept')">
        + Első receptem hozzáadása
      </button>
    </div>

    <!-- Kártya grid -->
    <div v-else class="recipe-grid">
      <div
        v-for="recipe in paginatedRecipes"
        :key="recipe.id"
        class="recipe-card"
        @click="$router.push(`/recept/${recipe.id}`)"
      >
        <!-- Kép -->
        <div class="card-img-wrap">
          <img
            v-if="!failedImages.has(recipe.id)"
            :src="getImageUrl(recipe)"
            :alt="recipe.title"
            class="card-img"
            @load="onImgLoad"
            @error="onImageError(recipe.id, $event)"
          />
          <div v-else class="card-img-placeholder">📷</div>
        </div>

        <!-- Tartalom -->
        <div class="card-body">
          <p class="card-category">{{ recipe.category || 'Egyéb' }}</p>
          <h3 class="card-title">{{ recipe.title }}</h3>
          <p class="card-desc">{{ recipe.description || 'Nincs leírás.' }}</p>

          <div class="card-footer">
            <div class="card-btns" @click.stop>
              <button class="btn-edit" @click="$router.push(`/szerkesztes/${recipe.id}`)">
                📝 Szerkesztés
              </button>
              <button class="btn-delete" @click="deleteRecipe(recipe.id)">
                🗑️ Törlés
              </button>
            </div>
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
  name: 'ProfilePage',

  data() {
    return {
      userEmail: '',
      myRecipes: [],
      searchTerm: '',
      error: null,
      page: 1,
      pageSize: 9,
      confirm: { visible: false, message: '', resolve: null },
      failedImages: new Set()
    }
  },

  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.myRecipes
      const q = this.searchTerm.toLowerCase()
      return this.myRecipes.filter(r =>
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
    this.extractUserEmail()
    await this.fetchRecipes()
  },

  methods: {
    extractUserEmail() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          this.userEmail = payload.unique_name || payload.email || payload.sub || ''
        } catch (err) {
          console.warn('JWT decode error:', err)
        }
      }
    },

    getImageUrl(recipe) {
      const base = 'https://localhost:5150/'
      const defaultImg = base + 'images/recipes/default.jpg'
      if (this.failedImages.has(recipe.id) || !recipe.imagePath) return defaultImg
      if (recipe.imagePath.startsWith('http')) return recipe.imagePath
      const fileName = recipe.imagePath.split(/[\\/]/).pop()
      return `${base}images/recipes/${fileName}`
    },

    onImgLoad(e) {
      e.target.classList.add('is-loaded')
    },

    onImageError(recipeId, e) {
      e.target.onerror = null
      this.failedImages = new Set([...this.failedImages, recipeId])
      e.target.src = 'https://localhost:5150/images/recipes/default.jpg'
    },

    async fetchRecipes() {
      try {
        const token = localStorage.getItem('token')
        if (!token) { this.$router.push('/login'); return }
        const res = await axios.get(`${API}/Recipes/my`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.myRecipes = res.data.items || (Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        this.error = 'Nem sikerült betölteni a receptjeidet.'
        if (err.response?.status === 401) this.$router.push('/login')
      }
    },

    async deleteRecipe(id) {
      const ok = await this.askConfirm('Biztosan törölni szeretnéd ezt a receptet?')
      if (!ok) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API}/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await this.fetchRecipes()
      } catch {
        // ide jöhet majd toast is ha kell
        console.error('Hiba történt a törlés során!')
      }
    },

    goToPage(p) {
      this.page = p
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    // ── Megerősítő modál ──
    askConfirm(message) {
      return new Promise(resolve => {
        this.confirm = { visible: true, message, resolve }
      })
    },
    doConfirm() {
      this.confirm.resolve(true)
      this.confirm.visible = false
    },
    cancelConfirm() {
      this.confirm.resolve(false)
      this.confirm.visible = false
    },

    nextPage() { if (this.page < this.totalPages) this.goToPage(this.page + 1) },
    prevPage() { if (this.page > 1) this.goToPage(this.page - 1) }
  }
}
</script>

<style scoped>
/* ── Oldal ── */
.profile-page {
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
  font-weight: 600;
  margin-bottom: 8px;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 600;
  margin: 0 0 8px;
  background: #ff9e15;
  /*background: linear-gradient(to right, #FF8C00, #FFD700);*/
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 0.85rem;
  color: #656565;
  margin: 0;
}

/* ── Kontrollok ── */
.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.btn-dark {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  background: #1a1a1a;
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  line-height: 1;
  width: auto;
}

.btn-dark:hover {
  background: #FF8C00;
  transform: translateY(-1px);
}

/* ── Kereső ── */
.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 360px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 40px;
  border-radius: 50px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.875rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  background: #fff;
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 0.8rem;
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
  margin-bottom: 12px;
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

/* ── Kép ── */
.card-img-wrap {
  width: 100%;
  height: 190px;
  overflow: hidden;
  background: #e8e8e4;
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

/* ── Tartalom ── */
.card-body {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-category {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #FF8C00;
  margin: 0;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.35;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  font-size: 0.83rem;
  color: #888;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.6em * 2);
}

/* ── Footer gombok ── */
.card-footer {
  border-top: 1px solid #e8e8e4;
  padding-top: 12px;
  margin-top: 6px;
}

.card-btns {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 8px 10px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  transition: background 0.2s ease, transform 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-edit {
  background: #242424;
  color: #d3d1d1;
}

.btn-edit:hover {
  background: #e8e8e4;
  color: #1a1a1a;
  transform: translateY(-1px);
}

.btn-delete {
  background: #ffc8c8;
  color: #873e36;
}

.btn-delete:hover {
  background: #873e36;
  color: #ffeded;
  transform: translateY(-1px);
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


/* ── Megerősítő modál ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 24px;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}

.modal-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 28px 24px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-msg {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #1a1a1a;
  margin: 0 0 24px;
  line-height: 1.5;
}

.modal-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.modal-btn {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.modal-btn--cancel {
  background: #f5f5f3;
  color: #555;
  border: 1.5px solid #e0ddd8;
}

.modal-btn--cancel:hover {
  border-color: #aaa;
  color: #1a1a1a;
}

.modal-btn--confirm {
  background: #e74c3c;
  color: white;
  border: 1.5px solid #e74c3c;
}

.modal-btn--confirm:hover {
  background: #c0392b;
  border-color: #c0392b;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.92);
  opacity: 0;
}

@media (max-width: 480px) {
  .modal-box {
    padding: 24px 20px 20px;
  }

  .modal-btns {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
    text-align: center;
  }
}


/* ── Reszponzív ── */
@media (max-width: 1024px) {
  .recipe-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 600px) {
  .page-title { font-size: 1.8rem; }
  .recipe-grid { grid-template-columns: 1fr; gap: 16px; }
  .controls { flex-direction: column; align-items: stretch; }
  .search-wrap { max-width: 100%; }
  .btn-dark { justify-content: center; }
}
</style>