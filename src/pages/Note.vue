<template>
  <div class="note-page fade-in">
    <h1 class="page-title">📝 Személyes Jegyzetek</h1>

    <div class="glass-box note-card">
      <div class="note-header">
        <h3>Saját konyhai feljegyzéseim</h3>
        <p class="subtitle">Ötletek, receptek vagy bevásárlási emlékeztetők tárolása.</p>
      </div>

      <div class="textarea-container">
        <textarea 
          v-model="content" 
          placeholder="Írj ide valami okosat... (pl. a nagyi titkos trükkje a rántáshoz)" 
          class="note-textarea"
          @input="updateStatus"
        ></textarea>
      </div>

      <div class="note-footer">
        <span class="status-msg" v-if="status">{{ status }}</span>
        <button class="save-btn" @click="saveNote">💾 Jegyzet Mentése</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotePage',
  data() {
    return {
      content: '',
      status: ''
    }
  },
  mounted() {
    // Betöltés a böngésző helyi tárolójából (LocalStorage)
    const savedContent = localStorage.getItem('user_cooking_notes');
    if (savedContent) {
      this.content = savedContent;
    }
  },
  methods: {
    saveNote() {
      // Elmentjük a memóriába
      localStorage.setItem('user_cooking_notes', this.content);
      
      this.status = '✅ Sikeresen mentve a gépére!';
      setTimeout(() => { this.status = '' }, 3000);
    },
    updateStatus() {
      this.status = '✍️ Módosítás folyamatban... (ne felejts el menteni!)';
    }
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }

.note-page {
  max-width: 850px;
  margin: 60px auto;
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
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.25), rgba(255, 165, 0, 0.05));
  backdrop-filter: blur(15px);
  border-radius: 24px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.note-header { margin-bottom: 20px; }
.note-header h3 { color: #333; font-weight: 700; margin: 0; }
.subtitle { color: #666; font-size: 0.9rem; margin-top: 5px; }

.note-textarea {
  width: 100%;
  min-height: 380px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 140, 0, 0.2);
  background: rgba(255, 255, 255, 0.9);
  font-family: inherit;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
}

.note-textarea:focus {
  background: #ffffff;
  border-color: #FF8C00;
  box-shadow: 0 0 15px rgba(255, 140, 0, 0.15);
}

.note-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-msg {
  font-size: 0.9rem;
  color: #e67e22;
  font-weight: 600;
}

.save-btn {
  background: linear-gradient(135deg, #FF8C00, #FF4500);
  color: white;
  border: none;
  padding: 12px 35px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 69, 0, 0.2);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 69, 0, 0.4);
}

.fade-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>