<template>
  <div class="recipe-search glass-box">
    <h3>Keresés a receptek között</h3>

    <input
      v-model="query"
      type="text"
      placeholder="Írd be a recept nevét vagy hozzávalót..."
      class="search-input"
    />

    <transition-group name="fade" tag="ul" class="recipe-list">
      <li
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="recipe-item"
      >
        <h4>{{ recipe.title }}</h4>
        <p>{{ recipe.description }}</p>
        <p v-if="recipe.ingredients && recipe.ingredients.length">
          <strong>Hozzávalók:</strong> {{ recipe.ingredients.join(", ") }}
        </p>
      </li>
    </transition-group>

    <div v-if="filteredRecipes.length === 0 && query" class="no-results">
      😢 Nincs találat a keresésre.
    </div>
  </div>
</template>

<script>
export default {
  name: "RecipeSearch",
  props: {
    recipes: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      query: "",
    };
  },
  computed: {
    filteredRecipes() {
      const q = this.query.toLowerCase();
      return this.recipes.filter(recipe => {
        const titleMatch = recipe.title.toLowerCase().includes(q);
        const ingredientsMatch = recipe.ingredients
          ? recipe.ingredients.some(i => i.toLowerCase().includes(q))
          : false;
        return titleMatch || ingredientsMatch;
      });
    },
  },
};
</script>

<style scoped>
.recipe-search {
  padding: 20px;
  margin: 20px 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.1);
  font-size: 1rem;
}

.recipe-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recipe-item {
  padding: 12px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.no-results {
  margin-top: 10px;
  color: #888;
}
</style>
