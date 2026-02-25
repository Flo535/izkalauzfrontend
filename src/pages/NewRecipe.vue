<template>
  <div class="add-recipe-page fade-in">
    <h2 class="page-title">🍳 Új recept hozzáadása</h2>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

    <div class="recipe-container">
      <div class="left-section">
        <div class="form-group">
          <label>Recept neve:</label>
          <input v-model="recipe.title" placeholder="Pl. Rakott krumpli" class="input-field" />
        </div>

        <div class="form-group">
          <label>Kategória:</label>
          <select v-model="recipe.category" class="select-field">
            <option disabled value="">Válassz kategóriát</option>
            <option>Leves</option>
            <option>Főétel</option>
            <option>Desszert</option>
            <option>Egyéb</option>
          </select>
        </div>

        <div class="form-group">
          <label>Rövid leírás:</label>
          <textarea v-model="recipe.description" placeholder="Miről szól ez az étel?" class="textarea-field short"></textarea>
        </div>

        <div class="form-group">
          <label>Elkészítés menete:</label>
          <textarea v-model="recipe.howToText" placeholder="Lépésről lépésre..." class="textarea-field tall"></textarea>
        </div>

        <div class="form-group">
          <label>Kép feltöltése:</label>
          <input type="file" @change="handleFileUpload" class="file-input" accept="image/*" />
        </div>
      </div>

      <div class="right-section">
        <div class="ingredients-header">
          <h3 class="section-title">Hozzávalók</h3>
          <button @click="addIngredient" class="add-btn">➕ Hozzáadás</button>
        </div>

        <div class="ingredients-list">
          <div v-for="(ingredient, index) in ingredients" :key="index" class="ingredient-row">
            <input v-model="ingredient.name" placeholder="Név" class="input-field" />
            <input v-model="ingredient.quantity" placeholder="Menny." class="input-field" @input="sanitizeQuantity(ingredient)" />
            <select v-model="ingredient.unit" class="select-field">
              <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
            </select>
            <button @click="removeIngredient(index)" class="remove-btn">✕</button>
          </div>
          <div v-if="ingredients.length === 0" class="empty-state">Még nincsenek hozzávalók megadva.</div>
        </div>
      </div>
    </div>

    <div class="form-buttons">
      <button @click="cancel" class="cancel-btn">Mégse</button>
      <button @click="saveRecipe" class="save-btn">💾 Recept mentése</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE = 'https://localhost:5150/api';

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
      units: ['g', 'dkg', 'kg', 'ml', 'dl', 'l', 'db', 'kk', 'tk', 'ek', 'csipet'],
      error: null,
      successMessage: null
    };
  },
  methods: {
    addIngredient() {
      this.ingredients.push({ name: '', quantity: '', unit: 'g' });
    },
    removeIngredient(index) {
      this.ingredients.splice(index, 1);
    },
    sanitizeQuantity(ingredient) {
      ingredient.quantity = ingredient.quantity.replace(/[^0-9.,]/g, '');
    },
    handleFileUpload(event) {
      this.imageFile = event.target.files[0];
    },
    cancel() {
      this.$router.push('/profile');
    },
    async saveRecipe() {
      this.error = null;
      this.successMessage = null;

      // Validálás
      if (!this.recipe.title || !this.recipe.category || this.ingredients.length === 0) {
        this.error = "Kérlek töltsd ki a címet, a kategóriát és adj meg legalább egy hozzávalót!";
        return;
      }

      const formData = new FormData();
      // Alapadatok
      formData.append('title', this.recipe.title);
      formData.append('category', this.recipe.category);
      formData.append('description', this.recipe.description || '');
      formData.append('howToText', this.recipe.howToText || '');
      
      // Hozzávalók JSON-ként (a Backend ezt várja stringként)
      const formattedIngredients = this.ingredients.map(ing => ({
        name: ing.name.trim(),
        quantity: parseFloat(ing.quantity.toString().replace(',', '.')) || 0,
        unit: ing.unit
      }));
      formData.append('ingredientsJson', JSON.stringify(formattedIngredients));

      // Kép fájl
      if (this.imageFile) {
        formData.append('image', this.imageFile);
      }

      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_BASE}/Recipes`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        this.successMessage = "🎉 " + res.data.message;
        setTimeout(() => {
          this.$router.push('/profile');
        }, 2000);
      } catch (err) {
        console.error("Mentési hiba:", err);
        this.error = err.response?.data || "Hiba történt a mentés során. Ellenőrizd a szervert!";
      }
    }
  }
};
</script>

<style scoped>
.add-recipe-page { max-width: 1100px; margin: 30px auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.page-title { text-align: center; color: #2c3e50; margin-bottom: 30px; }
.recipe-container { display: flex; gap: 30px; flex-wrap: wrap; }
.left-section, .right-section { flex: 1; min-width: 300px; background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-weight: bold; margin-bottom: 8px; color: #34495e; }
.input-field, .select-field, .textarea-field { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
.textarea-field.short { height: 80px; }
.textarea-field.tall { height: 180px; }
.ingredients-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.ingredient-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; margin-bottom: 12px; }
.add-btn { background: #27ae60; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold; }
.remove-btn { background: #e74c3c; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; }
.form-buttons { display: flex; justify-content: center; gap: 20px; margin-top: 30px; }
.save-btn { background: #e67e22; color: white; padding: 15px 40px; border: none; border-radius: 30px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
.save-btn:hover { transform: scale(1.05); }
.cancel-btn { background: #bdc3c7; color: #2c3e50; padding: 15px 40px; border: none; border-radius: 30px; font-weight: bold; cursor: pointer; }
.error-message { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
.success-message { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
</style>