<template>
  <div class="admin-page fade-in">
    <div class="header-actions">
      <h2>⏳ Jóváhagyásra váró receptek</h2>
      <button @click="fetchPending" class="fix-btn">🔄 Frissítés</button>
    </div>

    <div v-if="loading" class="status-msg">⏳ Betöltés...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="recipes.length === 0 && !loading" class="no-pending">
      <p>Nincs több jóváhagyásra váró recept. ✨</p>
    </div>

    <div class="admin-grid">
      <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
        
        <div class="recipe-image-wrapper">
          <img 
            :src="fullImagePath(recipe.imagePath)" 
            @load="onImgLoad"
            @error="onImgError"
            class="admin-img"
          />
        </div>

        <div class="card-body">
          <h3 class="recipe-title">{{ recipe.title }}</h3>
          
          <p class="recipe-desc">{{ recipe.description || 'Nincs leírás.' }}</p>

          <p class="author">Beküldő: <strong>{{ recipe.authorEmail || 'Ismeretlen' }}</strong></p>

          <div class="buttons">
            <button @click="updateStatus(recipe.id, true)" class="approve-btn">✅ Jóváhagy</button>
            <button @click="updateStatus(recipe.id, false)" class="reject-btn">❌ Elutasít</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { getImageUrl, handleImageError } from '@/utils/imageHelper'

export default {
  name: 'AdminRecipes',
  data() {
    return {
      recipes: [],
      loading: true,
      error: null
    }
  },
  mounted() {
    this.fetchPending()
  },
  methods: {
    fullImagePath(path) {
      return getImageUrl(path)
    },
    onImgLoad(e) {
      e.target.classList.add('is-loaded');
    },
    onImgError(e) {
      handleImageError(e)
    },
    getAuthConfig() {
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      if (!token) return null;
      return { headers: { Authorization: `Bearer ${token}` } };
    },
    async fetchPending() {
      this.loading = true;
      this.error = null;
      try {
        const config = this.getAuthConfig();
        if (!config) throw new Error('Nem vagy bejelentkezve.');
        const res = await axios.get('https://localhost:5150/api/admin/recipes/pending', config);
        this.recipes = res.data || [];
      } catch (err) {
        this.error = "Nincs több jóváhagyásra váró recept.";
        this.recipes = [];
      } finally {
        this.loading = false;
      }
    },
    async updateStatus(id, isApproved) {
      const config = this.getAuthConfig();
      if (!config) return;

      try {
        if (isApproved) {
          await axios.put(`https://localhost:5150/api/admin/recipes/${id}/status`, { isApproved: true }, config);
          alert('Recept jóváhagyva!');
        } else {
          if (confirm("Biztosan elutasítod és véglegesen törlöd ezt a receptet?")) {
            await axios.delete(`https://localhost:5150/api/recipes/${id}`, config);
            alert('Recept törölve!');
          } else {
            return;
          }
        }
        this.recipes = this.recipes.filter(r => r.id !== id);
      } catch (err) {
        alert('Hiba történt: ' + (err.response?.data || err.message));
      }
    }
  }
}
</script>

<style scoped>
.admin-page { max-width: 1000px; margin: 40px auto; padding: 20px; font-family: sans-serif; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }

/* Grid elrendezés a fix kártyaméretekért */
.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.recipe-card { 
  background: white; 
  border-radius: 15px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 520px; /* FIX MAGASSÁG: Minden kártya egyforma marad */
}

/* FIX KÉPKERET A REMEGÉS ELLEN */
.recipe-image-wrapper { 
  width: 100%; 
  height: 220px; 
  min-height: 220px;
  background: #f0f0f0; 
  overflow: hidden;
  flex-shrink: 0;
}

.admin-img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display: block;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.admin-img.is-loaded { opacity: 1; }

.card-body { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }

.recipe-title { 
  font-size: 1.2rem; 
  margin: 0 0 10px 0; 
  height: 2.8rem; /* Fix 2 sor */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4rem;
}

.recipe-desc { 
  font-size: 0.9rem; 
  color: #666; 
  height: 3rem; /* Fix magasság a leírásnak */
  overflow: hidden;
  margin-bottom: 10px;
}

.author { font-size: 0.85rem; margin-bottom: 15px; }

.buttons { display: flex; gap: 10px; margin-top: auto; }

button { padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; flex: 1; }
.approve-btn { background: #2ecc71; color: white; }
.approve-btn:hover { background: #27ae60; }
.reject-btn { background: #e74c3c; color: white; }
.reject-btn:hover { background: #c0392b; }
.fix-btn { background: #3498db; color: white; padding: 10px 20px; }

.error { color: #e74c3c; text-align: center; margin-bottom: 20px; font-weight: bold; }
.status-msg { text-align: center; padding: 20px; }
.no-pending { text-align: center; padding: 40px; color: #666; border: 2px dashed #ddd; border-radius: 15px; grid-column: 1 / -1; }
</style>