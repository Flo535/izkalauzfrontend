<template>
  <div class="favorites-page">

    <transition name="modal">
      <div v-if="confirm.visible" class="modal-overlay" @click.self="cancelConfirm">
        <div class="modal-box">
          <p class="modal-msg">{{ confirm.message }}</p>
          <div class="modal-btns">
            <button class="modal-btn modal-btn--cancel" @click="cancelConfirm">Mégse</button>
            <button class="modal-btn modal-btn--confirm" @click="doConfirm">Igen, eltávolítom</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h2 class="page-title">Kedvenc Receptjeim</h2>
      <p class="page-subtitle">A legjobb fogások, amiket szeretsz</p>
    </div>

    <!-- Töltés -->
    <div v-if="loading" class="loading-state">
      <p class="loading-icon">⏳</p>
      <p>Kedvencek betöltése...</p>
    </div>

    <!-- Hiba -->
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <!-- Üres állapot -->
    <div v-else-if="favorites.length === 0" class="empty-state">
      <p class="empty-icon">💔</p>
      <p class="empty-title">Még nincs kedvenc recepted.</p>
      <p class="empty-hint">Böngészd a recepteket és add hozzá őket a kedvenceidhez!</p>
      <router-link to="/receptek" class="browse-btn" name="rSearchBtn">
        🥘 Receptek böngészése
      </router-link>
    </div>

    <!-- Kártya grid -->
    <div v-else class="favorites-grid">
      <div
        v-for="favorite in favorites"
        :key="favorite.id"
        class="recipe-card"
        @click="viewRecipe(favorite.recipeId)"
      >
        <!-- Eltávolítás gomb -->
        <button
          class="remove-btn"
          name="removeBtn"
          @click.stop="removeFavorite(favorite.recipeId)"
          title="Eltávolítás a kedvencekből"
        >
          ✕
        </button>

        <!-- Kép -->
        <div class="card-img-wrap">
          <img
            v-if="!failedImages.has(favorite.id)"
            :src="fullImagePath(favorite)"
            :alt="favorite.title"
            class="card-img"
            @load="onImgLoad"
            @error="onImgError(favorite.id, $event)"
          />
          <div v-else class="card-img-placeholder">📷</div>
        </div>

        <!-- Tartalom -->
        <div class="card-body">
          <p class="card-category">{{ favorite.category || 'Egyéb' }}</p>
          <h3 class="card-title">{{ favorite.title }}</h3>
          <p class="card-desc">{{ favorite.description || 'Nincs leírás.' }}</p>
          <div class="card-footer">
            <p class="card-date">📅 {{ formatDate(favorite.addedAt) }}</p>
            <div class="card-arrow">→</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'

const API = 'https://localhost:5150/api'

export default {
  name: 'Favorites',

  data() {
    return {
      favorites: [],
      loading: true,
      error: null,
      confirm: { visible: false, message: '', resolve: null },
      failedImages: new Set()
    }
  },

  mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
      return
    }
    this.fetchFavorites()
  },

  methods: {
    authHeaders() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    },

    async fetchFavorites() {
      try {
        this.loading = true
        this.error = null
        const res = await axios.get(`${API}/Favorites`, this.authHeaders())
        this.favorites = res.data || []
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.favorites = []
        } else {
          console.error('Kedvencek betöltése sikertelen:', err)
          this.error = 'Hiba történt a kedvencek betöltése során.'
        }
      } finally {
        this.loading = false
      }
    },

    async removeFavorite(recipeId) {
      const ok = await this.askConfirm('Biztosan eltávolítod ezt a receptet a kedvencek közül?')
      if (!ok) return
      try {
        await axios.delete(`${API}/Favorites/${recipeId}`, this.authHeaders())
        this.favorites = this.favorites.filter(f => f.recipeId !== recipeId)
      } catch (err) {
        console.error('Eltávolítás sikertelen:', err)
      }
    },

    viewRecipe(recipeId) {
      this.$router.push(`/recept/${recipeId}`)
    },

    fullImagePath(favorite) {
      const base = 'https://localhost:5150/'
      if (this.failedImages.has(favorite.id) || !favorite.imagePath) {
        return base + 'images/recipes/default.jpg'
      }
      let clean = favorite.imagePath.replace(/\\/g, '/').replace(/^\//, '')
      if (!clean.includes('images/')) clean = 'images/recipes/' + clean
      return base + clean
    },

    onImgLoad(e) {
      e.target.classList.add('is-loaded')
    },

    onImgError(id, e) {
      e.target.onerror = null
      this.failedImages = new Set([...this.failedImages, id])
      e.target.src = 'https://localhost:5150/images/recipes/default.jpg'
    },

    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
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
    }

  }
}
</script>

<style scoped>
/* ── Oldal ── */
.favorites-page {
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

/* ── Töltés ── */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #FF8C00;
  font-size: 1rem;
}

.loading-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

/* ── Hiba ── */
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

/* ── Üres állapot ── */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #aaa;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 0.9rem;
  color: #aaa;
  font-style: italic;
  margin-bottom: 0;
}

.browse-btn {
  display: inline-block;
  margin-top: 28px;
  padding: 12px 28px;
  background: #1a1a1a;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.browse-btn:hover {
  background: #FF8C00;
  box-shadow: 0 4px 14px rgba(255, 140, 0, 0.3);
  transform: translateY(-1px);
}

/* ── Grid ── */
.favorites-grid {
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

/* ── Eltávolítás gomb ── */
.remove-btn {
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
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: rgba(231, 76, 60, 0.88);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  transition: transform 0.2s ease, background 0.2s ease;
  padding: 0;
  line-height: 1;
}

.remove-btn:hover {
  background: rgba(192, 57, 43, 1);
  transform: scale(1.15) rotate(90deg);
}

/* ── Kép ── */
.card-img-wrap {
  width: 100%;
  height: 200px;
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

.card-date {
  font-size: 0.75rem;
  color: #aaa;
  margin: 0;
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
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.8rem;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>