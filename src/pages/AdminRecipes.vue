<template>
  <div class="admin-page">
    <h2>Jóváhagyásra váró receptek</h2>

    <div v-if="loading">⏳ Betöltés...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
      <h3>{{ recipe.title }}</h3>
      <p>{{ recipe.description }}</p>

      <div class="recipe-image-wrapper">
        <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" />
        <div v-else class="recipe-no-image">Nincs kép</div>
      </div>

      <p>Author: {{ recipe.authorId || 'Ismeretlen' }}</p>

      <div class="buttons">
        <button @click="approve(recipe.id)">✅ Jóváhagy</button>
        <button @click="reject(recipe.id)">❌ Elutasít</button>
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
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`
    },
    async fetchPending() {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Nem vagy bejelentkezve.')
        const config = { headers: { Authorization: `Bearer ${token}` } }

        const res = await axios.get('https://localhost:5150/api/Recipes/pending', config)
        this.recipes = res.data || []
      } catch (err) {
        this.error = err.response?.data || err.message
        this.recipes = []
      } finally {
        this.loading = false
      }
    },
    async approve(id) {
      await this.adminAction(id, 'approve')
    },
    async reject(id) {
      await this.adminAction(id, 'reject')
    },
    async adminAction(id, action) {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Nem vagy bejelentkezve.')
        const config = { headers: { Authorization: `Bearer ${token}` } }

        await axios.post(`https://localhost:5150/api/Recipes/${id}/${action}`, null, config)
        this.recipes = this.recipes.filter(r => r.id !== id) // frissíti a listát
      } catch (err) {
        alert(err.response?.data || err.message)
      }
    }
  }
}
</script>

<style scoped>
.admin-page { max-width: 800px; margin: auto; padding: 20px; }
.recipe-card { border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 10px; }
.recipe-image-wrapper { width: 100%; height: 150px; overflow: hidden; border-radius: 8px; margin-bottom: 10px; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.recipe-no-image { display: flex; justify-content: center; align-items: center; background: #eee; color: #888; font-weight: bold; height: 150px; }
.buttons { margin-top: 10px; }
button { margin-right: 8px; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; background: linear-gradient(to right, #FFA500, #FFD700); color: white; }
</style>
