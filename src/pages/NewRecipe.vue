<template>
  <div class="new-recipe-page fade-in">
    <h2 class="page-title">🍲 Új recept hozzáadása</h2>

    <div v-if="error" class="error-message"><strong>Hiba:</strong> {{ error }}</div>
    
    <div v-if="successMessage" class="success-box">
      <div class="success-content">
        <span class="check-icon">✔</span>
        <h3>{{ successMessage }}</h3>
        <p>A receptet rögzítettük. Hamarosan látható lesz az oldalon!</p>
        <p class="status-info">Állapot: <strong>Elbírálás alatt</strong></p>
      </div>
    </div>

    <div v-if="!successMessage" class="recipe-container" :class="{ 'loading-opacity': saving }">
      <div class="left-section">
        <div class="form-group">
          <label>Recept neve:</label>
          <input v-model="recipe.title" :disabled="saving" placeholder="Recept címe" class="input-field" />
        </div>

        <div class="form-group">
          <label>Kategória:</label>
          <select v-model="recipe.category" :disabled="saving" class="select-field">
            <option disabled value="">Válassz kategóriát</option>
            <option>Leves</option>
            <option>Főétel</option>
            <option>Desszert</option>
          </select>
        </div>

        <div class="form-group">
          <label>Étel fotója:</label>
          <input type="file" @change="handleFileChange" :disabled="saving" accept="image/*" class="input-field file-input" />
          <div v-if="imagePreview" class="image-preview-container">
            <img :src="imagePreview" class="preview-img" alt="Előnézet" @error="onPreviewError" />
          </div>
        </div>

        <div class="form-group">
          <label>Rövid leírás:</label>
          <textarea v-model="recipe.description" :disabled="saving" placeholder="Rövid leírás..." class="textarea-field short"></textarea>
        </div>

        <div class="form-group">
          <label>Elkészítés menete:</label>
          <textarea v-model="recipe.howToText" :disabled="saving" placeholder="Lépésről lépésre..." class="textarea-field tall"></textarea>
        </div>
      </div>

      <div class="right-section">
        <div class="ingredients-header">
          <h3 class="section-title">Hozzávalók</h3>
          <button @click="addIngredient" :disabled="saving" class="add-btn">➕ Hozzáadás</button>
        </div>

        <div class="ingredients-list">
          <div v-for="(ingredient, index) in ingredients" :key="index" class="ingredient-row">
            <input v-model="ingredient.name" placeholder="Hozzávaló" class="input-field ingredient-name" />
            <input v-model="ingredient.quantity" placeholder="Menny." class="input-field ingredient-quantity" />
            <select v-model="ingredient.unit" class="select-field ingredient-unit">
              <option v-for="(unit, i) in units" :key="i" :value="unit">{{ unit }}</option>
            </select>
            <button @click="removeIngredient(index)" class="remove-btn">✕</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!successMessage" class="form-buttons">
      <button @click="cancel" class="cancel-btn" :disabled="saving">Mégse</button>
      <button @click="saveRecipe" class="save-btn" :disabled="saving">
        {{ saving ? 'Mentés folyamatban...' : '💾 Beküldés' }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'NewRecipe',
  data() {
    return {
      recipe: { title: '', category: '', description: '', howToText: '' },
      ingredients: [],
      selectedFile: null,
      imagePreview: null,
      units: ['g', 'dkg', 'kg', 'ml', 'dl', 'l', 'db', 'ek', 'tk', 'csipet'],
      error: null,
      successMessage: null,
      saving: false
    }
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    // Vészfék: Ha az előnézet vagy a default kép is hibás, ne fagyjon le!
    onPreviewError(event) {
      event.target.style.display = 'none';
      console.error("Kép betöltési hiba - Végtelen ciklus megakadályozva.");
    },
    addIngredient() {
      this.ingredients.push({ name: '', quantity: '0', unit: 'db' })
    },
    removeIngredient(index) {
      this.ingredients.splice(index, 1)
    },
    cancel() {
      this.$router.push('/');
    },
    async saveRecipe() {
      this.saving = true;
      this.error = null;

      const token = localStorage.getItem('jwt') || localStorage.getItem('token');
      if (!token) {
        this.error = "Jelentkezz be a mentéshez!";
        this.saving = false;
        return;
      }

      // Email kinyerése
      let userEmail = "";
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userEmail = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.email;
      } catch (e) { console.error("Token hiba"); }

      const formData = new FormData();
      formData.append('Title', this.recipe.title);
      formData.append('Category', this.recipe.category);
      formData.append('Description', this.recipe.description || '');
      formData.append('HowToText', this.recipe.howToText || '');
      formData.append('AuthorEmail', userEmail);

      this.ingredients.forEach((ing, index) => {
        formData.append(`Ingredients[${index}].Name`, ing.name);
        formData.append(`Ingredients[${index}].Quantity`, ing.quantity);
        formData.append(`Ingredients[${index}].Unit`, ing.unit);
      });

      if (this.selectedFile) formData.append('imageFile', this.selectedFile);

      try {
        await axios.post('https://localhost:5150/api/Recipes', formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        this.successMessage = "Sikeres mentés!";
        // Vár 3 másodpercet, hogy lássa az üzenetet, majd hazaküldi
        setTimeout(() => this.$router.push('/'), 3000); 

      } catch (err) {
        this.error = err.response?.data?.message || "Hiba történt a mentés során.";
        this.saving = false;
      }
    }
  }
}
</script>

<style scoped>
.success-box { background: #d4edda; color: #155724; padding: 40px; border-radius: 15px; text-align: center; margin: 20px 0; border: 2px solid #c3e6cb; }
.check-icon { font-size: 50px; display: block; margin-bottom: 10px; }
.status-info { background: #fff; padding: 10px; border-radius: 8px; display: inline-block; margin-top: 15px; color: #856404; background-color: #fff3cd; }
.loading-opacity { opacity: 0.6; pointer-events: none; }
/* ... a korábbi stílusaid maradnak ... */
</style>