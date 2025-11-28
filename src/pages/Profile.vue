<template>
  <div class="profile-page fade-in">
    <!-- Saját receptjeim felirat -->
    <h2 class="my-recipes-title">Saját receptjeim:</h2>

    <!-- Bal oldali controls: gomb + kereső -->
    <div class="controls-left">
      <button class="add-button" @click="showModal = true">Új recept hozzáadása</button>
      <input v-model="searchTerm" placeholder="Keresés a receptek között" class="search-input" />
    </div>

    <!-- Hibaüzenet -->
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="filteredRecipes.length === 0 && !error" class="text-center text-gray-500">Nincs megjeleníthető recept.</div>

    <!-- Recept lista -->
    <div class="recipe-list">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <div class="icon-circle">🍽️</div>
        <h4 class="recipe-title">{{ recipe.title }}</h4>
        <p class="recipe-description">{{ recipe.description }}</p>

        <!-- Scroll a hozzávalókhoz -->
        <div class="ingredients-scroll">
          <p class="ingredients"><strong>Hozzávalók:</strong> {{ recipe.ingredients.join(', ') }}</p>
        </div>

        <!-- Szerző -->
        <div class="author-info">
          <span class="author-icon">👤</span>
          <span class="author-email">{{ recipe.authorEmail }}</span>
        </div>

        <!-- Gombok -->
        <div class="card-buttons">
          <button class="edit-btn" @click="editRecipe(recipe)">Szerkesztés</button>
          <button class="delete-btn" @click="deleteRecipe(recipe.id)">Törlés</button>
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
      } catch (err) {
        console.warn('JWT decode error:', err)
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

/* Saját receptjeim */
.my-recipes-title {
  font-size: 1.75rem;
  font-weight: bold;
  background: linear-gradient(to right, #4caf50, #a3d9a5);
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 16px;
}

/* Bal oldali controls */
.controls-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
}

.search-input {
  width: 200px;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.add-button {
  padding: 8px 12px;
  border-radius: 5px;
  background-color: #a3d9a5; /* halvány zöld */
  border: none;
  cursor: pointer;
  color: #fff;
  font-weight: 500;
}

/* Recept lista */
.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.recipe-card {
  background: linear-gradient(to bottom right, #d4edc8, #f9fdf7); /* halvány zöld → alul majdnem fehér */
  padding: 18px;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  position: relative;
  transition: 0.25s ease;
  overflow: hidden;
  
  /* egységes méret */
  height: 300px;  /* fix magasság */
  display: flex;
  flex-direction: column;
}

.recipe-description {
  flex: 1; /* a leírás kitölti a fennmaradó helyet */
  overflow-y: auto; /* scroll, ha hosszú a szöveg */
  margin: 10px 0;
  padding-right: 5px; /* scroll miatt */
}

.ingredients {
  font-size: 0.9rem;
  overflow-y: auto; /* ha sok hozzávaló, scroll */
  max-height: 50px;
  margin-top: 5px;
}

/* hover animáció megmarad */
.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}


.icon-circle {
  font-size: 24px;
  color: white;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 10px;
}

.recipe-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.recipe-description {
  margin-bottom: 8px;
}



.author-info {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #555;
  margin-top: 10px;
}

.author-icon {
  margin-right: 5px;
}

.card-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.edit-btn {
  background-color: #a3d9a5; /* halvány zöld */
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  color: white;
}

.delete-btn {
  background-color: #ffc107; /* halvány narancs */
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  color: white;
}

/* Fade-in animáció */
.fade-in {
  animation: fadeIn 0.5s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Modal */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff; padding: 20px; border-radius: 10px; max-width: 400px; width: 90%;
}
.modal-input, .modal-textarea { display: block; width: 100%; margin: 5px 0; padding: 5px; }
.modal-buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
</style>
