<template>
  <div class="edit-page">

    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h2 class="page-title">Új recept hozzáadása</h2>
    </div>

    <!-- Üzenetek -->
    <div v-if="error" class="msg msg-error">{{ error }}</div>
    <div v-if="successMessage" class="msg msg-success">{{ successMessage }}</div>

    <!-- Form -->
    <div class="form-grid">

      <!-- Bal oszlop -->
      <div class="form-card">
        <h3 class="card-section-title">Alapadatok</h3>

        <div class="form-group">
          <label class="form-label">Recept neve</label>
          <input v-model="recipe.title" class="form-input" name="rNameText" placeholder="Pl. Rakott krumpli" />
        </div>

        <div class="form-group">
          <label class="form-label">Kategória</label>
          <select v-model="recipe.category" class="form-select" name="rCategorySelect">
            <option disabled value="">Válassz kategóriát...</option>
            <option>Leves</option>
            <option>Főétel</option>
            <option>Desszert</option>
            <option>Egyéb</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Rövid leírás</label>
          <textarea v-model="recipe.description" class="form-textarea short" name="rDescText" placeholder="Miről szól ez az étel?"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Elkészítés menete</label>
          <textarea v-model="recipe.howToText" class="form-textarea tall" name="rHowToText" placeholder="Lépésről lépésre..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Kép feltöltése</label>
          <label class="file-label">
            <input type="file" @change="handleFileUpload" accept="image/*" class="file-input-hidden" />
            <span class="file-btn">📎 Fájl kiválasztása</span>
            <span class="file-name">{{ imageFile ? imageFile.name : 'Nincs fájl kiválasztva' }}</span>
          </label>
        </div>
      </div>

      <!-- Jobb oszlop -->
      <div class="form-card">
        <div class="ingredients-header">
          <h3 class="card-section-title">Hozzávalók</h3>
          <button @click="addIngredient" class="btn-add-ing" name="ingAddBtn">+ Hozzáadás</button>
        </div>

        <div class="ingredients-list">
          <div v-if="ingredients.length === 0" class="no-ingredients">
            Még nincs hozzávaló. Kattints a + gombra!
          </div>
          <div v-for="(ingredient, index) in ingredients" :key="index" class="ingredient-row">
            <input v-model="ingredient.name" placeholder="Név" class="ing-input ing-name" name="ingNameText" />
            <input v-model="ingredient.quantity" placeholder="Mennyiség" class="ing-input ing-qty" name="ingQuantityText" @input="sanitizeQuantity(ingredient)" />
            <select v-model="ingredient.unit" class="ing-select" name="ingUnitSelect">
              <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
            </select>
            <button @click="removeIngredient(index)" class="btn-remove-ing" title="Törlés">✕</button>
          </div>
        </div>
      </div>

    </div>

    <!-- Gombok -->
    <div class="action-bar">
      <button @click="cancel" class="btn-secondary">← Mégse</button>
      <button @click="saveRecipe" class="btn-primary" name="recipeSaveBtn">💾 Recept mentése</button>
    </div>

  </div>
</template>

<script>
import axios from 'axios'

const API_BASE = 'https://localhost:5150/api'

export default {
  name: 'AddRecipe',

  data() {
    return {
      recipe: {
        title: '',
        category: '',
        description: '',
        howToText: ''
      },
      ingredients: [],
      imageFile: null,
      units: ['g', 'dkg', 'kg', 'ml', 'dl', 'l', 'db', 'kk', 'tk', 'ek', 'csipet', 'fej', 'gerezd'],
      error: null,
      successMessage: null
    }
  },

  methods: {
    addIngredient() {
      this.ingredients.push({ name: '', quantity: '', unit: 'g' })
    },

    removeIngredient(index) {
      this.ingredients.splice(index, 1)
    },

    sanitizeQuantity(ingredient) {
      ingredient.quantity = ingredient.quantity.replace(/[^0-9.,]/g, '')
    },

    handleFileUpload(event) {
      this.imageFile = event.target.files[0]
    },

    cancel() {
      this.$router.push('/profile')
    },

    async saveRecipe() {
      this.error = null
      this.successMessage = null

      if (!this.recipe.title || !this.recipe.category || this.ingredients.length === 0) {
        this.error = 'Kérlek töltsd ki a címet, a kategóriát és adj meg legalább egy hozzávalót!'
        return
      }

      const formData = new FormData()
      formData.append('title', this.recipe.title)
      formData.append('category', this.recipe.category)
      formData.append('description', this.recipe.description || '')
      formData.append('howToText', this.recipe.howToText || '')

      const formattedIngredients = this.ingredients.map(ing => ({
        name: ing.name.trim(),
        quantity: parseFloat(ing.quantity.toString().replace(',', '.')) || 0,
        unit: ing.unit
      }))
      formData.append('ingredientsJson', JSON.stringify(formattedIngredients))

      if (this.imageFile) formData.append('image', this.imageFile)

      try {
        const token = localStorage.getItem('token')
        const res = await axios.post(`${API_BASE}/Recipes`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })

        this.successMessage = '🎉 ' + res.data.message
        setTimeout(() => this.$router.push('/profile'), 2000)
      } catch (err) {
        console.error('Mentési hiba:', err)
        this.error = err.response?.data || 'Hiba történt a mentés során. Ellenőrizd a szervert!'
      }
    }
  }
}
</script>

<style scoped>
/* ── Oldal ── */
.edit-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}

/* ── Fejléc ── */
.page-header {
  text-align: center;
  margin-bottom: 36px;
}

.page-label {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #FF8C00;
  font-weight: 600;
  margin-bottom: 8px;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ── Üzenetek ── */
.msg {
  padding: 13px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
}

.msg-error {
  background: #fee;
  border: 1.5px solid #fcc;
  color: #e74c3c;
}

.msg-success {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  color: #16a34a;
}

/* ── Form grid ── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  align-items: stretch;
  min-width: 0;
}

/* ── Kártya ── */
.form-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e8e8e4;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.card-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 22px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e8e8e4;
}

/* ── Form elemek ── */
.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 7px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.9rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  background: #fff;
}

.form-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-color: #f5f5f3;
  padding-right: 36px;
  cursor: pointer;
}

.form-textarea {
  resize: none;
  line-height: 1.6;
}

.form-textarea.short { height: 90px; }
.form-textarea.tall  { height: 260px; }

/* ── Fájl input ── */
.file-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.file-input-hidden {
  display: none;
}

.file-btn {
  font-size: 0.83rem;
  font-weight: 500;
  padding: 9px 16px;
  border-radius: 50px;
  border: 1.5px solid #dddad4;
  background: #f5f5f3;
  color: #555;
  white-space: nowrap;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.file-label:hover .file-btn {
  border-color: #FF8C00;
  color: #FF8C00;
}

.file-name {
  font-size: 0.82rem;
  color: #aaa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Hozzávalók ── */
.ingredients-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e8e8e4;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-add-ing {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 50px;
  border: none;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-add-ing:hover {
  background: #FF8C00;
}

.no-ingredients {
  text-align: center;
  color: #ccc;
  font-size: 0.875rem;
  padding: 32px 0;
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-x: auto;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e0ddd8 transparent;
  flex: 1;
  -webkit-overflow-scrolling: touch;
}

.ingredients-list::-webkit-scrollbar { width: 4px; }
.ingredients-list::-webkit-scrollbar-thumb { background: #e0ddd8; border-radius: 4px; }

.ingredient-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ing-input,
.ing-select {
  padding: 9px 12px;
  border-radius: 10px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.85rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
}

.ing-input:focus,
.ing-select:focus {
  border-color: #FF8C00;
  background: #fff;
}

.ing-name { flex: 7; }
.ing-qty  { flex: 1.5; }

.ing-select {
  flex: 2;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-color: #f5f5f3;
  padding-right: 28px;
}

.btn-remove-ing {
  flex-shrink: 0;
  border: 1.5px solid #fcc;
  background: #fff0f0;
  color: #e74c3c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 50px;
  font-size: 0.78rem;
  font-weight: 600;
  transition: background 0.2s ease;
  width: auto;
}

.btn-remove-ing:hover {
  background: #ffe0e0;
}

/* ── Action bar ── */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-primary {
  background: #1a1a1a;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.btn-primary:hover {
  background: #FF8C00;
  box-shadow: 0 4px 14px rgba(255, 140, 0, 0.3);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: #666;
  border: 1.5px solid #dddad4;
}

.btn-secondary:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
  transform: translateY(-1px);
}

/* ── Reszponzív ── */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .form-card {
    padding: 20px;
  }

  .form-textarea.tall {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .ingredient-row {
    flex-wrap: nowrap;
    min-width: 520px;
    gap: 5px;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-secondary {
    text-align: center;
    justify-content: center;
  }
}
</style>