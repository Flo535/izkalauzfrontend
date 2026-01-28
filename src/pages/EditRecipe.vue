<template>
  <div class="edit-recipe-page fade-in">
    <h2 class="page-title">Recept szerkesztése</h2>

    <div v-if="error" class="error">{{ error }}</div>

    <input v-model="recipe.title" placeholder="Cím" class="input-field" />
    <textarea v-model="recipe.description" placeholder="Leírás" class="textarea-field"></textarea>
    <textarea v-model="recipe.howToText" placeholder="Elkészítés menete" class="textarea-field"></textarea>
    <input v-model="ingredientsText" placeholder="Hozzávalók (vesszővel)" class="input-field" />

    <div class="buttons">
      <button class="save-btn" @click="saveRecipe">Mentés</button>
      <button class="cancel-btn" @click="$router.push('/profile')">Mégse</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      recipe: {
        title: '',
        description: '',
        howToText: '',
        ingredients: []
      },
      error: null
    }
  },
  computed: {
    ingredientsText: {
      get() {
        return this.recipe.ingredients.join(', ')
      },
      set(value) {
        this.recipe.ingredients = value.split(',').map(i => i.trim()).filter(i => i)
      }
    }
  },
  async mounted() {
    const id = this.$route.params.id
    const token = localStorage.getItem('token')
    if (!token) return this.$router.push('/login')

    try {
      const res = await axios.get(`https://localhost:5150/api/Recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      this.recipe = res.data
    } catch (err) {
      this.error = err.response?.data?.message || 'Hiba a recept betöltésekor.'
    }
  },
  methods: {
    async saveRecipe() {
      const token = localStorage.getItem('token')
      try {
        const payload = {
          title: this.recipe.title,
          description: this.recipe.description,
          howToText: this.recipe.howToText,
          ingredients: this.recipe.ingredients
        }

        await axios.put(
          `https://localhost:5150/api/Recipes/${this.$route.params.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        // sikeres mentés után vissza a profil oldalra
        this.$router.push('/profile')
      } catch (err) {
        // ide már a hiba üzenet ne jöjjön, csak ha tényleg rossz
        this.error = err.response?.data?.message || null
      }
    }
  }
}
</script>

<style scoped>
.edit-recipe-page {
  max-width: 600px;
  margin: 80px auto;
  padding: 0 20px;
}
.page-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; }
.input-field, .textarea-field { width: 100%; margin-bottom: 10px; padding: 8px; border-radius: 5px; border: 1px solid #ccc; }
.textarea-field { min-height: 80px; }
.buttons { display: flex; gap: 10px; margin-top: 10px; }
.save-btn { background: linear-gradient(to right, #FF8C00, #FFD700); border: none; padding: 8px 16px; border-radius: 5px; color: white; cursor: pointer; }
.cancel-btn { background: #ccc; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; }
.fade-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
