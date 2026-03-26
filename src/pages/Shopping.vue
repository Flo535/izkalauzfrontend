<template>
  <div class="shopping-page">

    <!-- Fejléc -->
    <div class="page-header">
      <p class="page-label">IzKalauz</p>
      <h1 class="page-title">Bevásárlólista</h1>
      <p class="page-subtitle">Minden ami kell a főzéshez</p>
    </div>

    <div class="shopping-card">

      <!-- Input sor -->
      <div class="input-row">
        <input
          v-model="newItem"
          @keyup.enter="addItem"
          placeholder="Mit kell venni?"
          class="item-input"
        />
        <button @click="addItem" class="btn-add">+ Hozzáadás</button>
      </div>

      <!-- Üres állapot -->
      <div v-if="items.length === 0" class="empty-state">
        <span class="empty-icon">🛒</span>
        <p>A lista üres. Adj hozzá valamit!</p>
      </div>

      <!-- Lista -->
      <ul v-else class="shopping-list">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="list-item"
          :class="{ 'is-bought': item.bought }"
        >
          <label class="item-label">
            <input
              type="checkbox"
              v-model="item.bought"
              @change="saveItems"
              class="item-checkbox"
            />
            <span class="checkmark"></span>
            <span class="item-text">{{ item.text }}</span>
          </label>
          <button @click="removeItem(index)" class="btn-remove" title="Törlés">✕</button>
        </li>
      </ul>

      <!-- Műveletek -->
      <div v-if="items.length > 0" class="action-row">
        <button @click="clearBought" class="btn-secondary">Kész tételek törlése</button>
        <button @click="clearAll" class="btn-danger">🧹 Összes törlése</button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Shopping',

  data() {
    return {
      newItem: '',
      items: []
    }
  },

  mounted() {
    const saved = localStorage.getItem('shopping-list')
    if (saved) {
      this.items = JSON.parse(saved)
    }
  },

  methods: {
    addItem() {
      if (this.newItem.trim() === '') return
      this.items.push({ text: this.newItem.trim(), bought: false })
      this.newItem = ''
      this.saveItems()
    },

    removeItem(index) {
      this.items.splice(index, 1)
      this.saveItems()
    },

    clearBought() {
      this.items = this.items.filter(i => !i.bought)
      this.saveItems()
    },

    clearAll() {
      if (confirm('Biztosan törölni akarod az egész listát?')) {
        this.items = []
        this.saveItems()
      }
    },

    saveItems() {
      localStorage.setItem('shopping-list', JSON.stringify(this.items))
    }
  }
}
</script>

<style scoped>
/* ── Oldal ── */
.shopping-page {
  max-width: 640px;
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
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #999;
  margin: 0;
}

/* ── Kártya ── */
.shopping-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid #e8e8e4;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* ── Input sor ── */
.input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.item-input {
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

.item-input:focus {
  border-color: #FF8C00;
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.1);
  background: #fff;
}

.btn-add {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 11px 20px;
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

.btn-add:hover {
  background: #FF8C00;
  transform: translateY(-1px);
}

/* ── Üres állapot ── */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: #ccc;
}

.empty-icon {
  font-size: 2.4rem;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 0.9rem;
  margin: 0;
}

/* ── Lista ── */
.shopping-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-radius: 14px;
  background: #f5f5f3;
  border: 1.5px solid transparent;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.list-item:hover {
  border-color: #e0ddd8;
}

.list-item.is-bought {
  background: #fafaf8;
  opacity: 0.6;
}

/* ── Egyéni checkbox ── */
.item-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.item-checkbox {
  display: none; /* elrejtjük, helyette .checkmark */
}

.checkmark {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 6px;
  border: 2px solid #dddad4;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, border-color 0.2s ease;
  position: relative;
}

.item-checkbox:checked + .checkmark {
  background: #FF8C00;
  border-color: #FF8C00;
}

.item-checkbox:checked + .checkmark::after {
  content: '';
  display: block;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg) translate(-1px, -1px);
}

.item-text {
  font-size: 0.9rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.is-bought .item-text {
  text-decoration: line-through;
  color: #bbb;
}

/* ── Törlés gomb ── */
.btn-remove {
  flex-shrink: 0;
  width: auto;
  padding: 5px 10px;
  border-radius: 50px;
  border: 1.5px solid #fcc;
  background: #fff0f0;
  color: #e74c3c;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  line-height: 1;
  margin-left: 10px;
}

.btn-remove:hover {
  background: #ffe0e0;
}

/* ── Műveletek ── */
.action-row {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid #e8e8e4;
}

.btn-secondary,
.btn-danger {
  font-family: 'DM Sans', 'Poppins', sans-serif;
  font-size: 0.83rem;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
  width: auto;
}

.btn-secondary {
  background: transparent;
  color: #666;
  border: 1.5px solid #dddad4;
}

.btn-secondary:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
}

.btn-danger {
  background: #fff0f0;
  color: #e74c3c;
  border: 1.5px solid #fcc;
}

.btn-danger:hover {
  background: #e74c3c;
  border-color: #e74c3c;
  color: white;
}

/* ── Reszponzív ── */
@media (max-width: 480px) {
  .shopping-card {
    padding: 20px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .action-row {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-danger {
    text-align: center;
    justify-content: center;
  }
}
</style>