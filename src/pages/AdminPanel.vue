<template>
  <div class="admin-page">
    <h1>Admin felület</h1>

    <!-- Felhasználók kezelése -->
    <section>
      <h2>Felhasználók kezelése</h2>
      <div v-if="usersLoading">⏳ Betöltés...</div>
      <div v-if="usersError" class="error">❌ {{ usersError }}</div>
      <table v-if="users.length">
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
              <select v-model="user.role" @change="updateRole(user)">
                <option>User</option>
                <option>Admin</option>
              </select>
            </td>
            <td>
              <button @click="deleteUser(user.id)">Törlés</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>Nincsenek felhasználók.</div>
    </section>

    <hr />

    <!-- Pending receptek kezelése -->
    <section>
      <h2>Jóváhagyásra váró receptek</h2>
      <div v-if="recipesLoading">⏳ Betöltés...</div>
      <div v-if="recipesError" class="error">❌ {{ recipesError }}</div>

      <div v-if="pendingRecipes.length === 0 && !recipesLoading">Nincs jóváhagyásra váró recept.</div>

      <div class="recipe-list">
        <div v-for="recipe in pendingRecipes" :key="recipe.id" class="recipe-card">
          <div class="image-wrapper">
            <img v-if="recipe.imagePath" :src="fullImagePath(recipe.imagePath)" :alt="recipe.title" />
            <div v-else class="no-image">Nincs kép</div>
          </div>

          <h3>{{ recipe.title }}</h3>
          <p><strong>Szerző:</strong> {{ recipe.authorEmail }}</p>
          <p><strong>Státusz:</strong> {{ recipe.status }}</p>

          <div class="card-buttons">
            <button @click="approveRecipe(recipe.id)">✅ Jóváhagyás</button>
            <button @click="rejectRecipe(recipe.id)">❌ Elutasítás</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AdminPanel',
  data() {
    return {
      users: [],
      usersLoading: true,
      usersError: null,

      pendingRecipes: [],
      recipesLoading: true,
      recipesError: null
    }
  },
  async mounted() {
    await Promise.all([this.fetchUsers(), this.fetchPendingRecipes()])
  },
  methods: {
    // -------------------
    // Felhasználók
    // -------------------
    async fetchUsers() {
      try {
        this.usersLoading = true
        const token = localStorage.getItem('token')
        const res = await axios.get('https://localhost:5150/api/Users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.users = res.data
      } catch (err) {
        this.usersError = err.response?.data?.message || 'Hiba a felhasználók lekérésekor.'
      } finally {
        this.usersLoading = false
      }
    },
    async updateRole(user) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`https://localhost:5150/api/Users/${user.id}/role`, { role: user.role }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('Szerepkör frissítve!')
      } catch {
        alert('Hiba a szerepkör frissítése során.')
      }
    },
    async deleteUser(id) {
      if (!confirm('Biztosan törölni szeretnéd a felhasználót?')) return
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`https://localhost:5150/api/Users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.users = this.users.filter(u => u.id !== id)
        alert('Felhasználó törölve!')
      } catch {
        alert('Hiba a törlés során.')
      }
    },

    // -------------------
    // Pending receptek
    // -------------------
    async fetchPendingRecipes() {
      try {
        this.recipesLoading = true
        const token = localStorage.getItem('token')
        const res = await axios.get('https://localhost:5150/api/Recipes/pending', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.pendingRecipes = res.data
      } catch (err) {
        this.recipesError = err.response?.data?.message || 'Hiba a receptek lekérésekor.'
      } finally {
        this.recipesLoading = false
      }
    },
    fullImagePath(path) {
      if (!path) return null
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`
    },
    async approveRecipe(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.post(`https://localhost:5150/api/Recipes/${id}/approve`, null, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.pendingRecipes = this.pendingRecipes.filter(r => r.id !== id)
        alert('Recept jóváhagyva!')
      } catch {
        alert('Hiba a jóváhagyás során.')
      }
    },
    async rejectRecipe(id) {
      try {
        const token = localStorage.getItem('token')
        await axios.post(`https://localhost:5150/api/Recipes/${id}/reject`, null, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.pendingRecipes = this.pendingRecipes.filter(r => r.id !== id)
        alert('Recept elutasítva.')
      } catch {
        alert('Hiba az elutasítás során.')
      }
    }
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

h1, h2 {
  text-align: center;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 40px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f4f4f4;
}

.recipe-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.recipe-card {
  flex: 0 0 30%;
  background: #fff7e6;
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.image-wrapper {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 10px;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 150px;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #888;
  font-weight: bold;
}

.card-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.card-buttons button {
  flex: 1;
  margin: 2px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: white;
}

.card-buttons button:first-child {
  background: linear-gradient(to right, #ffd700, #ff8c00);
}

.card-buttons button:last-child {
  background: #d9534f;
}
</style>
