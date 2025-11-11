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

    <!-- Új recept hozzáadása -->
    <transition name="fade">
      <div v-if="showAddForm && isLoggedIn" class="add-form">
        <h3>Új recept hozzáadása</h3>
        <form @submit.prevent="addRecipe">
          <input v-model="newRecipe.title" type="text" placeholder="Recept címe" required />
          <textarea v-model="newRecipe.description" placeholder="Leírás" required></textarea>
          <input
            v-model="newRecipe.ingredients"
            type="text"
            placeholder="Hozzávalók (vesszővel elválasztva)"
          />
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
      <li v-for="recipe in recipes" :key="recipe.id || recipe.Id" class="recipe-item">
        <div v-if="editingId === (recipe.id || recipe.Id)" class="edit-form">
          <input v-model="editingRecipe.title" type="text" />
          <textarea v-model="editingRecipe.description"></textarea>
          <input v-model="editingRecipe.ingredients" type="text" />
          <div class="form-buttons">
            <button @click="updateRecipe(recipe.id || recipe.Id)" class="save">Mentés</button>
            <button @click="cancelEdit" class="cancel">Mégse</button>
          </div>
        </div>

        <div v-else class="recipe-card">
          <h3>{{ recipe.title }}</h3>
          <p>{{ recipe.description }}</p>

          <!-- Hozzávalók -->
          <p v-if="recipe.ingredients && recipe.ingredients.length">
            <strong>Hozzávalók:</strong>
            {{ Array.isArray(recipe.ingredients)
              ? recipe.ingredients.join(", ")
              : recipe.ingredients }}
          </p>

          <p v-if="recipe.authorEmail" class="author">
            👩‍🍳 <strong>Szerző:</strong> {{ recipe.authorEmail }}
          </p>

          <div v-if="isLoggedIn" class="actions">
            <button @click="editRecipe(recipe)">✏️</button>
            <button @click="deleteRecipe(recipe.id || recipe.Id)">🗑️</button>
          </div>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script>
import api from "@/axios";

export default {
  name: "RecipeList",
  data() {
    return {
      recipes: [],
      loading: true,
      error: null,
      showAddForm: false,
      newRecipe: { title: "", description: "", ingredients: "" },
      editingId: null,
      editingRecipe: { title: "", description: "", ingredients: "" },
    };
  },

  computed: {
    isLoggedIn() {
      return !!localStorage.getItem("token");
    },
    authHeaders() {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  },

  mounted() {
    this.fetchRecipes();
  },

  methods: {
    async fetchRecipes() {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await api.get("/Recipes", {
          headers: { "Content-Type": "application/json", ...(this.authHeaders || {}) },
        });

        this.recipes = (Array.isArray(data) ? data : []).map(r => ({
          id: r.id || r.Id,
          title: r.title || r.Title,
          description: r.description || r.Description,
          authorEmail: r.authorEmail || r.AuthorEmail || "",
          ingredients: Array.isArray(r.ingredients)
            ? r.ingredients
            : typeof r.ingredients === "string"
              ? r.ingredients.replace(/[\[\]"]+/g, "").split(",").map(i => i.trim())
              : [],
        }));

      } catch (err) {
        console.error("Hiba a receptek lekérésekor:", err);

        if (err.response && err.response.status === 500) {
          console.warn("⚠️ Backend 500 hibát adott, mintareceptek betöltése...");
          this.recipes = [
            { id: 1, title: "Palacsinta", description: "Egyszerű, klasszikus palacsinta.", authorEmail: "minta@izkalauz.hu", ingredients: ["Liszt","Tojás","Tej","Cukor"] },
            { id: 2, title: "Rántotta", description: "Gyors, finom reggeli.", authorEmail: "chef@izkalauz.hu", ingredients: ["Tojás","Só","Olaj"] },
          ];
          this.error = "A szerver nem elérhető, tesztadatok kerültek betöltésre.";
        } else {
          this.error = "Nem sikerült betölteni a recepteket.";
        }

      } finally {
        this.loading = false;
      }
    },

    async addRecipe() {
      try {
        const payload = {
          title: this.newRecipe.title,
          description: this.newRecipe.description,
          ingredients: this.newRecipe.ingredients
            ? this.newRecipe.ingredients.split(",").map(i => i.trim())
            : [],
        };

        const { data } = await api.post("/Recipes", payload, {
          headers: { "Content-Type": "application/json", ...(this.authHeaders || {}) },
        });

        this.recipes.push(data);
        this.newRecipe = { title: "", description: "", ingredients: "" };
        this.showAddForm = false;
      } catch (err) {
        console.error("Hiba a recept létrehozásakor:", err);
        this.error = "Nem sikerült hozzáadni a receptet.";
      }
    },

    toggleAddMode() {
      this.showAddForm = !this.showAddForm;
    },

    editRecipe(recipe) {
      this.editingId = recipe.id || recipe.Id;
      this.editingRecipe = {
        title: recipe.title,
        description: recipe.description,
        ingredients: Array.isArray(recipe.ingredients)
          ? recipe.ingredients.join(", ")
          : recipe.ingredients,
      };
    },

    async updateRecipe(id) {
      try {
        const payload = {
          title: this.editingRecipe.title,
          description: this.editingRecipe.description,
          ingredients: this.editingRecipe.ingredients
            ? this.editingRecipe.ingredients.split(",").map(i => i.trim())
            : [],
        };

        const { data } = await api.put(`/Recipes/${id}`, payload, {
          headers: { "Content-Type": "application/json", ...(this.authHeaders || {}) },
        });

        const index = this.recipes.findIndex(r => r.id === id || r.Id === id);
        if (index !== -1) this.recipes[index] = data;
        this.cancelEdit();
      } catch (err) {
        console.error("Hiba a recept frissítésekor:", err);
        this.error = "Nem sikerült frissíteni a receptet.";
      }
    },

    cancelEdit() {
      this.editingId = null;
      this.editingRecipe = { title: "", description: "", ingredients: "" };
    },

    async deleteRecipe(id) {
      if (!confirm("Biztosan törölni szeretnéd a receptet?")) return;
      try {
        await api.delete(`/Recipes/${id}`, {
          headers: { ...(this.authHeaders || {}) },
        });
        this.recipes = this.recipes.filter(r => (r.id || r.Id) !== id);
      } catch (err) {
        console.error("Hiba a recept törlésekor:", err);
        this.error = "Nem sikerült törölni a receptet.";
      }
    },
  },
};
</script>

<style scoped>
.recipe-list-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

/* Glass effect */
.glass-box {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

/* Header row */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Add button */
.add-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  cursor: pointer;
}

/* Recipe list */
.recipe-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recipe-item {
  margin-bottom: 16px;
}

.recipe-card {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 12px;
  background: #fff;
}

/* Form buttons */
.form-buttons {
  margin-top: 10px;
}

.form-buttons button {
  margin-right: 8px;
}
</style>
