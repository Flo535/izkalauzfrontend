<template>
  <div class="recipe-list-container">
    <div v-if="recipes.length === 0" class="no-recipes">
      Nincs megjeleníthető recept.
    </div>
    <div v-else class="recipe-grid">
      <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
        <div class="image-wrapper">
          <img 
            :src="fullImagePath(recipe.imagePath)" 
            :alt="recipe.title" 
            @error="onImgError"
          />
        </div>
        <div class="card-content">
          <h3 class="recipe-title">{{ recipe.title }}</h3>
          <p class="recipe-author">👤 {{ recipe.authorEmail }}</p>
          <button class="view-btn" @click="$emit('view', recipe.id)">
            Megtekintés
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecipeList',
  props: {
    recipes: {
      type: Array,
      required: true
    }
  },
  methods: {
    fullImagePath(path) {
      if (!path) return "https://localhost:5150/Images/default.jpg";
      const fileName = path.split(/[\\/]/).pop();
      return `https://localhost:5150/Images/${fileName}`;
    },
    onImgError(e) {
      e.target.src = "https://localhost:5150/Images/default.jpg";
    }
  }
}
</script>

<style scoped>
.recipe-list-container { width: 100%; }
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 0;
}
.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}
.recipe-card:hover { transform: translateY(-5px); }
.image-wrapper { width: 100%; height: 180px; }
.image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.card-content { padding: 15px; }
.recipe-title { font-size: 1.2rem; margin-bottom: 5px; color: #333; }
.recipe-author { font-size: 0.85rem; color: #666; margin-bottom: 15px; }
.view-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(to right, #ff8c00, #ffd700);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
</style>