<template>
  <div class="admin-page">
    <!-- Toast értesítések -->
    <transition name="toast">
      <div v-if="toast.visible" :class="['toast', `toast--${toast.type}`]">
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
        <span class="toast-msg">{{ toast.message }}</span>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="confirm.visible" class="modal-overlay" @click.self="cancelConfirm">
        <div class="modal-box" name="modalBox">
          <p class="modal-msg">{{ confirm.message }}</p>
          <div class="modal-btns">
            <button class="modal-btn modal-btn--cancel" @click="cancelConfirm">Mégse</button>
            <button class="modal-btn modal-btn--confirm" name="confirmBtn" @click="doConfirm">Igen, törlöm</button>
          </div>
        </div>
      </div>
    </transition>


    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h1 class="page-title">Adminisztrációs Panel</h1>
      <p class="page-subtitle">Felhasználók és receptek kezelése</p>
    </div>

    <div v-if="isAdmin">

      <!-- ── Felhasználók ── -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">Felhasználók és szerepkörök</h2>
          <button @click="loadUsers" class="btn-refresh">↻ Frissítés</button>
        </div>

        <div v-if="loadingUsers" class="status-msg">Felhasználók betöltése...</div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Szerepkör</th>
                <th>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" name="userRow">
                <td class="td-email" name="userEmail">{{ user.email }}</td>
                <td>
                  <select v-model="user.role" @change="updateRole(user)" class="role-select" name="roleSelector">
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button
                    @click="deleteUser(user)"
                    class="btn-delete"
                    :disabled="user.email === currentEmail"
                  >
                    Törlés
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Jóváhagyásra váró receptek ── -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title" name="recipeSection">Jóváhagyásra váró receptek</h2>
          <button @click="loadAllRecipes" class="btn-refresh">↻ Frissítés</button>
        </div>

        <div v-if="loadingRecipes" class="status-msg">Receptek betöltése...</div>
        <div v-else-if="pendingRecipes.length === 0" class="status-msg">
          ✨ Nincs jóváhagyásra váró recept.
        </div>

        <div v-else class="recipe-grid">
          <div v-for="recipe in pendingRecipes" :key="recipe.id" class="recipe-card" name="Card">
            <div class="card-img-wrap">
              <img
                :src="getImageUrl(recipe)"
                class="card-img"
                @error="handleImgError($event, recipe.id)"
              />
              <span class="badge badge-pending">Jóváhagyásra vár</span>
            </div>
            <div class="card-body">
              <h3 class="card-title" name="cardTitle">{{ recipe.title }}</h3>
              <p class="card-author">{{ recipe.authorEmail }}</p>
              <div class="card-btns">
                <button @click="changeStatus(recipe.id, true)" class="btn-approve" name="apprBtn">✓ Elfogad</button>
                <button @click="deleteRecipe(recipe.id)" class="btn-reject">✕ Elutasít</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Összes recept ── -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">Összes recept kezelése</h2>
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              placeholder="Keresés cím vagy szerző alapján..."
              class="search-input"
              name="searchBox"
            />
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
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
                <td class="td-title" name="recipeTitle" >{{ recipe.title }}</td>
                <td class="td-author">{{ recipe.authorEmail }}</td>
                <td>
                  <span :class="['status-badge', recipe.isApproved ? 'badge-approved' : 'badge-pending-text']">
                    {{ recipe.isApproved ? 'Jóváhagyva' : 'Függőben' }}
                  </span>
                </td>
                <td class="td-actions">
                  <button @click="editRecipe(recipe.id)" class="btn-edit">✏️ Szerkesztés</button>
                  <button @click="deleteRecipe(recipe.id)" class="btn-delete" name="delBtn">Törlés</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { authState } from '@/auth.js'
import { getImageUrl, handleImageError } from '@/utils/imageHelper'

export default {
  name: 'AdminPanel',

  data() {
    return {
      users: [],
      allRecipes: [],
      searchQuery: '',
      loadingUsers: false,
      loadingRecipes: false,
      failedImages: new Set(),
      baseUrl: 'https://localhost:5150',
      confirm: { visible: false, message: '', resolve: null },
      toast: { visible: false, message: '', type: 'success', timer: null }
    }
  },

  computed: {
    isAdmin()      { return authState.isAdmin },
    currentEmail() { return authState.userEmail },
    pendingRecipes() {
      return this.allRecipes.filter(r => r.isApproved === false)
    },
    filteredRecipes() {
      if (!this.searchQuery) return this.allRecipes
      const q = this.searchQuery.toLowerCase()
      return this.allRecipes.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.authorEmail.toLowerCase().includes(q)
      )
    }
  },

  async mounted() {
    if (this.isAdmin) {
      await this.loadUsers()
      await this.loadAllRecipes()
    }
  },

  methods: {
    getImageUrl(recipe) {
      return getImageUrl(recipe.imagePath)
    },
    handleImgError(e, recipeId) {
      this.failedImages.add(recipeId)
      handleImageError(e)
    },

    // ── Toast segédfüggvény ──
    showToast(message, type = 'success') {
      if (this.toast.timer) clearTimeout(this.toast.timer)
      this.toast = {
        visible: true,
        message,
        type,
        timer: setTimeout(() => { this.toast.visible = false }, 3000)
      }
    },

    async loadUsers() {
      this.loadingUsers = true
      try {
        const res = await axios.get(`${this.baseUrl}/api/Users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.users = res.data
      } catch (err) { console.error('Admin - User hiba:', err) }
      finally { this.loadingUsers = false }
    },

    async loadAllRecipes() {
      this.loadingRecipes = true
      try {
        const res = await axios.get(`${this.baseUrl}/api/admin/recipes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.allRecipes = res.data
      } catch (err) { console.error('Admin - Recept hiba:', err) }
      finally { this.loadingRecipes = false }
    },

    async changeStatus(id, isApproved) {
      try {
        await axios.put(
          `${this.baseUrl}/api/admin/recipes/${id}/status`,
          { isApproved },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' } }
        )
        await this.loadAllRecipes()
        this.showToast('Recept sikeresen jóváhagyva!')
      } catch {
        this.showToast('Hiba a státusz módosításakor.', 'error')
      }
    },

    async deleteRecipe(id) {
      const ok = await this.askConfirm('Biztosan törlöd ezt a receptet?')
      if (!ok) return
      try {
        await axios.delete(`${this.baseUrl}/api/Recipes/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        await this.loadAllRecipes()
        this.showToast('Recept sikeresen törölve!')
      } catch {
        this.showToast('Hiba a recept törlésekor.', 'error')
      }
    },

    async updateRole(user) {
      try {
        await axios.put(
          `${this.baseUrl}/api/Users/${user.id}/role`,
          { role: user.role },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
        this.showToast(`${user.email} jogosultsága: ${user.role}`)
      } catch {
        this.showToast('Hiba a szerepkör módosításakor.', 'error')
      }
    },

    async deleteUser(user) {
      const ok = await this.askConfirm(`Biztosan törlöd: ${user.email}?`)
      if (!ok) return
      try {
        await axios.delete(`${this.baseUrl}/api/Users/${user.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        await this.loadUsers()
        this.showToast(`${user.email} sikeresen törölve!`)
      } catch {
        this.showToast('Hiba a felhasználó törlésekor.', 'error')
      }
    },

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
    },

    editRecipe(id) {
      this.$router.push(`/edit-recipe/${id}`)
    }
  }
}
</script>

<style scoped>
/* ── Oldal ── */
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}

/* ── Fejléc ── */
.page-header {
  text-align: center;
  margin-bottom: 40px;
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

/* ── Szekció kártya ── */
.section-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e8e8e4;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e4;
  flex-wrap: wrap;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* ── Frissítés gomb ── */
.btn-refresh {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 50px;
  border: 1.5px solid #e0ddd8;
  background: #f5f5f3;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1;
  width: auto;
}

.btn-refresh:hover {
  border-color: #FF8C00;
  color: #FF8C00;
}

/* ── Status üzenet ── */
.status-msg {
  text-align: center;
  color: #9d9d9d;
  font-size: 0.9rem;
  padding: 32px 0;
}

/* ── Táblázat ── */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 14px;
  border: 1px solid #e8e8e4;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  min-width: 500px;
}

.data-table th {
  background: #fafaf8;
  padding: 12px 16px;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8c8c8c;
  border-bottom: 1px solid #e8e8e4;
}

.data-table td {
  padding: 13px 16px;
  border-bottom: 1px solid #f0ede8;
  color: #444;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover td {
  background: #fafaf8;
}

.td-email {
  font-weight: 500;
  color: #1a1a1a;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-title {
  font-weight: 600;
  color: #1a1a1a;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-author {
  color: #888;
  font-size: 0.82rem;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ── Role select ── */
.role-select {
  padding: 7px 28px 7px 12px;
  border-radius: 10px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.83rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-color: #f5f5f3;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.role-select:focus {
  border-color: #FF8C00;
}

/* ── Státusz badge ── */
.status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 50px;
  white-space: nowrap;
}

.badge-approved {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.badge-pending-text {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

/* ── Gombok ── */
.btn-edit,
.btn-delete,
.btn-approve,
.btn-reject {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  white-space: nowrap;
  width: auto;
}

.btn-edit {
  background: #f0f0ec;
  color: #444;
  border: 1.5px solid #e0ddd8;
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

.btn-delete:hover:not(:disabled) {
  background: #e74c3c;
  border-color: #e74c3c;
  color: white;
}

.btn-delete:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ── Recept kártyák (jóváhagyás) ── */
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.recipe-card {
  background: #f5f5f3;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e8e8e4;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.card-img-wrap {
  position: relative;
  height: 160px;
  background: #e0ddd8;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 50px;
}

.badge-pending {
  background: rgba(217, 119, 6, 0.9);
  color: white;
}

.card-body {
  padding: 16px;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-author {
  font-size: 0.78rem;
  color: #aaa;
  margin: 0 0 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-btns {
  display: flex;
  gap: 8px;
}

.btn-approve {
  flex: 1;
  background: #f0fdf4;
  color: #16a34a;
  border: 1.5px solid #bbf7d0;
}

.btn-approve:hover {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
}

.btn-reject {
  flex: 1;
  background: #fff0f0;
  color: #e74c3c;
  border: 1.5px solid #fcc;
}

.btn-reject:hover {
  background: #e74c3c;
  border-color: #e74c3c;
  color: white;
}

/* ── Kereső ── */
.search-wrap {
  position: relative;
  flex: 1;
  max-width: 340px;
  min-width: 0;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 14px 9px 34px;
  border-radius: 50px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.875rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  background: #fff;
}


/* ── Toast értesítés ── */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 50px;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  white-space: nowrap;
  max-width: calc(100vw - 48px);
  white-space: normal;
  text-align: center;
}

.toast--success {
  background: #77aa3f;
  color: #ffffff;
  border: 1.5px solid #469f40;
}

.toast--error {
  background: #fff0f0;
  color: #e74c3c;
  border: 1.5px solid #fcc;
}

.toast-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.toast-msg {
  line-height: 1.4;
}

/* ── Toast animáció ── */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
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






/* ── Reszponzív ── */
@media (max-width: 768px) {
  .section-card {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-wrap {
    max-width: 100%;
    width: 100%;
  }

  .recipe-grid {
    grid-template-columns: 1fr 1fr;
  }

  .page-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .recipe-grid {
    grid-template-columns: 1fr;
  }

  .td-actions {
    flex-direction: column;
  }
}
</style>