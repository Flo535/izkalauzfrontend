<template>
  <div class="recipe-list">
    <div
      v-for="recipe in recipes"
      :key="recipe.id"
      class="recipe-card"
    >
      <!-- Recept kép vagy "Nincs kép" -->
      <div v-if="recipe.imagePath" class="recipe-image-wrapper">
        <img
          :src="fullImagePath(recipe.imagePath)"
          :alt="recipe.title"
          class="recipe-image"
          @error="onImageError($event)"
        />
      </div>
      <div v-else class="recipe-no-image">
        Nincs kép
      </div>

      <!-- Recept címe -->
      <h3 class="recipe-title">
        <span class="recipe-icon">🍽️</span>
        {{ recipe.title }}
      </h3>

      <!-- Hozzávalók (opcionális, ha szeretnéd) -->
      <p v-if="recipe.ingredients?.length" class="recipe-ingredients">
        Hozzávalók: {{ recipe.ingredients.join(', ') }}
      </p>

      <!-- Elkészítés / leírás görgethető -->
      <div class="recipe-description-wrapper">
        <p class="recipe-description">{{ recipe.description }}</p>
      </div>

      <!-- Szerző (opcionális) -->
      <p v-if="recipe.authorEmail" class="recipe-author">
        👤 {{ recipe.authorEmail }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    recipes: Array
  },
  methods: {
    fullImagePath(path) {
      if (!path) return null;
      return `http://localhost:5150/${path.replace(/\\/g, '/')}`;
    },
    onImageError(event) {
      event.target.style.display = 'none';
      const wrapper = event.target.parentElement;
      if (!wrapper.querySelector('.recipe-no-image')) {
        const noImageDiv = document.createElement('div');
        noImageDiv.className = 'recipe-no-image';
        noImageDiv.innerText = 'Nincs kép';
        wrapper.appendChild(noImageDiv);
      }
    }
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
.recipe-card {
  background: linear-gradient(180deg, rgba(200,255,200,0.5), rgba(220,255,220,0.3));
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 280px;
  max-height: 450px;
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.4s ease;
  opacity: 0;
  animation: fadeIn 0.6s forwards;
}
.recipe-image-wrapper,
.recipe-no-image {
  width: 100%;
  height: 150px;
  margin-bottom: 10px;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}
.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.recipe-no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #888;
  font-size: 0.9rem;
  opacity: 0;
  animation: fadeIn 0.6s forwards;
}
@keyframes fadeIn { to { opacity: 1; } }
.recipe-title { margin: 0 0 8px 0; font-size: 1.2rem; font-weight: 600; color: #4a4a4a; display: flex; align-items: center; }
.recipe-title .recipe-icon { margin-right: 6px; font-size: 1.2rem; }
.recipe-ingredients { margin: 4px 0 0 0; font-size: 0.9rem; }
.recipe-description-wrapper { margin-top: auto; max-height: 120px; overflow-y: auto; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 6px; scroll-behavior: smooth; }
.recipe-description-wrapper::-webkit-scrollbar { width: 6px; }
.recipe-description-wrapper::-webkit-scrollbar-track { background: rgba(0, 128, 0, 0.05); border-radius: 3px; }
.recipe-description-wrapper::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #a8e6cf, #56ab2f); border-radius: 3px; transition: background 0.2s ease; }
.recipe-description-wrapper::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #56ab2f, #a8e6cf); }
.recipe-description-wrapper { scrollbar-width: thin; scrollbar-color: rgba(86, 171, 47, 0.7) rgba(168, 230, 207, 0.1); }
.recipe-description { margin: 0; white-space: pre-wrap; }
.recipe-author { margin-top: 8px; font-size: 0.85rem; color: #555; text-align: right; }
@media (max-width: 600px) {
  .recipe-card { min-height: 220px; padding: 16px; }
  .recipe-title { font-size: 1.1rem; }
  .recipe-description-wrapper { max-height: 100px; }
  .recipe-image-wrapper,
  .recipe-no-image { height: 120px; }
}
</style>
