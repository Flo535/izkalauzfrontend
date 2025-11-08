<template>
  <div class="profile">
    <h2>Profil oldal</h2>
    <p v-if="userEmail">Be vagy jelentkezve mint: <strong>{{ userEmail }}</strong></p>
    <p v-else>Betöltés...</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Profile',
  data() {
    return {
      userEmail: null,
      error: null
    }
  },
  async mounted() {
    const token = localStorage.getItem('token')

    if (!token) {
      this.error = 'Nem vagy bejelentkezve.'
      this.$router.push('/login')
      return
    }

    try {
      const response = await axios.get('/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      this.userEmail = response.data.email
    } catch (err) {
      this.error = err.response?.data?.error || 'Hiba történt a profil lekérésekor.'
      localStorage.removeItem('token')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 60px auto;
  text-align: center;
}
.error {
  color: red;
  margin-top: 20px;
}
</style>



