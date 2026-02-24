<template>
  <div class="edit-recipe-page fade-in">
    <h2 class="page-title">✏️ Recept szerkesztése</h2>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="loading" class="loading">Betöltés...</div>

    <div v-if="!loading" class="recipe-container">
      <div class="left-section">
        <div class="form-group">
          <label>Recept neve:</label>
          <input 
            v-model="recipe.title" 
            placeholder="Recept címe" 
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label>Kategória:</label>
          <select v-model="recipe.category" class="select-field">
            <option disabled value="">Válassz kategóriát</option>
            <option>Leves</option>
            <option>Főétel</option>
            <option>Desszert</option>
          </select>
        </div>

        <div class="form-group">
          <label>Rövid leírás:</label>
          <textarea 
            v-model="recipe.description" 
            placeholder="Rövid leírás az ételről"
            class="textarea-field short"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Elkészítés menete:</label>
          <textarea 
            v-model="recipe.howToText" 
            placeholder="Lépésről lépésre..."
            class="textarea-field tall"
          ></textarea>
        </div>
      </div>

      <div class="right-section">
        <div class="ingredients-header">
          <h3 class="section-title">Hozzávalók</h3>
          <button @click="addIngredient" class="add-btn">
            ➕ Hozzáadás
          </button>
        </div>

        <div class="ingredients-list">
          <div 
            v-for="(ingredient, index) in ingredients" 
            :key="index"
            class="ingredient-row"
          >
            <input
              v-model="ingredient.name"
              placeholder="Név"
              class="input-field ingredient-name"
            />
            
            <input
              v-model="ingredient.quantity"
              placeholder="Menny."
              class="input-field ingredient-quantity"
              @input="sanitizeQuantity(ingredient)"
            />
            
            <select v-model="ingredient.unit" class="select-field ingredient-unit">
              <option v-for="(unit, i) in units" :key="i" :value="unit">
                {{ unit }}
              </option>
            </select>
            
            <button 
              @click="removeIngredient(index)" 
              class="remove-btn"
              title="Törlés"
            >
              ✕
            </button>
          </div>

          <div v-if="ingredients.length === 0" class="empty-state">
            Még nincsenek hozzávalók.
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="form-buttons">
      <button @click="cancel" class="cancel-btn">Mégse</button>
      <button @click="saveRecipe" class="save-btn">💾 Mentés</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { authState } from '@/auth.js' // Nagyon fontos az isAdmin ellenőrzéséhez!

const API_BASE = 'https://localhost:5150/api'

export default {
  name: 'EditRecipe',
  data() {
    return {
      recipe: {
        id: '',
        title: '',
        category: '',
        description: '',
        howToText: '',
        authorEmail: '', // Ezt is tároljuk a mentéshez
        status: ''
      },
      ingredients: [],
      units: ['g', 'dkg', 'kg', 'ml', 'dl', 'l', 'db', 'kk', 'tk', 'ek', 'csipet'],
      error: null,
      successMessage: null,
      loading: true
    }
  },

  computed: {
    isAdmin() {
      return authState.isAdmin;
    }
  },

  async mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
      return
    }
    await this.loadRecipe()
  },

  methods: {
    async loadRecipe() {
      const id = this.$route.params.id
      const token = localStorage.getItem('token')

      try {
        const res = await axios.get(`${API_BASE}/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        // Adatok feltöltése a válaszból
        this.recipe = {
          id: res.data.id,
          title: res.data.title,
          category: res.data.category,
          description: res.data.description,
          howToText: res.data.howToText,
          authorEmail: res.data.authorEmail,
          status: res.data.status
        }

        if (res.data.ingredients) {
          this.ingredients = res.data.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity.toString(),
            unit: ing.unit
          }))
        }

        this.loading = false
      } catch (err) {
        this.error = 'Hiba a recept betöltésekor. Lehet, hogy nincs jogosultságod?'
        this.loading = false
      }
    },

    addIngredient() {
      this.ingredients.push({ name: '', quantity: '', unit: 'g' })
    },

    removeIngredient(index) {
      this.ingredients.splice(index, 1)
    },

    sanitizeQuantity(ingredient) {
      ingredient.quantity = ingredient.quantity.replace(/[^0-9.,]/g, '')
    },

    cancel() {
      // Ha az Admin panelről jött, oda megy vissza
      if (this.isAdmin) {
        this.$router.push('/admin')
      } else {
        this.$router.push('/profile')
      }
    },

    async saveRecipe() {
      this.error = null
      this.successMessage = null
      const token = localStorage.getItem('token')

      // Alap validálás
      if (!this.recipe.title.trim() || !this.recipe.category || this.ingredients.length === 0) {
        this.error = 'Kérlek tölts ki minden kötelező mezőt és adj meg hozzávalókat!'
        return
      }

      try {
        const payload = {
          id: this.recipe.id,
          title: this.recipe.title,
          category: this.recipe.category,
          description: this.recipe.description,
          howToText: this.recipe.howToText,
          authorEmail: this.recipe.authorEmail, // Megtartjuk az eredeti szerzőt
          status: this.isAdmin ? this.recipe.status : 'Pending', // Admin mentésekor marad a státusz, Usernél újra jóváhagyandó lesz
          ingredients: this.ingredients.map(ing => ({
            name: ing.name.trim(),
            quantity: parseFloat(ing.quantity.replace(',', '.')),
            unit: ing.unit
          }))
        }

        await axios.put(
          `${API_BASE}/Recipes/${payload.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        this.successMessage = '🎉 Recept sikeresen frissítve!'
        
        setTimeout(() => {
          this.cancel()
        }, 1500)

      } catch (err) {
        console.error('Mentési hiba:', err)
        this.error = err.response?.data || 'Nem sikerült a mentés. Nincs jogosultságod?'
      }
    }
  }
}
</script>

<style scoped>
/* A stílus megegyezik a korábbiakkal a konzisztencia miatt */
.edit-recipe-page { max-width: 1200px; margin: 40px auto; padding: 20px; }
.recipe-container { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.left-section, .right-section { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

.form-group { margin-bottom: 15px; }
.input-field, .select-field, .textarea-field { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-top: 5px; }
.textarea-field.tall { min-height: 200px; }

.ingredient-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; }
.remove-btn { background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; }
.add-btn { background: #2ecc71; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }

.form-buttons { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
.save-btn { background: #e67e22; color: white; padding: 12px 25px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
.cancel-btn { background: #95a5a6; color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; }

.error-message { background: #ffeded; color: #d63031; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
.success-message { background: #e8f5e9; color: #2e7d32; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
</style>