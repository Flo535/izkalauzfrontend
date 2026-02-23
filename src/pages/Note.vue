<template>
  <div class="note-page fade-in">
    <h1 class="page-title">📝 Személyes Jegyzetek</h1>

    <div class="glass-box note-card">
      <div class="note-header">
        <h3>Saját konyhai feljegyzéseim</h3>
        <p class="subtitle">Ötletek, receptek vagy bevásárlási emlékeztetők tárolása a felhőben.</p>
      </div>

      <div class="textarea-container">
        <textarea 
          v-model="content" 
          placeholder="Írj ide valami okosat... (pl. a nagyi titkos trükkje a rántáshoz)" 
          class="note-textarea"
          :class="{ 'input-error': content.length > 300 }"
          @input="updateStatus"
        ></textarea>
        <div class="char-count" :class="{ 'text-danger': content.length > 300 }">
          {{ content.length }} / 300
        </div>
      </div>

      <div class="note-footer">
        <span class="status-msg" v-if="status">{{ status }}</span>
        <button 
          class="save-btn" 
          @click="saveNote" 
          :disabled="content.length > 300 || !isLoggedIn"
        >
          💾 Jegyzet Mentése
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'NotePage',
  data() {
    return {
      content: '',
      status: '',
      isLoggedIn: false,
      // FONTOS: Győződj meg róla, hogy a Backend fut, és ez a címe!
      apiUrl: 'https://localhost:5150/api/Notes' 
    }
  },
  async mounted() {
    // Ellenőrizd a böngészőben (F12 -> Application -> LocalStorage), 
    // hogy tényleg "token" a kulcs neve!
    const token = localStorage.getItem('token');
    
    if (token) {
      this.isLoggedIn = true;
      await this.fetchNote();
    } else {
      this.status = '⚠️ Kérlek, jelentkezz be a jegyzetek használatához!';
    }
  },
  methods: {
    async fetchNote() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${this.apiUrl}/mine`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        // A Backend "text" mezőben küldi vissza a tartalmat
        this.content = response.data.text || '';
      } catch (error) {
        console.error("Betöltési hiba részletei:", error.response);
        if (error.response && error.response.status === 401) {
          this.status = '❌ Nincs jogosultságod (401). Jelentkezz be újra!';
          this.isLoggedIn = false;
        } else {
          this.status = '❌ Nem sikerült elérni a szervert.';
        }
      }
    },

    async saveNote() {
      if (this.content.length > 300) {
        this.status = '⚠️ Max 300 karakter!';
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        this.status = '⚠️ Bejelentkezés szükséges!';
        return;
      }

      try {
        // A mentésnél a JSON objektum kulcsa "text" legyen, mert a NoteDto ezt várja!
        await axios.put(`${this.apiUrl}/mine`, 
          { text: this.content }, 
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
        
        this.status = '✅ Mentve a felhőbe!';
        setTimeout(() => { this.status = '' }, 3000);
      } catch (error) {
        console.error("Mentési hiba részletei:", error.response);
        this.status = `❌ Mentés sikertelen (${error.response?.status || 'Szerver nem elérhető'})`;
      }
    },

    updateStatus() {
      if (this.content.length > 300) {
        this.status = '❗ Túl hosszú!';
      } else {
        this.status = '✍️ Szerkesztés...';
      }
    }
  }
}
</script>

<style scoped>
/* A stílusok változatlanok a látványos dizájn érdekében */
.note-page { max-width: 850px; margin: 60px auto; padding: 0 20px; }
.page-title { text-align: center; font-weight: bold; font-size: 2.2rem; background: linear-gradient(to right, #FF8C00, #FFD700); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 30px; }
.glass-box { background: linear-gradient(180deg, rgba(255, 165, 0, 0.25), rgba(255, 165, 0, 0.05)); backdrop-filter: blur(15px); border-radius: 24px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.textarea-container { position: relative; width: 100%; }
.note-textarea { width: 100%; min-height: 380px; padding: 20px; border-radius: 16px; border: 1px solid rgba(255, 140, 0, 0.2); background: rgba(255, 255, 255, 0.9); font-family: inherit; font-size: 1.1rem; line-height: 1.6; color: #2c3e50; resize: vertical; outline: none; transition: all 0.3s ease; }
.input-error { border-color: #ff4d4d !important; }
.char-count { position: absolute; bottom: 15px; right: 20px; font-size: 0.85rem; color: #888; font-weight: 600; }
.text-danger { color: #ff4d4d !important; }
.note-footer { margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
.status-msg { font-size: 0.9rem; color: #e67e22; font-weight: 600; }
.save-btn { background: linear-gradient(135deg, #FF8C00, #FF4500); color: white; border: none; padding: 12px 35px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; }
.save-btn:disabled { background: #ccc; cursor: not-allowed; }
.fade-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>