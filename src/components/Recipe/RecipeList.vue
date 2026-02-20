<template>
  <div class="recipe-list">
    <div
      v-for="recipe in recipes"
      :key="recipe.id"
      class="recipe-card"
    >
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

      <h3 class="recipe-title">
      <router-link
        :to="`/recept/${recipe.id}`"
        class="recipe-title-link"
      >
        <span class="recipe-icon">🍽️</span>
        {{ recipe.title }}
      </router-link>
      </h3>

      <p v-if="recipe.ingredients?.length" class="recipe-ingredients">
        <strong>Hozzávalók:</strong> {{ formatIngredients(recipe.ingredients) }}
      </p>

      <div class="recipe-description-wrapper">
        <p class="recipe-description">{{ recipe.description }}</p>
      </div>

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
  },
  methods: {
    // JAVÍTOTT: Most már az /Images/ mappából kéri a fájlokat
    fullImagePath(path) {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      
      // Csak a fájlnevet tartjuk meg (levágjuk az esetleges régi útvonalat)
      const fileName = path.split(/[\\/]/).pop();
      return `https://localhost:5150/Images/${fileName}`;
    },
    
    // JAVÍTOTT: Hozzávalók kezelése (hogy ne [object Object] legyen)
    formatIngredients(ingredients) {
      if (!ingredients) return '';
      return ingredients.map(ing => {
        if (typeof ing === 'string') return ing;
        return `${ing.name} (${ing.quantity} ${ing.unit || ''})`;
      }).join(', ');
    },

    onImageError(event) {
      // Megpróbáljuk egy alapértelmezett képre cserélni, ha a fájl tényleg hiányzik
      event.target.style.display = 'none';
      const wrapper = event.target.parentElement;
      if (!wrapper.querySelector('.recipe-no-image')) {
        const noImageDiv = document.createElement('div');
        noImageDiv.className = 'recipe-no-image';
        noImageDiv.innerText = 'Kép hiba';
        wrapper.appendChild(noImageDiv);
      }
    }
  }
}
</script>

<style scoped>
/* A stílusaidat érintetlenül hagytam, mert azok szuperek! */
.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 10px;
}
.recipe-card {
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05));
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
@keyframes fadeIn { to { opacity: 1; } }
.recipe-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15); }
.recipe-image-wrapper { width: 100%; height: 150px; margin-bottom: 10px; border-radius: 12px 12px 0 0; overflow: hidden; }
.recipe-image { width: 100%; height: 100%; object-fit: cover; }
.recipe-no-image { width: 100%; height: 150px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; color: #888; font-size: 0.9rem; border-radius: 12px 12px 0 0; margin-bottom: 10px; }
.recipe-title { margin: 0 0 8px 0; font-size: 1.2rem; font-weight: 600; color: #4a4a4a; display: flex; align-items: center; }
.recipe-title-link{ color: inherit; text-decoration: none; display: flex; align-items: center; }
.recipe-ingredients { margin: 4px 0 0 0; font-size: 0.9rem; }
.recipe-description-wrapper { margin-top: auto; max-height: 120px; overflow-y: auto; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 6px; }
.recipe-description { margin: 0; white-space: pre-wrap; }
.recipe-author { margin-top: 8px; font-size: 0.85rem; color: #555; text-align: right; }
</style>