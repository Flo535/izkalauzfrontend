<template>
  <div class="new-recipe-page fade-in">
    <h2 class="page-title">Új recept hozzáadása</h2>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="form-group">
      <label>Cím:</label>
      <input v-model="newRecipe.title" placeholder="Recept címe" />
    </div>

    <div class="form-group">
      <label>Leírás:</label>
      <textarea v-model="newRecipe.description" placeholder="Rövid leírás"></textarea>
    </div>

    <div class="form-group">
      <label>Elkészítés menete:</label>
      <textarea v-model="newRecipe.howToText" placeholder="Lépésről lépésre"></textarea>
    </div>

    <div class="form-group">
      <label>Hozzávalók (vesszővel elválasztva):</label>
      <input v-model="newRecipe.ingredients" placeholder="pl. liszt, tojás, cukor" />
    </div>

    <div class="form-buttons">
      <button @click="saveRecipe" class="save-btn">Mentés</button>
      <button @click="cancel" class="cancel-btn">Mégse</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      newRecipe: {
        title: '',
        description: '',
        howToText: '',
        ingredients: ''
      },
      error: null
    }
  },
  methods: {
    cancel() {
      this.$router.push('/profile')
    },

    async saveRecipe() {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Nem vagy bejelentkezve.')

        const payload = {
          title: this.newRecipe.title,
          description: this.newRecipe.description,
          howToText: this.newRecipe.howToText,
          ingredients: this.newRecipe.ingredients
            .split(',')
            .map(i => i.trim())
            .filter(i => i)
        }

        const res = await axios.post(
          'https://localhost:5150/api/Recipes',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        // DEBUG: nézzük meg a backend választ a konzolban
        console.log('Backend válasz a mentésnél:', res)

        if (res.status >= 200 && res.status < 300) {
          // Mentés sikeres → vissza a profil oldalra
          this.$router.push('/profile')
        } else {
          // Ha a backend küldött valami üzenetet
          this.error = res.data?.message || 'Hiba a recept mentésekor.'
        }

      } catch (err) {
        // Ellenőrizzük, hogy valódi hiba-e
        if (err.response) {
          this.error = err.response.data?.message || err.response.statusText || 'Hiba a recept mentésekor.'
        } else {
          this.error = err.message
        }

        // DEBUG: hiba részlete
        console.log('Mentés hiba:', err)
      }
    }
  }
}
</script>

<style scoped>
.new-recipe-page {
  max-width: 600px;
  margin: 60px auto;
  padding: 20px;
  background: #fff8e1;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.page-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 5px;
}
.form-group input,
.form-group textarea {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
textarea { resize: vertical; min-height: 80px; }

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.save-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  color: white;
  cursor: pointer;
  font-weight: 500;
}
.cancel-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  background: #ccc;
  color: #333;
  cursor: pointer;
}
.fade-in {
  animation: fadeIn 0.5s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.error {
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
