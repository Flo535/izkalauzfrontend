<template>
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
</template>

<script>
import SidebarLayout from '@/components/Layout/SidebarLayout.vue'

export default {
  name: 'RecipeDetails',
  components: {
    SidebarLayout
  },
  data() {
    return {
      recipe: null,
      loading: true,
      error: null
    }
  },
  mounted() {
    this.fetchRecipe()
  },
  methods: {
    async fetchRecipe() {
      try {
        const id = this.$route.params.id

        const response = await fetch(
          `https://localhost:5150/api/Recipes/${id}`
        )

        if (!response.ok) {
          throw new Error('Recept nem található')
        }

        this.recipe = await response.json()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    fullImagePath(path) {
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`
    },
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

/* Cím */
.title {
  font-size: 2rem;
  margin-bottom: 10px;
  background: linear-gradient(to right, #ff8c00, #ffbb33);
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
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
