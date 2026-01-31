<template>
<<<<<<< HEAD
  <div v-if="loading" class="loading">
    ⏳ Recept betöltése...
  </div>

  <div v-else-if="error" class="error">
    ❌ {{ error }}
  </div>

  <div v-else class="recipe-details">
    <!-- Kép -->
    <div v-if="recipe.imagePath" class="image-wrapper">
      <img
        :src="fullImagePath(recipe.imagePath)"
        :alt="recipe.title"
      />
    </div>

    <!-- Admin-only feltöltő gomb -->
    <div v-if="isAdmin" class="upload-section">
      <input type="file" @change="handleFileChange" />
      <button @click="uploadImage">Feltöltés</button>
    </div>

    <!-- Cím -->
    <h1 class="title">
      {{ recipe.title }}
    </h1>

    <!-- Meta adatok -->
    <div class="meta">
      <span>👤 {{ recipe.authorEmail }}</span>
      <span>📅 {{ formattedDate(recipe.createdAt) }}</span>
    </div>

    <!-- Hozzávalók -->
    <section class="section">
      <h2>🧂 Hozzávalók</h2>
      <ul>
        <li v-for="(item, index) in recipe.ingredients" :key="index">
          {{ item }}
        </li>
      </ul>
    </section>

    <!-- Elkészítés -->
    <section class="section">
      <h2>📖 Elkészítés</h2>
      <p class="description">
        {{ recipe.howToText }}
      </p>
    </section>
=======
  <div class="recipe-page">
    <!-- Fent a Navbar marad, a Navbar komponenst amúgy a main App.vue-ben hívod -->

    <div v-if="loading" class="loading">⏳ Recept betöltése...</div>
    <div v-else-if="error" class="error">❌ {{ error }}</div>

    <div v-else class="recipe-details">
      <!-- Kép -->
      <div v-if="recipe.imagePath" class="image-wrapper">
        <img :src="fullImagePath(recipe.imagePath)" :alt="recipe.title" />
      </div>

      <!-- Admin feltöltés -->
      <div v-if="isAdmin" class="upload-section">
        <input type="file" @change="handleFileChange" />
        <button @click="uploadImage">Feltöltés</button>
      </div>

      <!-- Cím -->
      <h1 class="title">{{ recipe.title }}</h1>

      <!-- Meta adatok -->
      <div class="meta">
        <span>👤 {{ recipe.authorEmail }}</span>
        <span>📅 {{ formattedDate(recipe.createdAt) }}</span>
      </div>

      <!-- Hozzávalók -->
      <section class="section">
        <h2>🧂 Hozzávalók</h2>
        <ul>
          <li v-for="(item, index) in recipe.ingredients" :key="index">
            {{ formatIngredient(item) }}
          </li>
        </ul>
      </section>

      <!-- Elkészítés -->
      <section class="section">
        <h2>📖 Elkészítés</h2>
        <p class="description">{{ recipe.howToText }}</p>
      </section>
    </div>
>>>>>>> fce3b7e (David-update)
  </div>
</template>

<script>
<<<<<<< HEAD
import SidebarLayout from '@/components/Layout/SidebarLayout.vue'

export default {
  name: 'RecipeDetails',
  components: { SidebarLayout },
=======
export default {
  name: 'RecipeDetails',
>>>>>>> fce3b7e (David-update)
  data() {
    return {
      recipe: null,
      loading: true,
      error: null,
      selectedFile: null,
      isAdmin: false
    }
  },
  mounted() {
    this.fetchRecipe()
    this.checkAdmin()
  },
  methods: {
    async fetchRecipe() {
      try {
        const id = this.$route.params.id
        const response = await fetch(`https://localhost:5150/api/Recipes/${id}`)
        if (!response.ok) throw new Error('Recept nem található')
        this.recipe = await response.json()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

<<<<<<< HEAD
    checkAdmin() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.isAdmin = false
        return
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        // JWT claim a role-ra
        const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        this.isAdmin = roleClaim === 'Admin'
      } catch (err) {
        console.error('Hiba a JWT dekódolásakor:', err)
=======
    formatIngredient(item) {
      // Ha string, akkor egyszerűen visszaadjuk
      if (typeof item === 'string') return item
      
      // Ha objektum, akkor formázzuk
      if (item.name && item.quantity && item.unit) {
        return `${item.name} (${item.quantity} ${item.unit})`
      }
      
      return item.name || 'Ismeretlen'
    },

    checkAdmin() {
      const token = localStorage.getItem('token')
      if (!token) { this.isAdmin = false; return }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        this.isAdmin = roleClaim === 'Admin'
      } catch {
>>>>>>> fce3b7e (David-update)
        this.isAdmin = false
      }
    },

<<<<<<< HEAD
    handleFileChange(event) {
      this.selectedFile = event.target.files[0]
    },

    async uploadImage() {
      if (!this.selectedFile) {
        alert('Válassz ki egy fájlt!')
        return
      }

      const formData = new FormData()
      formData.append('file', this.selectedFile)

      const token = localStorage.getItem('token')

=======
    handleFileChange(e) { this.selectedFile = e.target.files[0] },

    async uploadImage() {
      if (!this.selectedFile) { alert('Válassz ki egy fájlt!'); return }
      const formData = new FormData()
      formData.append('file', this.selectedFile)
      const token = localStorage.getItem('token')
>>>>>>> fce3b7e (David-update)
      try {
        const response = await fetch(`https://localhost:5150/api/Recipes/${this.recipe.id}/image`, {
          method: 'POST',
          body: formData,
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
<<<<<<< HEAD

        if (!response.ok) {
          const errText = await response.text()
          alert('Hiba a feltöltésnél: ' + errText)
          return
        }

        const data = await response.json()
        this.recipe.imagePath = data.imagePath
        alert('Kép sikeresen feltöltve!')
      } catch (err) {
        console.error(err)
=======
        if (!response.ok) { alert('Hiba a feltöltésnél'); return }
        const data = await response.json()
        this.recipe.imagePath = data.imagePath
        alert('Kép sikeresen feltöltve!')
      } catch {
>>>>>>> fce3b7e (David-update)
        alert('Hiba a feltöltés során.')
      }
    },

<<<<<<< HEAD
    fullImagePath(path) {
    return `https://localhost:5150/${path.replace(/\\/g, '/')}`;
    },

    formattedDate(date) {
      return new Date(date).toLocaleDateString('hu-HU')
    }
=======
    fullImagePath(path) { return `https://localhost:5150/${path.replace(/\\/g,'/')}` },
    formattedDate(date) { return new Date(date).toLocaleDateString('hu-HU') }
>>>>>>> fce3b7e (David-update)
  }
}
</script>

<style scoped>
<<<<<<< HEAD
.recipe-details {
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease forwards;
}

/* Kép */
.image-wrapper {
  width: 100%;
  height: 280px;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 20px;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Admin feltöltés */
.upload-section {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

/* Cím */
=======
.recipe-page { padding: 20px; max-width: 900px; margin: 0 auto; }

.recipe-details { animation: fadeIn 0.5s ease forwards; }

.image-wrapper { width: 100%; height: 280px; overflow: hidden; border-radius: 16px; margin-bottom: 20px; }
.image-wrapper img { width: 100%; height: 100%; object-fit: cover; }

.upload-section { margin-bottom: 20px; display: flex; gap: 10px; }

>>>>>>> fce3b7e (David-update)
.title {
  font-size: 2rem;
  margin-bottom: 10px;
  background: linear-gradient(to right, #ff8c00, #ffbb33);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

<<<<<<< HEAD
/* Meta */
.meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 20px;
}

/* Szekció */
.section {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.section h2 {
  margin-bottom: 10px;
  color: #ff8c00;
}

/* Lista */
.section ul {
  padding-left: 20px;
}

.section li {
  margin-bottom: 6px;
}

/* Leírás */
.description {
  white-space: pre-wrap;
  line-height: 1.6;
}

/* States */
.loading,
.error {
  text-align: center;
  font-size: 1.2rem;
  padding: 40px;
}

/* Animáció */
=======
.meta { display: flex; gap: 20px; font-size: 0.9rem; color: #555; margin-bottom: 20px; }

.section { margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.1); }
.section h2 { margin-bottom: 10px; color: #ff8c00; }
.section ul { padding-left: 20px; }
.section li { margin-bottom: 6px; }

.description { white-space: pre-wrap; line-height: 1.6; }

.loading, .error { text-align: center; font-size: 1.2rem; padding: 40px; }

>>>>>>> fce3b7e (David-update)
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
<<<<<<< HEAD
=======

@media (max-width: 768px) {
  .recipe-page { padding: 15px; }
  .image-wrapper { height: 200px; }
}
>>>>>>> fce3b7e (David-update)
</style>
