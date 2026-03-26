<template>
  <div class="note-page">

    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h1 class="page-title">Személyes Jegyzetek</h1>
      <p class="page-subtitle">Ötletek, trükkök és emlékeztetők a felhőben</p>
    </div>

    <!-- Kártya -->
    <div class="note-card">

      <div class="note-card-header">
        <span class="note-icon">📝</span>
        <div>
          <h3 class="note-card-title">Saját konyhai feljegyzéseim</h3>
          <p class="note-card-sub">A változásokat a mentés gombbal tudod elmenteni.</p>
        </div>
      </div>

      <!-- Textarea -->
      <div class="textarea-wrap">
        <textarea
          v-model="content"
          placeholder="Írj ide valami okosat... (pl. a nagyi titkos trükkje a rántáshoz)"
          class="note-textarea" name="noteText"
          :class="{ 'is-error': content.length > 300 }"
          @input="updateStatus"
        ></textarea>
        <span class="char-count" :class="{ 'is-danger': content.length > 300 }">
          {{ content.length }} / 300
        </span>
      </div>

      <!-- Footer -->
      <div class="note-footer">
        <span class="status-msg" v-if="status">{{ status }}</span>
        <button
          class="save-btn" name="saveBtn"
          @click="saveNote"
          :disabled="content.length > 300 || !isLoggedIn"
        >
          💾 Mentés
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'NotePage',

  data() {
    return {
      content: '',
      status: '',
      isLoggedIn: false,
      apiUrl: 'https://localhost:5150/api/Notes'
    }
  },

  async mounted() {
    const token = localStorage.getItem('token')
    if (token) {
      this.isLoggedIn = true
      await this.fetchNote()
    } else {
      this.status = '⚠️ Kérlek, jelentkezz be a jegyzetek használatához!'
    }
  },

  methods: {
    async fetchNote() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${this.apiUrl}/mine`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        })
        this.content = res.data.text || ''
      } catch (err) {
        if (err.response && err.response.status === 401) {
          this.status = '❌ Nincs jogosultságod. Jelentkezz be újra!'
          this.isLoggedIn = false
        } else {
          this.status = '❌ Nem sikerült elérni a szervert.'
        }
      }
    },

    async saveNote() {
      if (this.content.length > 300) {
        this.status = '⚠️ Max 300 karakter!'
        return
      }
      const token = localStorage.getItem('token')
      if (!token) {
        this.status = '⚠️ Bejelentkezés szükséges!'
        return
      }
      try {
        await axios.put(
          `${this.apiUrl}/mine`,
          { text: this.content },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        )
        this.status = '✅ Mentve!'
        setTimeout(() => { this.status = '' }, 3000)
      } catch (err) {
        this.status = `❌ Mentés sikertelen (${err.response?.status || 'Szerver nem elérhető'})`
      }
    },

    updateStatus() {
      if (this.content.length > 300) {
        this.status = '❗ Túl hosszú!'
      } else {
        this.status = '✍️ Szerkesztés...'
      }
    }
  }
}
</script>

<style scoped>
/* ── Oldal ── */
.note-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}

/* ── Fejléc ── */
.page-header {
  text-align: center;
  margin-bottom: 36px;
}

.page-label {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #FF8C00;
  margin-bottom: 8px;
  font-weight: 600;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 600;
  margin: 0 0 8px;
  background: #ff9e15;
  /*background: linear-gradient(to right, #FF8C00, #FFD700);*/
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #656565;
  margin: 0;
}

/* ── Kártya ── */
.note-card {
  background: #f5f5f3;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.note-card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 22px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e4;
}

.note-icon {
  font-size: 1.8rem;
  line-height: 1;
  flex-shrink: 0;
}

.note-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.note-card-sub {
  font-size: 0.82rem;
  color: #9d9d9d;
  margin: 0;
}

/* ── Textarea ── */
.textarea-wrap {
  position: relative;
}

.note-textarea {
  width: 100%;
  height: 320px;        /* Fix magasság */
  resize: none;         /* Átméretezés tiltva */
  padding: 16px 16px 36px;
  border-radius: 14px;
  border: 1.5px solid #e8e8e4;
  background: #fff;
  font-family: 'Poppins', 'DM Sans', sans-serif;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.note-textarea:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
}

.note-textarea.is-error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.char-count {
  position: absolute;
  bottom: 12px;
  right: 14px;
  font-size: 0.78rem;
  color: #9d9d9d;
  font-weight: 500;
  pointer-events: none;
}

.char-count.is-danger {
  color: #e74c3c;
}

/* ── Footer ── */
.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
  gap: 12px;
}

.status-msg {
  font-size: 0.88rem;
  color: #FF8C00;
  font-weight: 500;
}

.save-btn {
  padding: 11px 28px;
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  width: auto;
  white-space: nowrap;
  flex-shrink: 0;
}

.save-btn:hover:not(:disabled) {
  background: #FF8C00;
  box-shadow: 0 4px 14px rgba(255, 140, 0, 0.3);
  transform: translateY(-1px);
}

.save-btn:disabled {
  background: #ddd;
  color: #aaa;
  cursor: not-allowed;
  box-shadow: none;
}

/* ── Reszponzív ── */
@media (max-width: 600px) {
  .page-title {
    font-size: 1.7rem;
  }

  .note-card {
    padding: 20px;
  }

  .note-textarea {
    height: 260px;
  }

  .note-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .save-btn {
    width: 100%;
    text-align: center;
  }
}
</style>