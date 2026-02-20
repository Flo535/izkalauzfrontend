<template>
  <div class="note-page">
    <h1 class="page-title">📝 Jegyzet</h1>

    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>

    <div class="glass-box note-box" v-if="!errorMessage">
      <textarea
        v-model="noteText"
        class="note-input"
        maxlength="300"
        placeholder="Írd ide a jegyzeted..."
      ></textarea>

      <div class="bottom-row">
        <span class="charcount">{{ noteText.length }}/300</span>

        <button class="save-btn" @click="saveNote" :disabled="loading">
          💾 Mentés
        </button>
      </div>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios"

const API_BASE = 'https://localhost:5150/api'

export default {
  name: "MyNote",
  data() {
    return {
      noteText: "",
      loading: false,
      errorMessage: "",
      successMessage: ""
    }
  },
  async mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.errorMessage = "A funkció használatához be kell jelentkezned!"
      return
    }

    await this.loadNote()
  },
  methods: {
    async loadNote() {
      this.errorMessage = ""

      try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${API_BASE}/notes/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        this.noteText = res.data.text || ""
      } catch (err) {
        // Ha még nincs jegyzete a usernek (404), nem dobunk nagy hibát, csak üresen hagyjuk
        if (err.response?.status !== 404) {
          this.errorMessage = "A betöltés nem sikerült!"
        }
      }
    },

    async saveNote() {
      this.loading = true
      this.errorMessage = ""
      this.successMessage = ""

      try {
        const token = localStorage.getItem("token")
        const payload = { text: this.noteText }

        await axios.put(`${API_BASE}/notes/mine`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })

        this.successMessage = "Sikeresen elmentve!"
        setTimeout(() => (this.successMessage = ""), 3000)
      } catch (err) {
        this.errorMessage = err.response?.data || "Nem sikerült elmenteni."
      }

      this.loading = false
    }
  }
}
</script>

<style scoped>
.error-message {
  color: #e74c3c;
  margin-top: 20px;
  font-size: 1.2rem;
  text-align: center;
}
.note-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  color: #e67e22;
  margin-bottom: 25px;
  font-size: 2rem;
}

.note-box {
  padding: 20px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 15px;
  backdrop-filter: blur(5px);
}

.note-input {
  width: 100%;
  min-height: 240px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #ddd;
  font-size: 1.1rem;
  resize: vertical;
  background: rgba(255,255,255,0.8);
  box-sizing: border-box;
}

.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.charcount {
  font-size: 0.9rem;
  color: #555;
}

.save-btn {
  padding: 10px 18px;
  font-size: 1rem;
  border: none;
  background: #e67e22;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
}

.save-btn:hover:not(:disabled) {
  background: #d35400;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success {
  color: #27ae60;
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
}
</style>