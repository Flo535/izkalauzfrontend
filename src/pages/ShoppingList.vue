<template>
  <div class="shopping-list-page">

    <transition name="modal">
      <div v-if="confirm.visible" class="modal-overlay" @click.self="cancelConfirm">
        <div class="modal-box">
          <p class="modal-msg">{{ confirm.message }}</p>
          <div class="modal-btns">
            <button class="modal-btn modal-btn--cancel" @click="cancelConfirm">Mégse</button>
            <button class="modal-btn modal-btn--confirm" @click="doConfirm">Igen, törlöm</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h1 class="page-title">Bevásárlólistáim</h1>
      <p class="page-subtitle">Hozz létre és kezelj bevásárlólistákat</p>
    </div>

    <!-- Új lista létrehozása -->
    <div class="create-card">
      <div class="input-row">
        <input
          v-model="newTitle"
          placeholder="Új bevásárlólista neve..."
          class="list-input" name="listNameText"
          @keyup.enter="createList"
        />
        <button class="btn-create" name="listCreateBtn" @click="createList">+ Létrehozás</button>
      </div>
    </div>

    <!-- Üres állapot -->
    <div v-if="lists.length === 0" class="empty-state">
      <span class="empty-icon">🛒</span>
      <p>Még nincs bevásárlólistád. Hozz létre egyet!</p>
    </div>

    <!-- Lista kártyák -->
    <div class="lists-grid">
      <div
        v-for="list in lists"
        :key="list.id"
        class="list-card"
      >
        <div class="list-card-body">
          <div class="list-icon">🛒</div>
          <h3 class="list-title">{{ list.title }}</h3>
        </div>
        <div class="list-card-footer">
          <button class="btn-edit" name="listModifyBtn" @click="openEditor(list)">✏️ Módosítás</button>
          <button class="btn-delete" @click="deleteList(list.id)">✕ Törlés</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'

const API = 'https://localhost:5150/api'

export default {
  name: 'ShoppingList',

  data() {
    return {
      lists: [],
      newTitle: '',
      confirm: { visible: false, message: '', resolve: null }
    }
  },

  mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
      return
    }
    this.fetchLists()
  },

  methods: {
    authHeaders() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    },

    async fetchLists() {
      try {
        const res = await axios.get(`${API}/ShoppingLists`, this.authHeaders())
        this.lists = res.data
      } catch {
        this.lists = []
      }
    },

    async createList() {
      if (!this.newTitle.trim()) return
      try {
        const res = await axios.post(
          `${API}/ShoppingLists`,
          { title: this.newTitle.trim() },
          this.authHeaders()
        )
        this.lists.push({ id: res.data, title: this.newTitle.trim() })
        this.newTitle = ''
      } catch (err) {
        console.error('Hiba a lista létrehozásakor:', err)
      }
    },

    async deleteList(id) {
      const ok = await this.askConfirm('Biztosan törlöd ezt a listát?')
      if (!ok) return
      try {
        await axios.delete(`${API}/ShoppingLists/${id}`, this.authHeaders())
        this.lists = this.lists.filter(l => l.id !== id)
      } catch (err) {
        console.error('Hiba a törlés során:', err)
      }
    },

    openEditor(list) {
      this.$router.push(`/vasarlas/${list.id}/edit`)
    },

    // ── Megerősítő modál ──
    askConfirm(message) {
      return new Promise(resolve => {
        this.confirm = { visible: true, message, resolve }
      })
    },
    doConfirm() {
      this.confirm.resolve(true)
      this.confirm.visible = false
    },
    cancelConfirm() {
      this.confirm.resolve(false)
      this.confirm.visible = false
    }
  }
}
</script>

<style scoped>
/* ── Oldal ── */
.shopping-list-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}

/* ── Fejléc ── */
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-label {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #FF8C00;
  font-weight: 600;
  margin-bottom: 8px;
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

/* ── Létrehozás kártya ── */
.create-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e8e8e4;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 32px;
}

.input-row {
  display: flex;
  gap: 10px;
}

.list-input {
  flex: 1;
  padding: 11px 16px;
  border-radius: 50px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.9rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  min-width: 0;
}

.list-input:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  background: #fff;
}

.btn-create {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 11px 22px;
  border-radius: 50px;
  border: none;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease, transform 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-create:hover {
  background: #FF8C00;
  transform: translateY(-1px);
}

/* ── Üres állapot ── */
.empty-state {
  text-align: center;
  padding: 64px 20px;
  color: #b0b0b0;
}

.empty-icon {
  font-size: 2.8rem;
  display: block;
  margin-bottom: 14px;
}

.empty-state p {
  font-size: 0.95rem;
  margin: 0;
}

/* ── Grid ── */
.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

/* ── Lista kártya ── */
.list-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e8e8e4;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.list-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.09);
}

.list-card-body {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 20px;
  flex: 1;
}

.list-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #fff8f0;
  border: 1px solid #ffe0b2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.list-title {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.list-card-footer {
  display: flex;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid #e8e8e4;
  background: #fafaf8;
}

.btn-edit,
.btn-delete {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-edit {
  background: #f0f0ec;
  color: #444;
  border: 1.5px solid #e0ddd8;
  flex: 1;
}

.btn-edit:hover {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: white;
}

.btn-delete {
  background: #fff0f0;
  color: #e74c3c;
  border: 1.5px solid #fcc;
}

.btn-delete:hover {
  background: #e74c3c;
  border-color: #e74c3c;
  color: white;
}


/* ── Megerősítő modál ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 24px;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}

.modal-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 28px 24px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-msg {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #1a1a1a;
  margin: 0 0 24px;
  line-height: 1.5;
}

.modal-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.modal-btn {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.modal-btn--cancel {
  background: #f5f5f3;
  color: #555;
  border: 1.5px solid #e0ddd8;
}

.modal-btn--cancel:hover {
  border-color: #aaa;
  color: #1a1a1a;
}

.modal-btn--confirm {
  background: #e74c3c;
  color: white;
  border: 1.5px solid #e74c3c;
}

.modal-btn--confirm:hover {
  background: #c0392b;
  border-color: #c0392b;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.92);
  opacity: 0;
}

@media (max-width: 480px) {
  .modal-box {
    padding: 24px 20px 20px;
  }

  .modal-btns {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
    text-align: center;
  }
}

/* ── Reszponzív ── */
@media (max-width: 600px) {
  .page-title {
    font-size: 1.8rem;
  }

  .input-row {
    flex-direction: column;
  }

  .btn-create {
    text-align: center;
    justify-content: center;
  }

  .lists-grid {
    grid-template-columns: 1fr;
  }
}
</style>