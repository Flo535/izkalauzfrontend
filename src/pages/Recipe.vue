<template>
  <div class="recipe-page glass-box">
    <div class="header-row">
      <h1>Receptek</h1>
      <button class="add-btn" @click="addRecipe">+ Új recept</button>
    </div>

    <RecipeList />
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'RecipePage',
  mounted() {
    api.get('/Recipes/ping')
      .then(res => console.log('✅ Backend válasz:', res.data))
      .catch(err => console.error('❌ Hiba:', err))
  }
}

</script>

<style scoped>
.recipe-page {
  max-width: 1200px;
  margin: 20px auto;
  padding: 40px 20px;
}

/* ===== GLASS EFFECT ===== */
.glass-box {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

/* ===== HEADER SOR ===== */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.recipe-page h1 {
  font-size: 2.4rem;
  color: #2c3e50;
  margin: 0;
  font-weight: bold;
}

/* ===== ADD NEW BUTTON GLASS STYLE ===== */
.add-btn {
  padding: 10px 18px;
  font-size: 1rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.add-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.05);
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}

.add-btn:active {
  transform: scale(0.98);
}

/* ===== MOBILE ===== */
@media (max-width: 768px) {
  .header-row {
    flex-direction: column;
    gap: 15px;
  }

  .add-btn {
    width: 100%;
  }
}
</style>
