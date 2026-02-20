<template>
  <div class="recipe-list">
    <div
      v-for="recipe in recipes"
      :key="recipe.id"
      class="recipe-card"
    >
<<<<<<< HEAD
=======
      <!-- Recept kép vagy "Nincs kép" -->
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
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

<<<<<<< HEAD
=======
      <!-- Recept címe -->
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
      <h3 class="recipe-title">
      <router-link
        :to="`/recept/${recipe.id}`"
        class="recipe-title-link"
      >
        <span class="recipe-icon">🍽️</span>
        {{ recipe.title }}
      </router-link>
      </h3>

<<<<<<< HEAD
      <p v-if="recipe.ingredients?.length" class="recipe-ingredients">
        <strong>Hozzávalók:</strong> {{ formatIngredients(recipe.ingredients) }}
      </p>

=======
      <!-- Hozzávalók -->
      <p v-if="recipe.ingredients?.length" class="recipe-ingredients">
        Hozzávalók: {{ recipe.ingredients.join(', ') }}
      </p>

      <!-- Elkészítés / leírás görgethető -->
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
      <div class="recipe-description-wrapper">
        <p class="recipe-description">{{ recipe.description }}</p>
      </div>

<<<<<<< HEAD
=======
      <!-- Szerző a végére -->
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
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
<<<<<<< HEAD
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
=======
    // Backendből kapott relative path → teljes HTTPS URL
    fullImagePath(path) {
      if (!path) return null;
      return `https://localhost:5150/${path.replace(/\\/g, '/')}`;
    },
    // Ha a kép nem töltődik be, eltűnteti és megjeleníti a "Nincs kép"-et
    onImageError(event) {
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
      event.target.style.display = 'none';
      const wrapper = event.target.parentElement;
      if (!wrapper.querySelector('.recipe-no-image')) {
        const noImageDiv = document.createElement('div');
        noImageDiv.className = 'recipe-no-image';
<<<<<<< HEAD
        noImageDiv.innerText = 'Kép hiba';
=======
        noImageDiv.innerText = 'Nincs kép';
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
        wrapper.appendChild(noImageDiv);
      }
    }
  }
}
</script>

<style scoped>
<<<<<<< HEAD
/* A stílusaidat érintetlenül hagytam, mert azok szuperek! */
=======
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 10px;
}
<<<<<<< HEAD
.recipe-card {
  background: linear-gradient(180deg, rgba(255, 165, 0, 0.5), rgba(255, 165, 0, 0.05));
=======

/* Kártya */
.recipe-card {
  background: linear-gradient(
    180deg,
    rgba(255, 165, 0, 0.5),   /* halványabb narancs fent */
    rgba(255, 165, 0, 0.05)   /* majdnem átlátszó narancs lent */
  );
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
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
<<<<<<< HEAD
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
=======




/* Fade-in animáció */
@keyframes fadeIn {
  to { opacity: 1; }
}

/* Hover effekt */
.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Recept kép */
.recipe-image-wrapper {
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

/* "Nincs kép" felirat */
.recipe-no-image {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #888;
  font-size: 0.9rem;
  border-radius: 12px 12px 0 0;
  margin-bottom: 10px;
  opacity: 0;
  animation: fadeIn 0.6s forwards;
}

/* Recept címe */
.recipe-title {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #4a4a4a;
  display: flex;
  align-items: center;
}

.recipe-title-link{
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
}

/* Ikon a cím előtt */
.recipe-title .recipe-icon {
  margin-right: 6px;
  color: white;
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

/* Szebb scroll sáv (Webkit) */
.recipe-description-wrapper::-webkit-scrollbar {
  width: 6px;
}
.recipe-description-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 128, 0, 0.05);
  border-radius: 3px;
}
.recipe-description-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #a8e6cf, #56ab2f);
  border-radius: 3px;
  transition: background 0.2s ease;
}
.recipe-description-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #56ab2f, #a8e6cf);
}

/* Firefox scroll */
.recipe-description-wrapper {
  scrollbar-width: thin;
  scrollbar-color: rgba(86, 171, 47, 0.7) rgba(168, 230, 207, 0.1);
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
  .recipe-image-wrapper,
  .recipe-no-image {
    height: 120px;
  }
}
</style>
>>>>>>> a3818384fecbfd303c31215c356a826809cf8d40
