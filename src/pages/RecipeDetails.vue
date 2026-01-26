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
  </div>
=======
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
    </div>
>>>>>>> dc98102161dde86b905120db2bbda4391ad41a24
</template>

<script>
import SidebarLayout from '@/components/Layout/SidebarLayout.vue'

export default {
  name: 'RecipeDetails',
<<<<<<< HEAD
  components: { SidebarLayout },
=======
  components: {
    SidebarLayout
  },
>>>>>>> dc98102161dde86b905120db2bbda4391ad41a24
  data() {
    return {
      recipe: null,
      loading: true,
<<<<<<< HEAD
      error: null,
      selectedFile: null,
      isAdmin: false
=======
      error: null
>>>>>>> dc98102161dde86b905120db2bbda4391ad41a24
    }
  },
  mounted() {
    this.fetchRecipe()
<<<<<<< HEAD
    this.checkAdmin()
=======
>>>>>>> dc98102161dde86b905120db2bbda4391ad41a24
  },
  methods: {
    async fetchRecipe() {
      try {
        const id = this.$route.params.id
<<<<<<< HEAD
        const response = await fetch(`https://localhost:5150/api/Recipes/${id}`)
        if (!response.ok) throw new Error('Recept nem található')
=======

        const response = await fetch(
          `https://localhost:5150/api/Recipes/${id}`
        )

        if (!response.ok) {
          throw new Error('Recept nem található')
        }

>>>>>>> dc98102161dde86b905120db2bbda4391ad41a24
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
        this.isAdmin = false
      }
    },

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

      try {
        const response = await fetch(`https://localhost:5150/api/Recipes/${this.recipe.id}/image`, {
          method: 'POST',
          body: formData,
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })

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
        alert('Hiba a feltöltés során.')
      }
    },

    fullImagePath(path) {
    return `https://localhost:5150/${path.replace(/\\/g, '/')}`;
    },

=======
    fullImagePath(path) {
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`
    },
>>>>>>> dc98102161dde86b905120db2bbda4391ad41a24
    formattedDate(date) {
      return new Date(date).toLocaleDateString('hu-HU')
    }
  }
}
</script>

<style scoped>
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

<<<<<<< HEAD
/* Admin feltöltés */
.upload-section {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

=======
>>>>>>> dc98102161dde86b905120db2bbda4391ad41a24
/* Cím */
.title {
  font-size: 2rem;
  margin-bottom: 10px;
  background: linear-gradient(to right, #ff8c00, #ffbb33);
<<<<<<< HEAD
  background-clip: text;
=======
>>>>>>> dc98102161dde86b905120db2bbda4391ad41a24
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

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
@keyframes fadeIn {
<<<<<<< HEAD
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
=======
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
>>>>>>> dc98102161dde86b905120db2bbda4391ad41a24
}
</style>
