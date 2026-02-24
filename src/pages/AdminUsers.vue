<template>
  <div class="admin-users-container fade-in">
    <div class="glass-box">
      <div class="header-section">
        <h2>👥 Felhasználók kezelése</h2>
        <p class="subtitle">Adminisztrátori felület a jogosultságok és tagok kezeléséhez</p>
      </div>

      <div v-if="error" class="error-banner">
        <span>❌ {{ error }}</span>
        <button @click="error = null" class="close-btn">&times;</button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Felhasználók betöltése...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <p>Nincsenek felhasználók a rendszerben.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Szerepkör</th>
              <th class="text-center">Receptek</th>
              <th class="text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="user-row">
              <td class="email-column">
                <div class="user-info">
                  <span class="avatar">{{ user.email[0].toUpperCase() }}</span>
                  {{ user.email }}
                </div>
              </td>
              <td>
                <select 
                  v-model="user.role" 
                  @change="updateRole(user)" 
                  class="role-select"
                  :class="{'admin-role': user.role === 'Admin'}"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td class="text-center">
                <span class="recipe-count">{{ user.recipeCount || 0 }} db</span>
              </td>
              <td class="text-right">
                <button @click="deleteUser(user.id)" class="delete-action-btn" title="Felhasználó törlése">
                  <i class="fas fa-trash"></i> Törlés
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'AdminUsers',
  data() {
    return {
      users: [],
      error: null,
      loading: false
    }
  },
  async mounted() {
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const { data } = await api.get('/Users')
        this.users = data
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba történt a felhasználók lekérésekor.'
      } finally {
        this.loading = false
      }
    },
    async deleteUser(id) {
      if (!confirm('FIGYELEM! Biztosan törölni szeretnéd ezt a felhasználót? Ez a művelet nem vonható vissza.')) return
      
      try {
        await api.delete(`/Users/${id}`)
        this.users = this.users.filter(u => u.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba történt a törlés során.'
      }
    },
    async updateRole(user) {
      try {
        await api.put(`/Users/${user.id}/role`, { role: user.role })
        // Sikeres frissítés esetén egy kis villanás vagy konzol üzenet
        console.log(`Siker: ${user.email} mostantól ${user.role}`)
      } catch (err) {
        this.error = err.response?.data?.message || 'Nem sikerült módosítani a szerepkört.'
        // Hiba esetén töltsük újra a listát, hogy az eredeti állapot látszódjon
        await this.fetchUsers()
      }
    }
  }
}
</script>

<style scoped>
.admin-users-container {
  padding: 40px 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.glass-box {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-section {
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
}

h2 { color: #2c3e50; margin: 0; }
.subtitle { color: #7f8c8d; font-size: 0.9rem; }

.table-wrapper { overflow-x: auto; }

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 12px 15px;
  color: #95a5a6;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

td {
  padding: 15px;
  border-bottom: 1px solid #f1f1f1;
}

.user-row:hover { background: rgba(243, 156, 18, 0.05); }

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.avatar {
  width: 35px;
  height: 35px;
  background: #f39c12;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.role-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.admin-role {
  border-color: #e67e22;
  color: #e67e22;
  font-weight: bold;
}

.recipe-count {
  background: #eee;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  color: #666;
}

.delete-action-btn {
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-action-btn:hover {
  background: #e74c3c;
  color: white;
}

.error-banner {
  background: #fdeaea;
  color: #c0392b;
  padding: 12px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.text-center { text-align: center; }
.text-right { text-align: right; }

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>