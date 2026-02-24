<template>
  <div class="admin-page fade-in">
    <div class="header-actions">
      <h2>Jóváhagyásra váró receptek</h2>
      <button @click="fixAllRecipes" class="fix-btn">🛠️ Összes régi recept jóváhagyása</button>
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
        <button @click="approve(recipe.id)" class="approve-btn">✅ Jóváhagy</button>
        <button @click="reject(recipe.id)" class="reject-btn">❌ Elutasít</button>
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
      // Javítva az elérési út kezelése
      const cleanPath = path.replace(/\\/g, '/')
      return `https://localhost:5150/${cleanPath}`
    },
    getAuthConfig() {
      // Nálad 'jwt' néven van a token a többi fájl alapján!
      const token = localStorage.getItem('jwt')
      if (!token) return null
      return { headers: { Authorization: `Bearer ${token}` } }
    },
    async fetchPending() {
      this.loading = true
      try {
        const config = this.getAuthConfig()
        if (!config) throw new Error('Nem vagy bejelentkezve.')

        const res = await axios.get('https://localhost:5150/api/Recipes/pending', config)
        this.recipes = res.data || []
      } catch (err) {
        this.error = "Hiba a receptek lekérésekor: " + (err.response?.data || err.message)
        this.recipes = []
      } finally {
        this.loading = false
      }
    },
    async approve(id) {
      try {
        const config = this.getAuthConfig()
        await axios.post(`https://localhost:5150/api/Recipes/${id}/approve`, null, config)
        this.recipes = this.recipes.filter(r => r.id !== id)
        alert('Recept sikeresen jóváhagyva!')
      } catch (err) {
        alert('Hiba a jóváhagyás során: ' + (err.response?.data?.message || err.message))
      }
    },
    async reject(id) {
      if (!confirm("Biztosan elutasítod és törlöd ezt a receptet?")) return
      try {
        const config = this.getAuthConfig()
        await axios.delete(`https://localhost:5150/api/Recipes/${id}`, config)
        this.recipes = this.recipes.filter(r => r.id !== id)
        alert('Recept elutasítva és törölve.')
      } catch (err) {
        alert('Hiba az elutasítás során.')
      }
    },
    // EZ A METÓDUS JAVÍTJA MEG AZ ADATBÁZISODAT
    async fixAllRecipes() {
      if (!confirm("Biztosan jóváhagyod az összes létező receptet az adatbázisban?")) return
      
      try {
        const config = this.getAuthConfig()
        // Lekérjük az összes receptet az admin végponton keresztül
        const res = await axios.get('https://localhost:5150/api/admin/recipes', config)
        const allRecipes = res.data

        for (const recipe of allRecipes) {
          if (recipe.status === "Pending") {
            // Itt a státusz-frissítő végpontot hívjuk meg
            await axios.put(`https://localhost:5150/api/admin/recipes/${recipe.id}/status`, 
              JSON.stringify("Approved"), 
              { ...config, headers: { ...config.headers, 'Content-Type': 'application/json' } }
            )
          }
        }
        alert("Siker! Most már minden receptnek látszódnia kell a főoldalon.")
        location.reload()
      } catch (err) {
        console.error(err)
        alert("Hiba a javítás során. Ellenőrizd a konzolt!")
      }
    }
  }
}
</script>

<style scoped>
.admin-page { max-width: 800px; margin: 40px auto; padding: 20px; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.recipe-card { border: none; padding: 20px; margin-bottom: 20px; border-radius: 15px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.recipe-image-wrapper { width: 100%; height: 200px; overflow: hidden; border-radius: 10px; margin: 10px 0; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.no-pending { text-align: center; padding: 40px; color: #666; font-style: italic; }
.error { color: #e74c3c; background: #fdeaea; padding: 10px; border-radius: 8px; margin-bottom: 20px; text-align: center; }

button { 
  padding: 10px 18px; 
  border: none; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: bold;
  transition: 0.3s;
}

.approve-btn { background: #2ecc71; color: white; margin-right: 10px; }
.reject-btn { background: #e74c3c; color: white; }
.fix-btn { background: #3498db; color: white; font-size: 0.8rem; }

button:hover { opacity: 0.8; transform: translateY(-2px); }

.fade-in { animation: fadeIn 0.5s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>