<template>
  <div class="profile">
    <h2>Profil oldal</h2>
    <p v-if="userEmail">Üdvözlünk az Ízek világában, <strong>{{ userEmail }}</strong>!</p>

    <!-- Kereső -->
    <div class="search-bar">
      <input v-model="searchTerm" placeholder="Keresés a receptek között" />
    </div>

    <button @click="showModal = true">Új recept hozzáadása</button>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="filteredRecipes.length === 0 && !error">Nincs megjeleníthető recept.</div>

    <div class="recipes-container">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <h4>{{ recipe.title }}</h4>
        <p>{{ recipe.description }}</p>
        <p>Hozzávalók: {{ recipe.ingredients.join(', ') }}</p>
        <button @click="editRecipe(recipe)">Szerkesztés</button>
        <button @click="deleteRecipe(recipe.id)">Törlés</button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal">
        <h3>Új recept hozzáadása</h3>
        <input v-model="newRecipe.title" placeholder="Cím" />
        <textarea v-model="newRecipe.description" placeholder="Leírás"></textarea>
        <input v-model="newRecipe.ingredients" placeholder="Hozzávalók (vesszővel)" />
        <div class="modal-buttons">
          <button @click="addRecipe">Mentés</button>
          <button @click="showModal=false">Mégse</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      userEmail: '',
      myRecipes: [],
      searchTerm: '',
      error: null,
      showModal: false,
      newRecipe: { title: '', description: '', ingredients: '' },
      fetchDone: false
    }
  },
  computed: {
    filteredRecipes() {
      if (!this.searchTerm) return this.myRecipes
      return this.myRecipes.filter(r =>
        r.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    }
  },
  async mounted() {
    // Email kinyerése a JWT-ből
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        this.userEmail = payload.email || ''
      } catch (err) {
        console.warn('Nem sikerült dekódolni a JWT-t:', err)
      }
    }

    if (!this.fetchDone) {
      await this.fetchRecipes()
      this.fetchDone = true
    }
  },
  methods: {
    async fetchRecipes() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }
        const res = await axios.get('https://localhost:5150/api/Recipes/my', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.myRecipes = res.data
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        } else {
          this.error = err.response?.data?.message || 'Hiba a receptek lekérésekor.'
        }
      }
    },
    async addRecipe() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.post('https://localhost:5150/api/Recipes', {
          title: this.newRecipe.title,
          description: this.newRecipe.description,
          ingredients: this.newRecipe.ingredients.split(',').map(i => i.trim()).filter(i => i)
        }, { headers: { Authorization: `Bearer ${token}` } })
        this.myRecipes.push(res.data.recipe)
        this.newRecipe = { title: '', description: '', ingredients: '' }
        this.showModal = false
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a recept hozzáadásakor.'
      }
    },
    editRecipe(recipe) {
      const newTitle = prompt('Új cím:', recipe.title)
      const newDesc = prompt('Új leírás:', recipe.description)
      const newIngr = prompt('Új hozzávalók (vesszővel):', recipe.ingredients.join(', '))
      if (newTitle && newDesc && newIngr) {
        this.updateRecipe(recipe.id, newTitle, newDesc, newIngr.split(',').map(i => i.trim()).filter(i => i))
      }
    },
    async updateRecipe(id, title, description, ingredients) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.put(`https://localhost:5150/api/Recipes/${id}`, { title, description, ingredients }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const index = this.myRecipes.findIndex(r => r.id === id)
        if (index !== -1) this.myRecipes[index] = res.data.recipe
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a recept frissítésekor.'
      }
    },
    async deleteRecipe(id) {
      if (!confirm('Biztos törlöd a receptet?')) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`https://localhost:5150/api/Recipes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        this.myRecipes = this.myRecipes.filter(r => r.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a recept törlésekor.'
      }
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 100px auto 40px;
  padding: 0 10px;
  text-align: center;
}

.search-bar {
  width: 100%;
  margin: 15px 0;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.recipes-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recipe-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
  text-align: left;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

button { cursor: pointer; }

.error { color: red; margin-top: 10px; }

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff; padding: 20px; border-radius: 10px; max-width: 400px; width: 90%;
}

.modal input, .modal textarea { display: block; width: 100%; margin: 5px 0; padding: 5px; }
.modal-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
</style>
