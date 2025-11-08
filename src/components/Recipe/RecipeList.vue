<template>
  <div class="recipe-list-container glass-box">
    <div class="header-row">
      <h2>🍽 Receptek</h2>
      <button 
        v-if="isLoggedIn && !showAddForm" 
        class="add-btn" 
        @click="toggleAddMode">
        + Új recept
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="loading" class="loading">Betöltés...</div>

    <!-- Csak bejelentkezve, Új recept form -->
    <transition name="fade">
      <div v-if="showAddForm && isLoggedIn" class="add-form">
        <h3>Új recept hozzáadása</h3>
        <form @submit.prevent="addRecipe">
          <input v-model="newRecipe.name" type="text" placeholder="Recept neve" required />
          <textarea v-model="newRecipe.description" placeholder="Leírás" required></textarea>
          <div class="form-buttons">
            <button type="submit" class="save">Mentés</button>
            <button type="button" class="cancel" @click="toggleAddMode">Mégse</button>
          </div>
        </form>
      </div>
    </transition>

    <!-- Ha nincs token -->
    <div v-if="!isLoggedIn" class="guest-info">
      <p>🔒 A receptek szerkesztéséhez vagy létrehozásához be kell jelentkezned.</p>
      <router-link to="/login" class="login-link">Bejelentkezés</router-link>
    </div>

    <!-- Recept lista -->
    <transition-group name="fade" tag="ul" class="recipe-list">
      <li v-for="recipe in recipes" :key="recipe.id" class="recipe-item">
        <div v-if="editingId === recipe.id" class="edit-form">
          <input v-model="editingRecipe.name" type="text" />
          <textarea v-model="editingRecipe.description"></textarea>
          <div class="form-buttons">
            <button @click="updateRecipe(recipe.id)" class="save">Mentés</button>
            <button @click="cancelEdit" class="cancel">Mégse</button>
          </div>
        </div>

        <div v-else class="recipe-card">
          <h3>{{ recipe.name }}</h3>
          <p>{{ recipe.description }}</p>
          <div v-if="isLoggedIn" class="actions">
            <button @click="editRecipe(recipe)">✏️</button>
            <button @click="deleteRecipe(recipe.id)">🗑️</button>
          </div>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script>
import api from "@/axios"

export default {
  name: "RecipeList",
  data() {
    return {
      recipes: [],
      loading: true,
      error: null,
      showAddForm: false,
      newRecipe: { name: "", description: "" },
      editingId: null,
      editingRecipe: { name: "", description: "" },
    }
  },

  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("token")
    },
    authHeaders() {
      const token = localStorage.getItem("token")
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
  },

  mounted() {
    this.fetchRecipes()
  },

  methods: {
    async fetchRecipes() {
      try {
        const { data } = await api.get("/api/Recipes", {
          headers: { "Content-Type": "application/json", ...(this.authHeaders || {}) },
        })
        this.recipes = Array.isArray(data) ? data : []
      } catch (err) {
        console.error("Hiba a receptek lekérésekor:", err)
        this.error = "Nem sikerült betölteni a recepteket."
      } finally {
        this.loading = false
      }
    },

    async addRecipe() {
      try {
        const { data } = await api.post("/api/Recipes", this.newRecipe, {
          headers: { "Content-Type": "application/json", ...(this.authHeaders || {}) },
        })
        this.recipes.push(data)
        this.newRecipe = { name: "", description: "" }
        this.showAddForm = false
      } catch (err) {
        console.error("Hiba a recept létrehozásakor:", err)
        this.error = "Nem sikerült hozzáadni a receptet."
      }
    },

    toggleAddMode() {
      this.showAddForm = !this.showAddForm
    },

    editRecipe(recipe) {
      this.editingId = recipe.id
      this.editingRecipe = { name: recipe.name, description: recipe.description }
    },

    async updateRecipe(id) {
      try {
        const { data } = await api.put(`/api/Recipes/${id}`, this.editingRecipe, {
          headers: { "Content-Type": "application/json", ...(this.authHeaders || {}) },
        })
        const index = this.recipes.findIndex((r) => r.id === id)
        if (index !== -1) this.recipes[index] = data
        this.cancelEdit()
      } catch (err) {
        console.error("Hiba a recept frissítésekor:", err)
        this.error = "Nem sikerült frissíteni a receptet."
      }
    },

    cancelEdit() {
      this.editingId = null
      this.editingRecipe = { name: "", description: "" }
    },

    async deleteRecipe(id) {
      if (!confirm("Biztosan törölni szeretnéd a receptet?")) return
      try {
        await api.delete(`/api/Recipes/${id}`, {
          headers: { ...(this.authHeaders || {}) },
        })
        this.recipes = this.recipes.filter((r) => r.id !== id)
      } catch (err) {
        console.error("Hiba a recept törlésekor:", err)
        this.error = "Nem sikerült törölni a receptet."
      }
    },
  },
}
</script>

<style scoped>

/* (a korábbi design marad — csak a “guest-info” és linkek újak) */
.guest-info {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 240, 0.9);
  border-radius: 10px;
  margin: 20px 0;
}
.login-link {
  color: #f39c12;
  text-decoration: underline;
  font-weight: bold;
}
.recipe-list-container {
  max-width: 900px;
  margin: 100px auto 40px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.add-btn {
  background: #f39c12;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}
.add-btn:hover {
  background: #d68910;
}

.add-form,
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.add-form input,
.add-form textarea,
.edit-form input,
.edit-form textarea {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  width: 100%;
}

.form-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

button.save {
  background: #27ae60;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
button.cancel {
  background: #7f8c8d;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
button.save:hover {
  background: #1e8449;
}
button.cancel:hover {
  background: #616a6b;
}

.recipe-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.recipe-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.recipe-card h3 {
  margin-bottom: 8px;
  color: #2c3e50;
}
.recipe-card p {
  color: #555;
  font-size: 0.95rem;
  line-height: 1.4;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}
.actions button {
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  transition: 0.2s;
}
.actions button:hover {
  transform: scale(1.2);
}

.error {
  color: #c0392b;
  font-weight: bold;
}
.loading {
  font-style: italic;
  color: #888;
}

/* ====== Animációk ====== */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ====== Mobil optimalizáció ====== */
@media (max-width: 600px) {
  .recipe-list-container {
    padding: 20px;
  }
  .header-row h2 {
    font-size: 1.4rem;
  }
  .add-btn {
    width: 100%;
    padding: 12px;
  }
  .recipe-card {
    padding: 16px;
  }
  .actions {
    justify-content: space-between;
  }
}
</style>

