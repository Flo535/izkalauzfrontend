<template>
  <div class="admin-page glass-box fade-in">
    <h1>🛠️ Adminisztrációs Panel</h1>

    <section v-if="isAdmin">
      <div class="section-header">
        <h2>👤 Felhasználók és Szerepkörök</h2>
        <button @click="loadUsers" class="refresh-btn">🔄 Frissítés</button>
      </div>

      <div v-if="loadingUsers" class="status-msg">Felhasználók betöltése...</div>
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Receptek</th>
              <th>Szerepkör</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.email }}</td>
              <td>{{ user.recipeCount ?? 0 }} db</td>
              <td>
                <select v-model="user.role" @change="updateRole(user)" class="admin-select">
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td>
                <button @click="deleteUser(user)" class="btn-delete-small" :disabled="user.email === currentEmail">
                  🗑️ Törlés
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="separator" />

    <section v-if="isAdmin">
      <div class="section-header">
        <h2>⏳ Jóváhagyásra váró receptek</h2>
        <button @click="loadAllRecipes" class="refresh-btn">🔄 Frissítés</button>
      </div>

      <div v-if="loadingRecipes" class="status-msg">Receptek betöltése...</div>
      <div v-else-if="pendingRecipes.length === 0" class="status-msg">Nincs jóváhagyásra váró recept. ✨</div>

      <div v-else class="recipe-grid">
        <div v-for="recipe in pendingRecipes" :key="recipe.id" class="recipe-card">
          <div class="card-img-wrapper">
            <img :src="getImageUrl(recipe)" class="admin-img" @error="handleImgError" />
            <span class="status-badge pending">Függőben</span>
          </div>
          <div class="info">
            <h3>{{ recipe.title }}</h3>
            <p class="author">👤 {{ recipe.authorEmail }}</p>
            <div class="btns">
              <button @click="changeStatus(recipe.id, 'Approved')" class="btn-ok">✅ Elfogad</button>
              <button @click="changeStatus(recipe.id, 'Rejected')" class="btn-no">❌ Elutasít</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <hr class="separator" />

    <section v-if="isAdmin">
      <div class="section-header">
        <h2>📚 Összes recept kezelése</h2>
        <input v-model="searchQuery" placeholder="Keresés cím vagy szerző alapján..." class="search-input" />
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Cím</th>
              <th>Szerző</th>
              <th>Státusz</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="recipe in filteredRecipes" :key="recipe.id">
              <td><strong>{{ recipe.title }}</strong></td>
              <td>{{ recipe.authorEmail }}</td>
              <td>
                <span :class="['status-text', recipe.status?.toLowerCase()]">
                  {{ recipe.status }}
                </span>
              </td>
              <td class="action-cell">
                <button @click="editRecipe(recipe.id)" class="btn-edit">✏️ Szerkesztés</button>
                <button @click="deleteRecipe(recipe.id)" class="btn-delete-small">🗑️ Törlés</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import { authState } from '@/auth.js';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminPanel',
  data() {
    return {
      users: [],
      allRecipes: [],
      searchQuery: '',
      loadingUsers: false,
      loadingRecipes: false,
      baseUrl: 'https://localhost:5150'
    }
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  computed: {
    isAdmin() { return authState.isAdmin; },
    currentEmail() { return authState.userEmail; },
    pendingRecipes() {
      return this.allRecipes.filter(r => r.status?.toLowerCase() === "pending");
    },
    filteredRecipes() {
      if (!this.searchQuery) return this.allRecipes;
      const q = this.searchQuery.toLowerCase();
      return this.allRecipes.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.authorEmail.toLowerCase().includes(q)
      );
    }
  },
  async mounted() {
    if (this.isAdmin) {
      await this.loadUsers();
      await this.loadAllRecipes();
    }
  },
  methods: {
    getImageUrl(recipe) {
      if (!recipe.imagePath) return `${this.baseUrl}/images/default.jpg`;
      const fileName = recipe.imagePath.split(/[\\/]/).pop();
      return `${this.baseUrl}/images/recipes/${fileName}`;
    },
    handleImgError(e) { e.target.src = `${this.baseUrl}/images/default.jpg`; },

    async loadUsers() {
      this.loadingUsers = true;
      try {
        const res = await axios.get(`${this.baseUrl}/api/Users`, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
        this.users = res.data;
      } catch (err) { console.error("Admin - User hiba:", err); }
      finally { this.loadingUsers = false; }
    },

    async loadAllRecipes() {
      this.loadingRecipes = true;
      try {
        // Fontos: Az Admin minden receptet lekér (legyen az Pending vagy Approved)
        const res = await axios.get(`${this.baseUrl}/api/admin/recipes`, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
        this.allRecipes = res.data;
      } catch (err) { console.error("Admin - Recept hiba:", err); }
      finally { this.loadingRecipes = false; }
    },

    async changeStatus(id, newStatus) {
      try {
        await axios.put(`${this.baseUrl}/api/admin/recipes/${id}/status`, JSON.stringify(newStatus), {
          headers: { 
            Authorization: `Bearer ${authState.token}`,
            'Content-Type': 'application/json'
          }
        });
        await this.loadAllRecipes();
      } catch (err) { alert("Hiba a művelet során."); }
    },

    async updateRole(user) {
      try {
        await axios.put(`${this.baseUrl}/api/Users/${user.id}/role`, { role: user.role }, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
        alert(`Sikeres módosítás: ${user.email}`);
      } catch (err) { alert("Sikertelen módosítás."); }
    },

    async deleteUser(user) {
      if (!confirm(`Biztosan törlöd: ${user.email}? Minden receptje is törlődni fog!`)) return;
      try {
        await axios.delete(`${this.baseUrl}/api/Users/${user.id}`, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
        this.users = this.users.filter(u => u.id !== user.id);
      } catch (err) { alert("Hiba a törlésnél."); }
    },

    async deleteRecipe(id) {
      if (!confirm("Biztosan véglegesen törölni akarod ezt a receptet?")) return;
      try {
        await axios.delete(`${this.baseUrl}/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${authState.token}` }
        });
        this.allRecipes = this.allRecipes.filter(r => r.id !== id);
      } catch (err) { alert("Nem sikerült törölni a receptet."); }
    },

    editRecipe(id) {
      // Átirányítás a meglévő szerkesztő oldalra
      this.$router.push(`/edit-recipe/${id}`);
    }
  }
}
</script>

<style scoped>
.admin-page { padding: 30px; max-width: 1200px; margin: 40px auto; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

.table-container { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; margin-top: 10px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 15px; border-bottom: 1px solid #eee; text-align: left; }
th { background: #f8f9fa; font-weight: bold; }

.search-input { padding: 10px; border-radius: 8px; border: 1px solid #ddd; width: 300px; }
.admin-select { padding: 5px; border-radius: 4px; }

.btn-edit { background: #3498db; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px; }
.btn-delete-small { background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
.btn-delete-small:disabled { background: #ccc; }

.status-text.approved { color: #27ae60; font-weight: bold; }
.status-text.pending { color: #f39c12; font-weight: bold; }
.status-text.rejected { color: #c0392b; font-weight: bold; }

.recipe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.recipe-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.card-img-wrapper { height: 150px; position: relative; }
.admin-img { width: 100%; height: 100%; object-fit: cover; }
.info { padding: 15px; }
.btns { display: flex; gap: 10px; margin-top: 10px; }
.btn-ok { background: #2ecc71; color: white; flex: 1; border: none; padding: 8px; border-radius: 6px; cursor: pointer; }
.btn-no { background: #e74c3c; color: white; flex: 1; border: none; padding: 8px; border-radius: 6px; cursor: pointer; }

.separator { margin: 40px 0; border: 0; border-top: 2px solid #eee; }
.fade-in { animation: fadeIn 0.5s ease-in; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>