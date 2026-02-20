<template>
  <div class="shopping-container fade-in">
    <h1 class="page-title">🛒 Bevásárlólista</h1>

    <div class="glass-box">
      <div class="input-section">
        <input 
          v-model="newItem" 
          @keyup.enter="addItem" 
          placeholder="Mit kell venni?" 
          class="item-input"
        />
        <button @click="addItem" class="add-btn">➕ Hozzáadás</button>
      </div>

      <div v-if="items.length === 0" class="empty-msg">
        🍳 A lista üres. Kezdj el hozzáadni valamit a főzéshez!
      </div>

      <ul class="shopping-list">
        <li v-for="(item, index) in items" :key="index" class="list-item">
          <div class="item-left">
            <input type="checkbox" v-model="item.bought" @change="saveItems" class="check-input" />
            <span :class="{ 'bought-text': item.bought }">{{ item.text }}</span>
          </div>
          <button @click="removeItem(index)" class="delete-link">🗑️ Törlés</button>
        </li>
      </ul>

      <div class="actions" v-if="items.length > 0">
        <button @click="clearBought" class="secondary-btn">Kész tételek törlése</button>
        <button @click="clearAll" class="danger-btn">🧹 Összes törlése</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Shopping",
  data() {
    return {
      newItem: "",
      items: []
    };
  },
  mounted() {
    const saved = localStorage.getItem("shopping-list");
    if (saved) {
      this.items = JSON.parse(saved);
    }
  },
  methods: {
    addItem() {
      if (this.newItem.trim() === "") return;
      this.items.push({
        text: this.newItem,
        bought: false
      });
      this.newItem = "";
      this.saveItems();
    },
    removeItem(index) {
      this.items.splice(index, 1);
      this.saveItems();
    },
    clearBought() {
      this.items = this.items.filter(i => !i.bought);
      this.saveItems();
    },
    clearAll() {
      if (confirm("Biztosan törölni akarod az egész listát?")) {
        this.items = [];
        this.saveItems();
      }
    },
    saveItems() {
      localStorage.setItem("shopping-list", JSON.stringify(this.items));
    }
  }
};
</script>

<style scoped>
.shopping-container {
  max-width: 700px;
  margin: 80px auto;
  padding: 0 20px;
}

.page-title {
  text-align: center;
  font-weight: bold;
  font-size: 2.2rem;
  background: linear-gradient(to right, #FF8C00, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 30px;
}

.glass-box {
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.3), rgba(255, 165, 0, 0.05));
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
}

.item-input {
  flex: 1;
  padding: 12px 15px;
  border-radius: 12px;
  border: 1px solid rgba(255, 140, 0, 0.2);
  outline: none;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
}

.item-input:focus {
  border-color: #ff8c00;
  background: white;
}

.add-btn {
  background: linear-gradient(135deg, #FF8C00, #FF4500);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

.add-btn:hover {
  transform: scale(1.05);
}

.shopping-list {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.list-item:hover {
  transform: translateX(5px);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.check-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #ff8c00;
}

.bought-text {
  text-decoration: line-through;
  color: #aaa;
}

.delete-link {
  background: none;
  border: none;
  color: #ff4757;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
}

.actions {
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid #ddd;
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}

.secondary-btn:hover {
  background: #eee;
}

.danger-btn {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.3);
  padding: 10px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}

.danger-btn:hover {
  background: #ff4757;
  color: white;
}

.empty-msg {
  text-align: center;
  color: #666;
  padding: 30px;
  font-style: italic;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>