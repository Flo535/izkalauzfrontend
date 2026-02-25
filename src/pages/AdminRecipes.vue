<template>
  <div class="admin-page fade-in">
    <div class="header-actions">
      <h2>⏳ Jóváhagyásra váró receptek</h2>
      <button @click="fetchPending" class="fix-btn">🔄 Frissítés</button>
    </div>

    <div v-if="loading">⏳ Betöltés...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="recipes.length === 0 && !loading" class="no-pending">
      <p>Nincs több jóváhagyásra váró recept. ✨</p>
    </div>

    <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
      <h3>{{ recipe.title }}</h3>
      <p>{{ recipe.description }}</p>

      <div class="recipe-image-wrapper">
        <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" />
        <div v-else class="recipe-no-image">Nincs kép</div>
      </div>

      <p>Beküldő: <strong>{{ recipe.authorEmail || 'Ismeretlen' }}</strong></p>

      <div class="buttons">
        <button @click="updateStatus(recipe.id, true)" class="approve-btn">✅ Jóváhagy</button>
        <button @click="updateStatus(recipe.id, false)" class="reject-btn">❌ Elutasít</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

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
      if (!path) return null
      const cleanPath = path.replace(/\\/g, '/')
      // Ha a path már tartalmazza a /images-t, ne duplázzuk
      return `https://localhost:5150${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`
    },
    getAuthConfig() {
      // A bejelentkezésnél használt token neve (lehet 'jwt' vagy 'token')
      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      if (!token) return null
      return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    },
    async fetchPending() {
      this.loading = true
      this.error = null
      try {
        const config = this.getAuthConfig()
        if (!config) throw new Error('Nem vagy bejelentkezve.')

        // JAVÍTVA: Az admin végpontot hívjuk
        const res = await axios.get('https://localhost:5150/api/admin/recipes/pending', config)
        this.recipes = res.data || []
      } catch (err) {
        this.error = "Nincs jóváhagyásra váró recept vagy hiba történt."
        console.error(err)
        this.recipes = []
      } finally {
        this.loading = false
      }
    },
    async updateStatus(id, isApproved) {
      try {
        const config = this.getAuthConfig()
        // JAVÍTVA: Az új status frissítő végpontot hívjuk
        await axios.put(`https://localhost:5150/api/admin/recipes/${id}/status`, 
          { isApproved: isApproved }, 
          config
        )
        
        this.recipes = this.recipes.filter(r => r.id !== id)
        alert(isApproved ? 'Recept sikeresen jóváhagyva!' : 'Recept elutasítva (státusz frissítve).')
      } catch (err) {
        alert('Hiba történt: ' + (err.response?.data || err.message))
      }
    }
  }
}
</script>

<style scoped>
.admin-page { max-width: 800px; margin: 40px auto; padding: 20px; font-family: sans-serif; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.recipe-card { border: none; padding: 20px; margin-bottom: 20px; border-radius: 15px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.recipe-image-wrapper { width: 100%; height: 250px; overflow: hidden; border-radius: 10px; margin: 10px 0; background: #eee; display: flex; align-items: center; justify-content: center; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.no-pending { text-align: center; padding: 40px; color: #666; font-style: italic; border: 2px dashed #ddd; border-radius: 15px; }
.error { color: #e74c3c; background: #fdeaea; padding: 10px; border-radius: 8px; margin-bottom: 20px; text-align: center; }

.buttons { display: flex; gap: 10px; margin-top: 15px; }
button { padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; }

.approve-btn { background: #2ecc71; color: white; flex: 1; }
.reject-btn { background: #e74c3c; color: white; flex: 1; }
.fix-btn { background: #3498db; color: white; }

button:hover { opacity: 0.8; transform: translateY(-2px); }
.fade-in { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>