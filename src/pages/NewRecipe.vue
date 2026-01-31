<template>
  <div class="new-recipe-page fade-in">
    <h2 class="page-title">🍲 Új recept hozzáadása</h2>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

    <div class="recipe-container">
      <!-- BAL OLDAL -->
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

      <!-- JOBB OLDAL -->
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
              placeholder="Hozzávaló neve"
              class="input-field ingredient-name"
            />
            
            <input
              v-model="ingredient.quantity"
              placeholder="Mennyiség"
              class="input-field ingredient-quantity"
              @input="sanitizeQuantity(ingredient)"
            />
            
            <select v-model="ingredient.unit" class="select-field ingredient-unit">
              <option disabled value="">Egység</option>
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
            Még nincsenek hozzávalók. Kattints a "Hozzáadás" gombra!
          </div>
        </div>
      </div>
    </div>

    <!-- GOMBOK -->
    <div class="form-buttons">
      <button @click="cancel" class="cancel-btn">Mégse</button>
      <button @click="saveRecipe" class="save-btn">💾 Mentés</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_BASE = 'https://localhost:5150/api'

export default {
  name: 'NewRecipe',
  data() {
    return {
      recipe: {
        title: '',
        category: '',
        description: '',
        howToText: ''
      },
      ingredients: [],
      units: [
        'g',
        'dkg',
        'kg',
        'ml',
        'dl',
        'l',
        'db',
        'kk',
        'tk',
        'ek',
        'csipet'
      ],
      error: null,
      successMessage: null
    }
  },

  mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
    }
  },

  methods: {
    addIngredient() {
      this.ingredients.push({
        name: '',
        quantity: '',
        unit: ''
      })
    },

    removeIngredient(index) {
      this.ingredients.splice(index, 1)
    },

    sanitizeQuantity(ingredient) {
      // Csak számok, pont és vessző engedélyezése
      ingredient.quantity = ingredient.quantity.replace(/[^0-9.,]/g, '')
    },

    cancel() {
      this.$router.push('/profile')
    },

    async saveRecipe() {
      this.error = null
      this.successMessage = null

      const token = localStorage.getItem('token')
      if (!token) {
        this.error = 'A recept mentéséhez be kell jelentkezned!'
        return
      }

      // Validálás
      if (!this.recipe.title.trim()) {
        this.error = 'A recept neve kötelező!'
        return
      }

      if (!this.recipe.category) {
        this.error = 'A kategória kiválasztása kötelező!'
        return
      }

      if (!this.recipe.description.trim()) {
        this.error = 'A rövid leírás kötelező!'
        return
      }

      if (!this.recipe.howToText.trim()) {
        this.error = 'Az elkészítés menete kötelező!'
        return
      }

      if (this.ingredients.length === 0) {
        this.error = 'Legalább egy hozzávalót adj meg!'
        return
      }

      // Hozzávalók validálása
      for (let i = 0; i < this.ingredients.length; i++) {
        const ing = this.ingredients[i]
        if (!ing.name.trim()) {
          this.error = `A ${i + 1}. hozzávaló neve kötelező!`
          return
        }
        if (!ing.quantity) {
          this.error = `A ${i + 1}. hozzávaló mennyisége kötelező!`
          return
        }
        if (!ing.unit) {
          this.error = `A ${i + 1}. hozzávaló mértékegysége kötelező!`
          return
        }
      }

      try {
        const payload = {
          title: this.recipe.title,
          category: this.recipe.category,
          description: this.recipe.description,
          howToText: this.recipe.howToText,
          ingredients: this.ingredients.map(ing => ({
            name: ing.name.trim(),
            quantity: parseFloat(ing.quantity.replace(',', '.')),
            unit: ing.unit
          }))
        }

        console.log('Küldött payload:', payload)

        const response = await axios.post(
          `${API_BASE}/Recipes`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        console.log('Backend válasz:', response.data)

        this.successMessage = '🎉 Recept sikeresen létrehozva!'
        
        // 1.5 másodperc múlva átirányítás a profil oldalra
        setTimeout(() => {
          this.$router.push('/profile')
        }, 1500)

      } catch (err) {
        console.error('Mentés hiba:', err)
        console.error('Error response:', err.response)
        
        if (err.response) {
          this.error = err.response.data?.message || 
                      err.response.data?.error || 
                      err.response.statusText || 
                      'Hiba a recept mentésekor.'
        } else {
          this.error = err.message || 'Nem sikerült a mentés.'
        }
      }
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.new-recipe-page {
  max-width: 1200px;
  margin: 60px auto;
  padding: 30px;
  background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
  color: #e67e22;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.error-message {
  color: #e74c3c;
  background: #fee;
  border: 2px solid #fcc;
  padding: 14px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
  animation: shake 0.5s;
}

.success-message {
  color: #27ae60;
  background: #efe;
  border: 2px solid #cfc;
  padding: 14px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
  animation: fadeIn 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.recipe-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

@media (max-width: 968px) {
  .recipe-container {
    grid-template-columns: 1fr;
  }
}

/* BAL OLDAL */
.left-section {
  background: rgba(255, 255, 255, 0.9);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.form-group {
  margin-bottom: 20px;
  margin-right: 30px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 0.95rem;
}

.input-field {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #ddd;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: white;
}

.input-field:focus {
  outline: none;
  border-color: #e67e22;
  box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1);
}

.select-field {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #ddd;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.select-field:focus {
  outline: none;
  border-color: #e67e22;
}

.textarea-field {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #ddd;
  font-size: 1rem;
  resize: none;
  font-family: inherit;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: white;
}

.textarea-field:focus {
  outline: none;
  border-color: #e67e22;
  box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1);
}

.textarea-field.short {
  min-height: 100px;
}

.textarea-field.tall {
  min-height: 200px;
}

/* JOBB OLDAL */
.right-section {
  background: rgba(255, 255, 255, 0.9);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
}

.ingredients-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e67e22;
  margin: 0;
}

.add-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(46, 204, 113, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 204, 113, 0.4);
}

.add-btn:active {
  transform: translateY(0);
}

.ingredients-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.ingredient-row {
  display: grid;
  grid-template-columns: 3fr 1.3fr 1.1fr auto;
  gap: 7px; /* Oszlopok özötti táv */
  margin-bottom: 16px; /* Soro közötti táv */
  align-items: center;
}

.ingredient-name {
  max-width: 450px;
}

.ingredient-quantity {
  max-width: 350px;
}

.ingredient-unit {
  max-width: 80px;
}

.ingredient-row .input-field {
  padding: 8px 10px;
  font-size: 0.95rem;
  height: 38px;
}

.ingredient-row .select-field {
  padding: 8px 10px;
  font-size: 0.95rem;
  height: 38px;
}

.ingredient-row .input-field,
.ingredient-row .select-field {
  padding: 10px; /* Kisebb padding a kompaktabb megjelenésért */
}

.remove-btn {
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3);
  font-size: 1.1rem;
  min-width: 40px;
}

.remove-btn:active {
  transform: scale(0.95);
}

.empty-state {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 40px 20px;
}

/* GOMBOK ALSÓ SOR */
.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 10px;
}

.cancel-btn {
  padding: 12px 24px;
  border-radius: 10px;
  border: 2px solid #95a5a6;
  background: white;
  color: #555;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.cancel-btn:hover {
  background: #ecf0f1;
  border-color: #7f8c8d;
  transform: translateY(-2px);
}

.save-btn {
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #FF8C00 0%, #FFD700 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.3);
  font-size: 1rem;
}

.save-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 140, 0, 0.4);
}

.save-btn:active {
  transform: translateY(-1px);
}

/* ANIMÁCIÓK */
.fade-in {
  animation: fadeIn 0.6s ease forwards;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
</style>