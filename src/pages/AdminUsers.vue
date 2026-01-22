<template>
  <div class="admin-users glass-box">
    <h2>Felhasználók kezelése (Admin)</h2>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="users.length === 0 && !error">Nincs felhasználó.</div>

    <table v-if="users.length">
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>Lista</th>
          <th>Műveletek</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.email }}</td>
          <td>
            <select v-model="user.role" @change="updateRole(user)">
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </td>
          <td>
            <button @click="deleteUser(user.id)">Törlés</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'AdminUsers',
  data() {
    return { users: [], error: null }
  },
  async mounted() {
    await this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      try {
        const { data } = await api.get('/Users')
        this.users = data
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a felhasználók lekérésekor.'
      }
    },
    async deleteUser(id) {
      if (!confirm('Biztos törlöd a felhasználót?')) return
      try {
        await api.delete(`/Users/${id}`)
        this.users = this.users.filter(u => u.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a felhasználó törlésekor.'
      }
    },
    async updateRole(user) {
      try {
        await api.put(`/Users/${user.id}/role`, { role: user.role })
      } catch (err) {
        this.error = err.response?.data?.message || 'Hiba a szerepkör frissítésekor.'
      }
    }
  }
}
</script>
