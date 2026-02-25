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
              <th>Szerepkör</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.email }}</td>
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
            <span class="status-badge pending">Jóváhagyásra vár</span>
          </div>
          <div class="info">
            <h3>{{ recipe.title }}</h3>
            <p class="author">👤 {{ recipe.authorEmail }}</p>
            <div class="btns">
              <button @click="changeStatus(recipe.id, true)" class="btn-ok">✅ Elfogad</button>
              <button @click="deleteRecipe(recipe.id)" class="btn-no">❌ Elutasít/Töröl</button>
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
              <th>Állapot</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="recipe in filteredRecipes" :key="recipe.id">
              <td><strong>{{ recipe.title }}</strong></td>
              <td>{{ recipe.authorEmail }}</td>
              <td>
                <span :class="['status-text', recipe.isApproved ? 'approved' : 'pending']">
                  {{ recipe.isApproved ? 'Jóváhagyva' : 'Függőben' }}
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
  computed: {
    isAdmin() { return authState.isAdmin; },
    currentEmail() { return authState.userEmail; },
    // JAVÍTÁS: A szűrés most már az isApproved mezőt nézi (ami a Backendben is van)
    pendingRecipes() {
      return this.allRecipes.filter(r => r.isApproved === false);
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
      // Ha a kép útvonala már tartalmazza a baseUrl-t, ne duplázzuk
      if (recipe.imagePath.startsWith('http')) return recipe.imagePath;
      return `${this.baseUrl}${recipe.imagePath}`;
    },
    handleImgError(e) { e.target.src = `${this.baseUrl}/images/default.jpg`; },

    async loadUsers() {
      this.loadingUsers = true;
      try {
        const res = await axios.get(`${this.baseUrl}/api/Users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.users = res.data;
      } catch (err) { console.error("Admin - User hiba:", err); }
      finally { this.loadingUsers = false; }
    },

    async loadAllRecipes() {
      this.loadingRecipes = true;
      try {
        const res = await axios.get(`${this.baseUrl}/api/admin/recipes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // A Backend egy listát küld vissza, amit az isApproved mezővel szűrünk a computed-ben
        this.allRecipes = res.data;
      } catch (err) { console.error("Admin - Recept hiba:", err); }
      finally { this.loadingRecipes = false; }
    },

    async changeStatus(id, isApproved) {
      try {
        // JAVÍTÁS: A Backendnek egy DTO-t kell küldeni (IsApproved property-vel)
        await axios.put(`${this.baseUrl}/api/admin/recipes/${id}/status`, 
          { isApproved: isApproved }, 
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        await this.loadAllRecipes();
      } catch (err) { 
        console.error(err);
        alert("Hiba a státusz módosításakor."); 
      }
    },

    async deleteRecipe(id) {
      if (!confirm("Biztosan törlöd ezt a receptet?")) return;
      try {
        await axios.delete(`${this.baseUrl}/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await this.loadAllRecipes(); // Lista frissítése törlés után
      } catch (err) { alert("Hiba a törlésnél."); }
    },

    async updateRole(user) {
      try {
        await axios.put(`${this.baseUrl}/api/Users/${user.id}/role`, { role: user.role }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert(`Sikeres: ${user.email} -> ${user.role}`);
      } catch (err) { alert("Hiba."); }
    },

    async deleteUser(user) {
      if (!confirm(`Törlöd: ${user.email}?`)) return;
      try {
        await axios.delete(`${this.baseUrl}/api/Users/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await this.loadUsers();
      } catch (err) { alert("Hiba."); }
    },

    editRecipe(id) {
      this.$router.push(`/edit-recipe/${id}`);
    }
  }
}
</script>

<style scoped>
/* A te stílusaid maradnak, csak apróbb javítások a láthatóságért */
.admin-page { padding: 30px; max-width: 1200px; margin: 40px auto; background: rgba(255,255,255,0.9); border-radius: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.table-container { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; margin-top: 10px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 15px; border-bottom: 1px solid #eee; text-align: left; }
th { background: #f8f9fa; }
.search-input { padding: 10px; border-radius: 8px; border: 1px solid #ddd; width: 300px; }
.status-text.approved { color: #27ae60; font-weight: bold; }
.status-text.pending { color: #f39c12; font-weight: bold; }
.recipe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.recipe-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.card-img-wrapper { height: 150px; position: relative; }
.admin-img { width: 100%; height: 100%; object-fit: cover; }
.status-badge.pending { position: absolute; top: 10px; right: 10px; background: #f39c12; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.info { padding: 15px; }
.btns { display: flex; gap: 10px; margin-top: 10px; }
.btn-ok { background: #2ecc71; color: white; flex: 1; border: none; padding: 10px; border-radius: 6px; cursor: pointer; }
.btn-no { background: #e74c3c; color: white; flex: 1; border: none; padding: 10px; border-radius: 6px; cursor: pointer; }
.refresh-btn { background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }
.btn-edit { background: #3498db; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px; }
</style>