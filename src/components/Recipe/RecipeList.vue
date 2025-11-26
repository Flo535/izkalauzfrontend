<template>
  <div class="recipe-list">
    <div
      v-for="recipe in recipes"
      :key="recipe.id"
      class="recipe-card"
    >
      <!-- Recept címe -->
      <h3 class="recipe-title">
        <span class="recipe-icon">🍽️</span>
        {{ recipe.title }}
      </h3>

      <!-- Hozzávalók -->
      <p v-if="recipe.ingredients?.length" class="recipe-ingredients">
        Hozzávalók: {{ recipe.ingredients.join(', ') }}
      </p>

      <!-- Elkészítés / leírás görgethető -->
      <div class="recipe-description-wrapper">
        <p class="recipe-description">{{ recipe.description }}</p>
      </div>

      <!-- Szerző a végére -->
      <p v-if="recipe.authorEmail" class="recipe-author">
        👤 {{ recipe.authorEmail }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    recipes: Array,
    isLoggedIn: Boolean
  }
}
</script>

<style scoped>
.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 10px;
}

/* Kártya */
.recipe-card {
  background-color: rgba(200, 255, 200, 0.3); /* enyhe zöld */
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 280px;
  max-height: 400px;
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.4s ease;
  opacity: 0;
  animation: fadeIn 0.6s forwards;
}

/* Fade-in animáció */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Hover effekt */
.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Recept címe */
.recipe-title {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  background: linear-gradient(90deg, orange, red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
}

/* Ikon a cím előtt */
.recipe-title .recipe-icon {
  margin-right: 6px;
  color: white;           /* FEHÉR IKON */
  -webkit-text-fill-color: initial; /* ne legyen átmenetes */
  font-size: 1.2rem;
}

/* Hozzávalók */
.recipe-ingredients {
  margin: 4px 0 0 0;
  font-size: 0.9rem;
}

/* Leírás wrapper - scroll alul */
.recipe-description-wrapper {
  margin-top: auto;
  max-height: 120px;
  overflow-y: auto;
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 6px;
  scroll-behavior: smooth;
}

/* Szebb scroll sáv (Webkit és Firefox) */
.recipe-description-wrapper::-webkit-scrollbar {
  width: 6px;
}

.recipe-description-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 128, 0, 0.05);
  border-radius: 3px;
}

.recipe-description-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 128, 0, 0.3);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.recipe-description-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 128, 0, 0.5);
}

/* Firefox scroll */
.recipe-description-wrapper {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,128,0,0.3) rgba(0,128,0,0.05);
}

/* Leírás */
.recipe-description {
  margin: 0;
  white-space: pre-wrap;
}

/* Szerző */
.recipe-author {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #555;
  text-align: right;
}

/* Mobilbarát finomítások */
@media (max-width: 600px) {
  .recipe-card {
    min-height: 220px;
    padding: 16px;
  }
  .recipe-title {
    font-size: 1.1rem;
  }
  .recipe-description-wrapper {
    max-height: 100px;
  }
}
</style>
