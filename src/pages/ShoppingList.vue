<template>
  <div class="shopping-page fade-in">

    <h2 class="page-title">🛒 Bevásárlólistáim</h2>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

    <!-- ÚJ LISTA LÉTREHOZÁSA -->
    <div class="create-section">
      <input
        v-model="newTitle"
        placeholder="Új bevásárlólista neve..."
        class="input-field"
        @keyup.enter="createList"
      />
      <button class="save-btn" @click="createList">➕ Létrehozás</button>
    </div>

    <div v-if="lists.length === 0" class="empty-state">
      Még nincs bevásárlólistád. Hozz létre egyet!
    </div>

    <!-- LISTA KÁRTYÁK -->
    <div class="lists-grid">
      <div v-for="list in lists" :key="list.id" class="list-card">
        <div class="list-card-header">
          <span class="list-icon">🛒</span>
          <h3 class="list-title">{{ list.title }}</h3>
        </div>
        <div class="list-card-buttons">
          <button class="edit-btn" @click="openEditor(list)">✏️ Módosítás</button>
          <button class="remove-btn" @click="deleteList(list.id)">✕</button>
        </div>
      </div>
    </div>

    <!-- SZERKESZTŐ PANEL (modal) -->
    <div v-if="editingList" class="editor-overlay" @click.self="closeEditor">
      <div class="editor-panel">

        <div class="editor-header">
          <h2 class="editor-title">✏️ {{ editingList.title }}</h2>
          <button class="close-btn" @click="closeEditor">✕</button>
        </div>

        <div class="editor-body">

          <!-- BAL: RECEPT KERESŐ -->
          <div class="editor-col search-col">
            <h3 class="col-title">🔍 Recept keresése</h3>
            <input v-model="recipeSearch" placeholder="Recept neve..." class="input-field" />
            <select v-model="categoryFilter" class="select-field">
              <option value="">Összes kategória</option>
              <option>Leves</option>
              <option>Főétel</option>
              <option>Desszert</option>
            </select>

            <div class="recipe-results">
              <div v-if="filteredRecipes.length === 0" class="empty-state small">Nincs találat.</div>
              <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-result-card">
                <div class="recipe-result-info">
                  <span class="recipe-result-title">{{ recipe.title }}</span>
                  <span class="recipe-result-category">{{ recipe.category }}</span>
                </div>
                <button
                  class="add-recipe-btn"
                  @click="addRecipeToList(recipe)"
                  :disabled="addingRecipeId === recipe.id"
                >
                  {{ addingRecipeId === recipe.id ? '...' : '➕ Hozzáad' }}
                </button>
              </div>
            </div>
          </div>

          <!-- KÖZÉP: HOZZÁADOTT RECEPTEK -->
          <div class="editor-col added-col">
            <h3 class="col-title">🍽️ Hozzáadott receptek</h3>
            <div v-if="addedRecipes.length === 0" class="empty-state small">
              Még nem adtál hozzá receptet.
            </div>
            <div v-for="recipe in addedRecipes" :key="recipe.id" class="added-recipe-card">
              <span class="added-recipe-title">{{ recipe.title }}</span>
              <button class="remove-recipe-btn" @click="removeRecipeFromList(recipe)" title="Eltávolítás">✕</button>
            </div>
          </div>

          <!-- JOBB: ÖSSZESÍTETT LISTA -->
          <div class="editor-col result-col">
            <h3 class="col-title">📋 Bevásárlólista</h3>
            <div v-if="currentListItems.length === 0" class="empty-state small">A lista még üres.</div>
            <div v-for="item in currentListItems" :key="item.name + item.unit" class="shopping-item">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-qty">{{ item.quantity }} {{ item.unit }}</span>
            </div>
          </div>

        </div>

        <div class="editor-footer">
          <button class="cancel-btn" @click="closeEditor">Bezárás</button>
          <button class="save-btn" @click="saveList" :disabled="saving">
            {{ saving ? '⏳ Mentés...' : '💾 Mentés' }}
          </button>
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
      error: null,
      successMessage: null,
      editingList: null,
      allRecipes: [],
      recipeSearch: '',
      categoryFilter: '',
      addedRecipes: [],
      currentListItems: [],
      addingRecipeId: null,
      saving: false,
    }
  },

  computed: {
    filteredRecipes() {
      return this.allRecipes.filter(r => {
        const matchName = r.title.toLowerCase().includes(this.recipeSearch.toLowerCase())
        const matchCat = !this.categoryFilter || r.category === this.categoryFilter
        return matchName && matchCat
      })
    }
  },

  mounted() {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.push('/login')
      return
    }
    this.fetchLists()
    this.fetchAllRecipes()
  },

  methods: {
    authHeaders() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    },

    showSuccess(msg) {
      this.successMessage = msg
      this.error = null
      setTimeout(() => { this.successMessage = null }, 3000)
    },

    showError(msg) {
      this.error = msg
      this.successMessage = null
      setTimeout(() => { this.error = null }, 4000)
    },

    async fetchLists() {
      try {
        const res = await axios.get(`${API}/ShoppingLists`, this.authHeaders())
        this.lists = res.data
      } catch {
        this.lists = []
      }
    },

    async fetchAllRecipes() {
      try {
        const res = await axios.get(`${API}/Recipes?page=1&pageSize=100`)
        this.allRecipes = res.data.items || res.data
      } catch {
        this.allRecipes = []
      }
    },

    async createList() {
      if (!this.newTitle.trim()) {
        this.showError('Add meg a lista nevét!')
        return
      }
      try {
        const res = await axios.post(
          `${API}/ShoppingLists`,
          { title: this.newTitle.trim() },
          this.authHeaders()
        )
        this.lists.push({ id: res.data, title: this.newTitle.trim() })
        this.newTitle = ''
        this.showSuccess('✅ Lista létrehozva!')
      } catch {
        this.showError('Hiba a lista létrehozásakor.')
      }
    },

    async deleteList(id) {
      if (!confirm('Biztosan törlöd ezt a listát?')) return
      try {
        await axios.delete(`${API}/ShoppingLists/${id}`, this.authHeaders())
        this.lists = this.lists.filter(l => l.id !== id)
        this.showSuccess('🗑️ Lista törölve.')
      } catch {
        this.showError('Hiba a törlés során.')
      }
    },

    async openEditor(list) {
      this.editingList = list
      this.recipeSearch = ''
      this.categoryFilter = ''
      try {
        const res = await axios.get(`${API}/ShoppingLists/${list.id}`, this.authHeaders())
        this.currentListItems = res.data.items || []
        this.addedRecipes = res.data.recipes || [] // Receptek betöltése
      } catch {
        this.currentListItems = []
        this.addedRecipes = []
      }
    },

    closeEditor() {
      this.editingList = null
      this.addedRecipes = []
      this.currentListItems = []
    },

    async addRecipeToList(recipe) {
      // ✅ ELTÁVOLÍTVA a duplikáció ellenőrzés - most többször is hozzá lehet adni
      this.addingRecipeId = recipe.id
      try {
        await axios.post(
          `${API}/ShoppingLists/${this.editingList.id}/add-recipe/${recipe.id}`,
          {},
          this.authHeaders()
        )
        this.addedRecipes.push(recipe)
        
        // Frissítjük a jobb oldali összesített listát
        const res = await axios.get(`${API}/ShoppingLists/${this.editingList.id}`, this.authHeaders())
        this.currentListItems = res.data.items || []
        
        this.showSuccess(`✅ "${recipe.title}" hozzáadva!`)
      } catch {
        this.showError('Hiba a recept hozzáadásakor.')
      } finally {
        this.addingRecipeId = null
      }
    },

    async removeRecipeFromList(recipe) {
      // Eltávolítjuk a középső oszlopból
      const indexToRemove = this.addedRecipes.findIndex(r => r.id === recipe.id)
      if (indexToRemove !== -1) {
        this.addedRecipes.splice(indexToRemove, 1)
      }

      try {
        // Meghívjuk az új backend endpointot
        await axios.delete(
          `${API}/ShoppingLists/${this.editingList.id}/remove-recipe/${recipe.id}`,
          this.authHeaders()
        )

        // Frissítjük a jobb oldali listát
        const res = await axios.get(`${API}/ShoppingLists/${this.editingList.id}`, this.authHeaders())
        this.currentListItems = res.data.items || []

        this.showSuccess(`"${recipe.title}" eltávolítva.`)
      } catch {
        this.showError('Hiba az eltávolítás során.')
      }
    },

    async saveList() {
      this.saving = true
      await new Promise(r => setTimeout(r, 400))
      this.saving = false
      this.showSuccess('💾 Lista elmentve!')
      setTimeout(() => this.closeEditor(), 800)
    }
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

.shopping-page { max-width: 1200px; margin: 40px auto; padding: 0 20px; }

.page-title {
  font-size: 1.75rem; font-weight: bold; margin-bottom: 24px;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

.error-message {
  color: #e74c3c; background: #fee; border: 2px solid #fcc;
  padding: 12px 16px; border-radius: 10px; margin-bottom: 16px;
  font-weight: 600; animation: shake 0.4s;
}
.success-message {
  color: #27ae60; background: #efe; border: 2px solid #cfc;
  padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-weight: 600;
}

.create-section { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }

.input-field {
  flex: 1; min-width: 200px; padding: 10px 14px; border-radius: 10px;
  border: 2px solid #ddd; font-size: 1rem; background: white;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.input-field:focus { outline: none; border-color: #FF8C00; box-shadow: 0 0 0 3px rgba(255,140,0,0.1); }

.select-field {
  width: 100%; padding: 10px 14px; border-radius: 10px; border: 2px solid #ddd;
  font-size: 1rem; background: white; cursor: pointer; margin-top: 10px;
}
.select-field:focus { outline: none; border-color: #FF8C00; }

.lists-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }

.list-card {
  background: linear-gradient(180deg, rgba(255,165,0,0.45), rgba(255,165,0,0.05));
  border-radius: 14px; padding: 20px; display: flex; flex-direction: column;
  gap: 16px; transition: transform 0.3s, box-shadow 0.3s; animation: fadeIn 0.5s forwards;
}
.list-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,0.12); }

.list-card-header { display: flex; align-items: center; gap: 10px; }
.list-icon { font-size: 1.4rem; }
.list-title { font-size: 1.1rem; font-weight: 700; color: #4a4a4a; margin: 0; flex: 1; }
.list-card-buttons { display: flex; gap: 10px; justify-content: flex-end; }

.save-btn {
  padding: 10px 20px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #FF8C00, #FFD700); color: white;
  font-weight: 700; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255,140,0,0.3); font-size: 0.95rem; white-space: nowrap;
}
.save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,140,0,0.4); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.cancel-btn {
  padding: 10px 20px; border-radius: 10px; border: 2px solid #bbb;
  background: white; color: #555; font-weight: 600; cursor: pointer; transition: all 0.3s;
}
.cancel-btn:hover { background: #f5f5f5; border-color: #999; }

.edit-btn {
  padding: 8px 14px; border-radius: 8px; border: none;
  background: linear-gradient(135deg, #FF8C00, #FFD700); color: white;
  font-weight: 600; cursor: pointer; transition: all 0.25s;
}
.edit-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255,140,0,0.3); }

.remove-btn {
  padding: 8px 12px; border-radius: 8px; border: none;
  background: linear-gradient(135deg, #e74c3c, #c0392b); color: white;
  font-weight: bold; cursor: pointer; transition: all 0.25s; font-size: 1rem;
}
.remove-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(231,76,60,0.35); }

/* ===== MODAL OVERLAY ===== */
.editor-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 2000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px; backdrop-filter: blur(3px);
}
.editor-panel {
  background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%);
  border-radius: 20px; width: 100%; max-width: 1100px; max-height: 88vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25); overflow: hidden; animation: fadeIn 0.3s;
}
.editor-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 28px 16px; border-bottom: 1px solid rgba(0,0,0,0.08);
}
.editor-title { font-size: 1.4rem; font-weight: 700; color: #e67e22; margin: 0; }
.close-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #888; }
.close-btn:hover { color: #e74c3c; }

.editor-body {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  flex: 1; overflow: hidden;
}
.editor-col {
  padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
}
.search-col { background: rgba(255,255,255,0.7); border-right: 1px solid rgba(0,0,0,0.08); }
.added-col  { background: rgba(255,255,255,0.5); border-right: 1px solid rgba(0,0,0,0.08); }
.result-col { background: rgba(255,255,255,0.35); }

.col-title {
  font-size: 1rem; font-weight: 700; color: #e67e22; margin: 0 0 4px;
  padding-bottom: 8px; border-bottom: 2px solid rgba(255,140,0,0.2);
}

.recipe-results { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }

.recipe-result-card {
  background: white; border-radius: 10px; padding: 10px 12px;
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06); transition: box-shadow 0.2s;
}
.recipe-result-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.recipe-result-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.recipe-result-title { font-weight: 600; font-size: 0.88rem; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.recipe-result-category { font-size: 0.75rem; color: #888; }

.add-recipe-btn {
  padding: 6px 10px; border-radius: 7px; border: none;
  background: linear-gradient(135deg, #27ae60, #2ecc71); color: white;
  font-weight: 600; font-size: 0.8rem; cursor: pointer; white-space: nowrap;
  box-shadow: 0 2px 6px rgba(46,204,113,0.3); transition: all 0.2s;
}
.add-recipe-btn:hover:not(:disabled) { transform: translateY(-1px); }
.add-recipe-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.added-recipe-card {
  background: white; border-radius: 10px; padding: 10px 12px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06); animation: fadeIn 0.3s;
}
.added-recipe-title { font-weight: 600; font-size: 0.88rem; color: #333; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.remove-recipe-btn {
  background: #e74c3c; color: white; border: none; border-radius: 6px;
  width: 26px; height: 26px; font-size: 0.8rem; font-weight: bold; cursor: pointer;
  flex-shrink: 0; transition: background 0.2s, transform 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.remove-recipe-btn:hover { background: #c0392b; transform: scale(1.1); }

.shopping-item {
  background: white; border-radius: 10px; padding: 10px 12px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06); animation: fadeIn 0.3s;
}
.item-name { font-weight: 600; font-size: 0.88rem; color: #333; }
.item-qty  { font-size: 0.88rem; color: #e67e22; font-weight: 700; white-space: nowrap; }

.editor-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  padding: 16px 24px; border-top: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.5);
}

.empty-state { text-align: center; color: #aaa; font-style: italic; padding: 40px 20px; }
.empty-state.small { padding: 20px 10px; font-size: 0.9rem; }

.fade-in { animation: fadeIn 0.5s ease forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

@media (max-width: 900px) {
  .editor-body { grid-template-columns: 1fr; }
  .search-col, .added-col { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); }
}
@media (max-width: 600px) {
  .create-section { flex-direction: column; }
  .lists-grid { grid-template-columns: 1fr; }
}
</style>