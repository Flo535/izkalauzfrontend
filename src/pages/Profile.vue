<template>
  <div class="profile-page fade-in">
    <!-- Címsor -->
    
    <div class="profile-header">Saját receptjeim:</div>


  
   <!-- Kereső és új recept gomb konténer -->
<div class="flex flex-col items-end mb-6 space-y-2">
  <!-- Keresőmező -->
  <input v-model="searchTerm"
         placeholder="Keresés a receptek között"
         class="search-input w-64 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300" />

  <!-- Új recept gomb -->
  <button class="add-button bg-green-200 text-green-900 font-semibold py-2 px-4 rounded-lg hover:bg-green-300 transition-colors"
          @click="showModal = true">
    Új recept hozzáadása
  </button>
</div>






    <!-- Recept lista -->
    <div class="recipe-list">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-header">
          <div class="icon-circle">🍽️</div>
          <h4 class="recipe-title">{{ recipe.title }}</h4>
        </div>
        <p class="recipe-description">{{ recipe.description }}</p>
        <div class="ingredients-container">
          <p class="ingredients"><strong>Hozzávalók:</strong></p>
          <div class="ingredients-scroll">
            {{ recipe.ingredients.join(', ') }}
          </div>
        </div>
        <div class="card-buttons">
          <button class="edit-btn" @click="editRecipe(recipe)">Szerkesztés</button>
          <button class="delete-btn" @click="deleteRecipe(recipe.id)">Törlés</button>
        </div>
        <div class="author-info">
          <div class="author-icon">👤</div>
          <div class="author-email">{{ recipe.authorEmail }}</div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
      <div class="modal">
        <h3 class="text-xl font-semibold mb-4">Új recept hozzáadása</h3>
        <input v-model="newRecipe.title" placeholder="Cím" class="modal-input" />
        <textarea v-model="newRecipe.description" placeholder="Leírás" class="modal-textarea"></textarea>
        <input v-model="newRecipe.ingredients" placeholder="Hozzávalók (vesszővel)" class="modal-input" />
        <div class="modal-buttons">
          <button class="save-btn" @click="addRecipe">Mentés</button>
          <button class="cancel-btn" @click="showModal=false">Mégse</button>
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
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        this.userEmail = payload.email || ''
      } catch (err) { console.warn('JWT decode error:', err) }
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
        if (!token) return this.$router.push('/login')

        const res = await axios.get('https://localhost:5150/api/Recipes/my', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.myRecipes = res.data
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        } else this.error = err.response?.data?.message || 'Hiba a receptek lekérésekor.'
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
        this.updateRecipe(recipe.id, newTitle, newDesc, newIngr.split(',').map(i=>i.trim()).filter(i=>i))
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
        await axios.delete(`https://localhost:5150/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.myRecipes = this.myRecipes.filter(r => r.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a recept törlésekor.'
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 80px auto;
  padding: 0 20px;
}
.profile-header {
  font-size: 1.75rem; /* nagyobb méret, mint a többi szöveg */
  font-weight: bold;
  background: linear-gradient(to right, #4CAF50, #81C784); /* erősebb zöld átmenet */
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 15px;
}

/* Fade-in */
.fade-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from {opacity:0; transform:translateY(5px);} to {opacity:1; transform:translateY(0);} }

/* Címsorok */
.title-gradient {
  background: linear-gradient(to right, #ff9c3b, #b7e4c7);
  -webkit-background-clip: text;
  color: transparent;
}
.my-recipes-title {
  background: linear-gradient(to right, #4CAF50, #a8e6cf);
  -webkit-background-clip: text;
  color: transparent;
}

/* Top controls */
.top-controls { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.search-input { width:250px; padding:6px 10px; border-radius:6px; border:1px solid #ccc; }
.add-button { background:#c5e1a5; border:none; border-radius:6px; padding:6px 12px; cursor:pointer; }

/* Recipe List */
.recipe-list { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }
.recipe-card {
  background: linear-gradient(to bottom, #dcedc1, #a8e6cf);
  padding:16px;
  border-radius:12px;
  box-shadow:0 2px 6px rgba(0,0,0,0.1);
  display:flex; flex-direction:column;
  transition:0.25s ease;
  max-height:400px;
  overflow:hidden;
}
.recipe-card:hover { transform:translateY(-4px); box-shadow:0 6px 12px rgba(0,0,0,0.15); }

/* Header */
.recipe-header { display:flex; align-items:center; margin-bottom:8px; }
.icon-circle { font-size:24px; margin-right:10px; }

/* Title */
.recipe-title { font-weight:bold; font-size:1.1rem; }

/* Description */
.recipe-description { flex:1; overflow:auto; max-height:80px; margin-bottom:8px; }

/* Ingredients scroll */
.ingredients-container { margin-bottom:8px; }
.ingredients-scroll { max-height:60px; overflow-y:auto; padding:4px; background:rgba(255,255,255,0.3); border-radius:6px; }

/* Card buttons */
.card-buttons { display:flex; justify-content:flex-end; gap:8px; margin-bottom:8px; }
.edit-btn { background:#c5e1a5; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; }
.delete-btn { background:#ffcc80; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; }

/* Author */
.author-info { display:flex; align-items:center; margin-top:auto; font-size:0.9rem; color:#555; }
.author-icon { margin-right:6px; }
.author-email { word-break:break-all; }

.modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
.modal { background:#fff; padding:20px; border-radius:10px; max-width:400px; width:90%; }
.modal-input, .modal-textarea { display:block; width:100%; margin:5px 0; padding:5px; }
.modal-buttons { display:flex; justify-content:flex-end; gap:10px; margin-top:10px; }
.save-btn { background:#4caf50; color:#fff; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; }
.cancel-btn { background:#ffb74d; color:#fff; border:none; border-radius:4px; padding:4px 8px; cursor:pointer; }
</style>
