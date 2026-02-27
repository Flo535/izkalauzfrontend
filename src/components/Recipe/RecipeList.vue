<template>
  <div class="recipe-grid-container">
    <div v-if="recipes.length === 0" class="no-recipes">Nincs megjeleníthető recept. ✨</div>
    <div v-else class="recipe-grid">
      <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
        
        <div class="image-placeholder">
          <img 
            :src="fullImagePath(recipe.imagePath)" 
            @load="onImgLoad"
            @error="onImgError"
            class="recipe-img"
          />
          <div class="no-image-overlay" v-if="!recipe.imagePath || imageError">
            📷 Nincs kép
          </div>
        </div>

        <div class="card-body">
          <h3 class="recipe-title">{{ recipe.title }}</h3>
          <p class="recipe-desc">{{ recipe.description || 'Nincs leírás.' }}</p>
          <div class="card-footer">
             <span class="category-badge">{{ recipe.category || 'Egyéb' }}</span>
             <button class="view-btn" @click="$emit('view', recipe.id)">Megtekintés</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecipeList',
  props: {
    // Ez javítja a 'recipes' hibaüzenetet
    recipes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // Ez javítja az 'imageError' hibaüzenetet
      imageError: false
    }
  },
  methods: {
    // Ez javítja a 'fullImagePath' hibaüzenetet
    fullImagePath(path) {
      if (!path || path === "null" || path.trim() === "") {
        return "https://localhost:5150/Images/default.jpg";
      }
      const fileName = path.split(/[\\/]/).pop();
      return `https://localhost:5150/Images/${fileName}`;
    },
    // Ez javítja az 'onImgLoad' hibaüzenetet
    onImgLoad(e) {
      e.target.classList.add('is-loaded');
    },
    // Ez javítja az 'onImgError' hibaüzenetet
    onImgError(e) {
      this.imageError = true;
      e.target.src = "https://localhost:5150/Images/default.jpg";
    }
  }
}
</script>

<style scoped>
.recipe-grid-container { width: 100%; contain: layout; }

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 20px 0;
}

.recipe-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  height: 450px; /* FIX magasság a kártyának */
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  /* Finom mozgás */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.recipe-card:hover {
  transform: translateY(-10px) translateZ(0);
  box-shadow: 0 12px 30px rgba(0,0,0,0.2);
}

.image-placeholder {
  width: 100%;
  height: 200px; /* FIX magasság a képnek */
  background: #f0f0f0;
  position: relative;
  flex-shrink: 0;
}

.recipe-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.recipe-img.is-loaded { opacity: 1; }

.no-image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #999;
}

.card-body { padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }

.recipe-title {
  height: 2.8rem; /* Fix 2 sor */
  line-height: 1.4rem;
  overflow: hidden;
  margin: 0;
  font-size: 1.15rem;
}

.recipe-desc {
  height: 3rem; /* Fix leírás magasság */
  font-size: 0.9rem;
  color: #666;
  overflow: hidden;
}

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.category-badge { background: #eee; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
.view-btn { padding: 8px 16px; background: #ff8c00; border: none; color: white; border-radius: 8px; cursor: pointer; }
</style>