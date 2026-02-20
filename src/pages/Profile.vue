<template>
  <div class="profile-page fade-in">
    <h2 class="my-recipes-title">Saját receptjeim:</h2>

    <div class="controls-left">
<<<<<<< HEAD
=======
      <!-- Új recept oldalra navigáló gomb -->
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
      <button class="add-button" @click="$router.push({ name: 'NewRecipe' })">
        Új recept hozzáadása
      </button>
      <input v-model="searchTerm" placeholder="Keresés a receptek között" class="search-input" />
    </div>

<<<<<<< HEAD
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="myRecipes.length === 0 && !error" class="no-recipes">
      Nincs megjeleníthető recept. (Ellenőrizd, hogy az admin@izkalauz.hu címmel vagy-e bent!)
=======
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="filteredRecipes.length === 0 && !error" class="text-center text-gray-500">
      Nincs megjeleníthető recept.
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
    </div>

    <div class="recipe-list">
      <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
        <div class="recipe-image-wrapper">
<<<<<<< HEAD
          <img 
            v-if="recipe.imagePath" 
            :src="fullImagePath(recipe.imagePath)" 
            @error="onImageError"
            :alt="recipe.title" 
          />
=======
          <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" @error="onImageError" />
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
          <div v-else class="recipe-no-image">Nincs kép</div>
        </div>

        <h4 class="recipe-title">{{ recipe.title }}</h4>
        <p class="recipe-description">{{ recipe.description }}</p>

        <div class="ingredients-scroll">
<<<<<<< HEAD
          <p class="ingredients">
            <strong>Hozzávalók:</strong> {{ formatIngredients(recipe.ingredients) }}
          </p>
=======
          <p class="ingredients"><strong>Hozzávalók:</strong> {{ formatIngredients(recipe.ingredients) }}</p>
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
        </div>

        <div class="author-info">
          <span class="author-icon">👤</span>
          <span class="author-email">{{ recipe.authorEmail }}</span>
        </div>

        <div class="card-buttons">
          <button class="edit-btn" @click="editRecipe(recipe)">
            Szerkesztés
          </button>
          <button class="delete-btn" @click="deleteRecipe(recipe.id)">Törlés</button>
        </div>
      </div>
    </div>

<<<<<<< HEAD
    <div v-if="totalCount > pageSize" class="pagination">
=======
    <!-- LAPOZÓ -->
    <div class="pagination">
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
      <button @click="page--" :disabled="page === 1">⬅ Előző</button>
      <span>{{ page }} / {{ Math.ceil(totalCount / pageSize) }}</span>
      <button @click="page++" :disabled="page * pageSize >= totalCount">Következő ➡</button>
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
      page: 1,
      pageSize: 10,
<<<<<<< HEAD
      totalCount: 0
=======
      totalCount: 0,
      fetchDone: false
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
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
<<<<<<< HEAD
    this.extractUserEmail()
    await this.fetchRecipes()
=======
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
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
  },
  watch: {
    page() {
      this.fetchRecipes()
    }
  },
  methods: {
<<<<<<< HEAD
    extractUserEmail() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          this.userEmail = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || ''
        } catch (err) {
          console.warn('JWT decode error:', err)
        }
      }
    },
    // JAVÍTOTT: Ez a metódus biztosítja, hogy a sima user képe is betöltsön
    fullImagePath(path) {
      if (!path) return null
      if (path.startsWith('http')) return path
      
      // Levágjuk a mappákat (pl. uploads/recipes/), csak a fájlnevet tartjuk meg
      const fileName = path.replace(/\\/g, '/').split('/').pop()
      
      return `https://localhost:5150/Images/${fileName}`
    },
    onImageError(event) {
      // Megpróbáljuk egy alapértelmezett képre cserélni, ha nem találja az eredetit
      event.target.src = "https://localhost:5150/Images/default.jpg"
      
      // Ha az alapértelmezett kép sincs meg, akkor tüntetjük el a keretet
      event.target.onerror = () => {
        event.target.style.display = 'none'
        const wrapper = event.target.parentElement
        if (!wrapper.querySelector('.recipe-no-image')) {
          const noImageDiv = document.createElement('div')
          noImageDiv.className = 'recipe-no-image'
          noImageDiv.innerText = 'Nincs kép'
          wrapper.appendChild(noImageDiv)
        }
=======
    fullImagePath(path) {
      if (!path) return null
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`
    },
    onImageError(event) {
      event.target.style.display = 'none'
      const wrapper = event.target.parentElement
      if (!wrapper.querySelector('.recipe-no-image')) {
        const noImageDiv = document.createElement('div')
        noImageDiv.className = 'recipe-no-image'
        noImageDiv.innerText = 'Nincs kép'
        wrapper.appendChild(noImageDiv)
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
      }
    },
    formatIngredients(ingredients) {
      if (!ingredients || ingredients.length === 0) return 'Nincs megadva'
<<<<<<< HEAD
      return ingredients
        .map(ing => {
          if (typeof ing === 'string') return ing
          return `${ing.name} (${ing.quantity} ${ing.unit || ''})`
=======

      if (typeof ingredients[0] === 'string') {
        return ingredients.join(', ')
      }

      return ingredients
        .map(ing => {
          if (ing.name && ing.quantity && ing.unit) {
            return `${ing.name} (${ing.quantity} ${ing.unit})`
          }
          return ing.name || 'Ismeretlen'
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
        })
        .join(', ')
    },
    async fetchRecipes() {
      try {
        const token = localStorage.getItem('token')
<<<<<<< HEAD
        if (!token) {
          this.$router.push('/login')
          return
        }
=======
        if (!token) return this.$router.push('/login')
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40

        const res = await axios.get(
          `https://localhost:5150/api/Recipes/my?page=${this.page}&pageSize=${this.pageSize}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
<<<<<<< HEAD
        
        if (res.data.items) {
          this.myRecipes = res.data.items
          this.totalCount = res.data.totalCount
        } else {
          this.myRecipes = res.data
          this.totalCount = res.data.length
        }
      } catch (err) {
        console.error("Hiba:", err)
        if (err.response?.status === 401) {
          this.$router.push('/login')
        } else {
          this.error = 'Nem sikerült betölteni a receptjeidet.'
        }
=======
        this.myRecipes = res.data.items
        this.totalCount = res.data.totalCount
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          this.$router.push('/login')
        } else this.error = err.response?.data?.message || 'Hiba a receptek lekérésekor.'
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
      }
    },
    editRecipe(recipe) {
      this.$router.push({ name: 'EditRecipe', params: { id: recipe.id } })
    },
    async deleteRecipe(id) {
      if (!confirm('Biztos törlöd a receptet?')) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`https://localhost:5150/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
<<<<<<< HEAD
        this.fetchRecipes()
      } catch (err) {
        alert('Hiba a törléskor!')
=======
        this.myRecipes = this.myRecipes.filter(r => r.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a recept törlésekor.'
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
      }
    }
  }
}
</script>

<style scoped>
<<<<<<< HEAD
.profile-page { max-width: 1200px; margin: 80px auto; padding: 0 20px; }
.my-recipes-title { font-size: 1.75rem; font-weight: bold; background: linear-gradient(to right, #FF8C00, #FFD700); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 16px; }
.controls-left { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 20px; }
.search-input { width: 200px; padding: 8px; border-radius: 5px; border: 1px solid #ccc; }
.add-button { padding: 8px 12px; border-radius: 5px; border: none; cursor: pointer; font-weight: 500; color: #fff; background: linear-gradient(to right, #FF4500, #FFA500); transition: transform 0.2s ease; }
.error-message { color: red; margin: 10px 0; }
.no-recipes { text-align: center; color: #666; margin-top: 40px; font-style: italic; }
.recipe-list { display: flex; flex-wrap: wrap; gap: 20px; }
.recipe-card { flex: 0 0 calc(25% - 20px); min-width: 250px; height: 420px; display: flex; flex-direction: column; padding: 20px; border-radius: 16px; background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05)); box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.recipe-image-wrapper { width: 100%; height: 150px; overflow: hidden; border-radius: 10px; margin-bottom: 10px; background: #ddd; }
.recipe-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.recipe-title { font-weight: bold; margin: 10px 0; height: 40px; overflow: hidden; }
.recipe-description { font-size: 0.9rem; height: 50px; overflow-y: auto; margin-bottom: 10px; }
.ingredients-scroll { flex: 1; overflow-y: auto; font-size: 0.85rem; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 5px; }
.card-buttons { display: flex; gap: 10px; margin-top: 15px; }
.edit-btn, .delete-btn { flex: 1; padding: 8px; border-radius: 5px; border: none; color: white; cursor: pointer; font-weight: bold; }
.edit-btn { background: #ffc107; }
.delete-btn { background: #ff4757; }
.pagination { margin-top: 30px; display: flex; justify-content: center; align-items: center; gap: 15px; }
</style>
=======
.profile-page { 
  max-width: 1200px;  
  margin: 80px auto; 
  padding: 0 20px; 
}
.my-recipes-title {
  font-size: 1.75rem;
  font-weight: bold;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 16px;
}
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
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(to right, #FF4500, #FFA500);
  transition: transform 0.2s ease, filter 0.2s ease;
}
.add-button:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.recipe-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}
.recipe-card {
  flex: 0 0 20%;
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05));
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease, opacity 0.4s ease;
}
.recipe-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 20px rgba(0,0,0,0.2);
  filter: brightness(1.05);
}
.recipe-image-wrapper { 
  width: 100%; 
  height: 120px; 
  overflow: hidden; 
  border-radius: 10px; 
  margin-bottom: 10px; 
}
.recipe-image-wrapper img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}
.recipe-no-image { 
  width: 100%; 
  height: 120px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: #eee; 
  color: #888; 
  font-weight: bold; 
  border-radius: 10px; 
  margin-bottom: 10px; 
}
.recipe-title { font-weight: bold; margin-bottom: 8px; }
.recipe-description { flex: 1; overflow-y: auto; margin: 10px 0; padding-right: 5px; max-height: 60px; }
.ingredients-scroll { max-height: 50px; overflow-y: auto; }
.ingredients { font-size: 0.9rem; margin-top: 5px; }
.author-info { display: flex; align-items: center; font-size: 0.875rem; color: #555; margin-top: 10px; }
.author-icon { margin-right: 5px; }
.card-buttons { display: flex; gap: 10px; margin-top: 10px; }
.edit-btn { background: linear-gradient(to right, #FFD700, #FF8C00); border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; color: white; }
.delete-btn { background: linear-gradient(to right, #FF4500, #FFA500); border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; color: white; }

.fade-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
.pagination button { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; background: linear-gradient(to right, #FF8C00, #FFD700); color: white; font-weight: 500; }
.pagination button:disabled { background: #ccc; cursor: not-allowed; }
</style>
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
