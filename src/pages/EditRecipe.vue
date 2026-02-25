<template>
  <div class="edit-recipe-page fade-in">
    <h2 class="page-title">✏️ Recept szerkesztése</h2>
    
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    
    <div v-if="loading" class="loading-box">
      <div class="spinner"></div>
      <p>Recept betöltése...</p>
    </div>

    <div v-else class="recipe-container">
      <div class="left-section">
        <div class="form-group">
          <label>Recept neve:</label>
          <input v-model="recipe.title" class="input-field" placeholder="Pl. Marhapörkölt"/>
        </div>
        
        <div class="form-group">
          <label>Kategória:</label>
          <select v-model="recipe.category" class="select-field">
            <option>Leves</option>
            <option>Főétel</option>
            <option>Desszert</option>
            <option>Egyéb</option>
          </select>
        </div>

        <div class="form-group">
          <label>Rövid leírás:</label>
          <textarea v-model="recipe.description" class="textarea-field short"></textarea>
        </div>

        <div class="form-group">
          <label>Elkészítés menete:</label>
          <textarea v-model="recipe.howToText" class="textarea-field tall"></textarea>
        </div>

        <div class="form-group">
          <label>Fotó cseréje:</label>
          <input type="file" @change="onFileChange" accept="image/*" class="file-input" />
        </div>
      </div>

      <div class="right-section">
        <div class="ingredients-header">
          <h3>Hozzávalók</h3>
          <button @click="addIngredient" class="add-btn" title="Új hozzávaló">➕</button>
        </div>
        
        <div class="ingredients-list">
          <div v-for="(ing, idx) in ingredients" :key="idx" class="ingredient-row">
            <input v-model="ing.name" placeholder="Név" class="ing-name"/>
            <input v-model="ing.quantity" placeholder="Menny." class="ing-qty"/>
            <select v-model="ing.unit" class="ing-unit">
              <option v-for="u in units" :key="u">{{u}}</option>
            </select>
            <button @click="removeIngredient(idx)" class="remove-btn">✕</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading" class="action-bar">
      <button @click="goBack" class="btn-secondary">🔙 Mégse / Vissza</button>
      <button @click="saveRecipe" class="btn-primary" :disabled="saving">
        {{ saving ? '⌛ Mentés...' : '💾 Módosítások mentése' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { authState } from '@/auth.js'

export default {
  data() {
    return {
      recipe: { id: '', title: '', category: '', description: '', howToText: '', imagePath: '' },
      ingredients: [],
      imageFile: null,
      units: ['g', 'dkg', 'kg', 'ml', 'dl', 'l', 'db', 'kk', 'tk', 'ek', 'csipet'],
      loading: true,
      saving: false,
      error: null,
      successMessage: null
    }
  },
  async mounted() {
    await this.fetchRecipe();
  },
  methods: {
    async fetchRecipe() {
      try {
        const id = this.$route.params.id;
        const res = await axios.get(`https://localhost:5150/api/Recipes/${id}`);
        this.recipe = res.data;
        this.ingredients = (res.data.ingredients || []).map(i => ({
          ...i,
          quantity: i.quantity ? i.quantity.toString() : ''
        }));
      } catch (err) {
        this.error = "Nem sikerült betölteni a receptet.";
      } finally {
        this.loading = false;
      }
    },
    onFileChange(e) { this.imageFile = e.target.files[0]; },
    addIngredient() { this.ingredients.push({ name: '', quantity: '', unit: 'g' }); },
    removeIngredient(idx) { this.ingredients.splice(idx, 1); },
    goBack() {
      // Visszaviszünk az admin főoldalra, ahol a listák vannak
      this.$router.push('/admin'); 
    },
    async saveRecipe() {
      this.saving = true;
      this.error = null;
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('jwt');
        const formData = new FormData();
        
        formData.append('title', this.recipe.title);
        formData.append('category', this.recipe.category);
        formData.append('description', this.recipe.description);
        formData.append('howToText', this.recipe.howToText);

        const cleanedIngs = this.ingredients
          .filter(i => i.name.trim() !== '')
          .map(i => ({
            name: i.name,
            quantity: parseFloat(i.quantity.toString().replace(',', '.')) || 0,
            unit: i.unit
          }));
        formData.append('ingredientsJson', JSON.stringify(cleanedIngs));

        if (this.imageFile) formData.append('image', this.imageFile);

        await axios.put(`https://localhost:5150/api/Recipes/${this.recipe.id}`, formData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          }
        });

        this.successMessage = "✅ Recept sikeresen frissítve!";
        // 2 másodperc múlva visszairányítunk az adminra
        setTimeout(() => this.goBack(), 2000);
      } catch (err) {
        this.error = "Szerver hiba a mentés során.";
        console.error(err);
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>

<style scoped>
.edit-recipe-page { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
.recipe-container { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
.left-section, .right-section { background: white; padding: 25px; border-radius: 12px; border: 1px solid #eee; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 8px; color: #444; }
.input-field, .select-field, .textarea-field { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
.textarea-field.short { height: 80px; }
.textarea-field.tall { height: 250px; }
.ingredient-row { display: flex; gap: 10px; margin-bottom: 10px; }
.ing-name { flex: 3; padding: 8px; border: 1px solid #ddd; border-radius: 5px; }
.ing-qty { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 5px; }
.ing-unit { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 5px; }
.action-bar { margin-top: 30px; display: flex; justify-content: center; gap: 20px; }
.btn-primary { background: #27ae60; color: white; padding: 15px 40px; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: bold; }
.btn-secondary { background: #7f8c8d; color: white; padding: 15px 40px; border: none; border-radius: 10px; cursor: pointer; }
.error-message { color: #e74c3c; background: #fdf2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; }
.success-message { color: #27ae60; background: #f2fdf5; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; }
.remove-btn { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 18px; }
.add-btn { background: #3498db; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; }
</style>