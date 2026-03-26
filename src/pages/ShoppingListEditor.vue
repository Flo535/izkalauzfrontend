<template>
  <div class="editor-page">

    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h1 class="page-title">{{ listTitle }}</h1>
      <p class="page-subtitle">Adj hozzá recepteket a bevásárlólistádhoz</p>
    </div>

    <!-- 3 oszlopos editor -->
    <div class="editor-body">

      <!-- BAL: Recept kereső -->
      <div class="editor-col">
        <h3 class="col-title">Recept keresése</h3>

        <div class="search-inputs">
          <input
            v-model="recipeSearch"
            placeholder="Recept neve..."
            class="col-input"
            name="rNameSearchText"
          />
          <select v-model="categoryFilter" class="col-select">
            <option value="">Összes kategória</option>
            <option>Leves</option>
            <option>Főétel</option>
            <option>Desszert</option>
          </select>
        </div>

        <div class="col-scroll">
          <div v-if="filteredRecipes.length === 0" class="col-empty">
            Nincs találat.
          </div>
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            class="recipe-row"
          >
            <div class="recipe-row-info">
              <router-link
                :to="`/recept/${recipe.id}`"
                class="recipe-row-title"
                target="_blank"
              >
                {{ recipe.title }}
              </router-link>
              <span class="recipe-row-cat">{{ recipe.category }}</span>
            </div>
            <button
              class="btn-add-recipe"
              name="btnAddRecipe"
              @click="addRecipeToList(recipe)"
              :disabled="addingRecipeId === recipe.id"
            >
              {{ addingRecipeId === recipe.id ? '...' : '+ Hozzáad' }}
            </button>
          </div>
        </div>
      </div>

      <!-- KÖZÉP: Hozzáadott receptek -->
      <div class="editor-col">
        <h3 class="col-title">Hozzáadott receptek</h3>

        <div class="col-scroll">
          <div v-if="addedRecipes.length === 0" class="col-empty">
            Még nem adtál hozzá receptet.
          </div>
          <div
            v-for="recipe in addedRecipes"
            :key="recipe.id"
            class="added-row"
          >
            <span class="added-row-title">{{ recipe.title }}</span>
            <button
              class="btn-remove-recipe"
              @click="removeRecipeFromList(recipe)"
              title="Eltávolítás"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- JOBB: Összesített lista -->
      <div class="editor-col">
        <h3 class="col-title">Bevásárlólista</h3>

        <div class="col-scroll">
          <div v-if="currentListItems.length === 0" class="col-empty">
            A lista még üres.
          </div>
          <div
            v-for="item in currentListItems"
            :key="item.name + item.unit"
            class="list-item-row"
          >
            <span class="list-item-name">{{ item.name }}</span>
            <span class="list-item-qty">{{ item.quantity }} {{ item.unit }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Mentés -->
    <div class="editor-footer">
      <button @click="$router.push('/vasarlas')" class="btn-secondary">← Vissza</button>
      <button class="btn-primary" name="saveListBtn" @click="saveList" :disabled="saving">
        {{ saving ? '⏳ Mentés...' : '💾 Mentés' }}
      </button>
    </div>

  </div>
</template>

<script>
import axios from 'axios'

const API = 'https://localhost:5150/api'

export default {
  name: 'ShoppingListEditor',

  data() {
    return {
      listId: null,
      listTitle: '',
      allRecipes: [],
      recipeSearch: '',
      categoryFilter: '',
      addedRecipes: [],
      currentListItems: [],
      addingRecipeId: null,
      saving: false
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
    this.listId = this.$route.params.id
    this.fetchList()
    this.fetchAllRecipes()
  },

  methods: {
    authHeaders() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    },

    async fetchList() {
      try {
        const res = await axios.get(`${API}/ShoppingLists/${this.listId}`, this.authHeaders())
        this.listTitle = res.data.title
        this.currentListItems = res.data.items || []
        this.addedRecipes = res.data.recipes || []
      } catch (err) {
        console.error('Hiba a lista betöltésekor:', err)
        this.currentListItems = []
        this.addedRecipes = []
      }
    },

    async saveList() {
      this.saving = true
      await new Promise(r => setTimeout(r, 400))
      this.saving = false
      this.$router.push('/vasarlas')
    },

    async fetchAllRecipes() {
      try {
        const res = await axios.get(`${API}/Recipes?page=1&pageSize=100`)
        this.allRecipes = res.data.items || res.data
      } catch {
        this.allRecipes = []
      }
    },

    async addRecipeToList(recipe) {
      this.addingRecipeId = recipe.id
      try {
        await axios.post(
          `${API}/ShoppingLists/${this.listId}/add-recipe/${recipe.id}`,
          {},
          this.authHeaders()
        )
        this.addedRecipes.push(recipe)
        const res = await axios.get(`${API}/ShoppingLists/${this.listId}`, this.authHeaders())
        this.currentListItems = res.data.items || []
      } catch (err) {
        console.error('Hiba a recept hozzáadásakor:', err)
      } finally {
        this.addingRecipeId = null
      }
    },

    async removeRecipeFromList(recipe) {
      const idx = this.addedRecipes.findIndex(r => r.id === recipe.id)
      if (idx !== -1) this.addedRecipes.splice(idx, 1)
      try {
        await axios.delete(
          `${API}/ShoppingLists/${this.listId}/remove-recipe/${recipe.id}`,
          this.authHeaders()
        )
        const res = await axios.get(`${API}/ShoppingLists/${this.listId}`, this.authHeaders())
        this.currentListItems = res.data.items || []
      } catch (err) {
        console.error('Hiba az eltávolítás során:', err)
      }
    }
  }
}
</script>

<style scoped>
/* ── Oldal ── */
.editor-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 60px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 140px);
  box-sizing: border-box;
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
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 8px;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  word-break: break-word;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #999;
  margin: 0;
}

/* ── Editor body ── */
.editor-body {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* ── Oszlop ── */
.editor-col {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e8e8e4;
  padding: 22px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 480px;
  overflow-y: auto;
}

.col-title {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e4;
  flex-shrink: 0;
}

/* ── Kereső inputok ── */
.search-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.col-input,
.col-select {
  width: 100%;
  padding: 9px 14px;
  border-radius: 12px;
  border: 1.5px solid #e8e8e4;
  background: #f5f5f3;
  font-size: 0.875rem;
  font-family: 'DM Sans', 'Poppins', sans-serif;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.col-input:focus,
.col-select:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  background: #fff;
}

.col-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-color: #f5f5f3;
  padding-right: 32px;
  cursor: pointer;
}

/* ── Görgetős tartalom ── */
.col-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scrollbar-width: thin;
  scrollbar-color: #e0ddd8 transparent;
  padding-right: 2px;
}

.col-scroll::-webkit-scrollbar { width: 4px; }
.col-scroll::-webkit-scrollbar-thumb { background: #e0ddd8; border-radius: 4px; }

/* ── Üres állapot ── */
.col-empty {
  text-align: center;
  color: #ccc;
  font-size: 0.85rem;
  padding: 32px 12px;
}

/* ── Recept sor (bal oszlop) ── */
.recipe-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #f5f5f3;
  border-radius: 12px;
  padding: 10px 12px;
  transition: background 0.2s ease;
}

.recipe-row:hover {
  background: #eeecea;
}

.recipe-row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.recipe-row-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #FF8C00;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  transition: color 0.2s ease;
}

.recipe-row-title:hover {
  color: #d97000;
  text-decoration: underline;
}

.recipe-row-cat {
  font-size: 0.72rem;
  color: #aaa;
}

.btn-add-recipe {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 50px;
  border: none;
  background: #1a1a1a;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-add-recipe:hover:not(:disabled) {
  background: #FF8C00;
}

.btn-add-recipe:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Hozzáadott sor (közép oszlop) ── */
.added-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #f5f5f3;
  border-radius: 12px;
  padding: 10px 12px;
}

.added-row-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-remove-recipe {
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 50px;
  border: 1.5px solid #fcc;
  background: #fff0f0;
  color: #e74c3c;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-remove-recipe:hover {
  background: #ffe0e0;
}

/* ── Lista sor (jobb oszlop) ── */
.list-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f3;
  border-radius: 12px;
  padding: 10px 12px;
  gap: 10px;
}

.list-item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-qty {
  font-size: 0.82rem;
  font-weight: 700;
  color: #FF8C00;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Footer ── */
.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e4;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-primary {
  background: #1a1a1a;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.btn-primary:hover:not(:disabled) {
  background: #FF8C00;
  box-shadow: 0 4px 14px rgba(255, 140, 0, 0.3);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #666;
  border: 1.5px solid #dddad4;
}

.btn-secondary:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
  transform: translateY(-1px);
}

/* ── Reszponzív ── */
@media (max-width: 1024px) {
  .editor-body {
    grid-template-columns: 1fr 1fr;
  }

  .editor-col:last-child {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .editor-body {
    grid-template-columns: 1fr;
  }

  .editor-col:last-child {
    grid-column: 1;
  }

  .editor-col {
    min-height: 320px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .editor-footer {
    justify-content: stretch;
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    text-align: center;
    justify-content: center;
  }
}
</style>