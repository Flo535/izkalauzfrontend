<template>
  <ul class="recipe-list">
    <li v-for="recipe in recipes" :key="recipe.id" class="recipe-item">
      <div class="recipe-card">
        <h3>{{ recipe.title }}</h3>
        <p>{{ recipe.description }}</p>
        <p v-if="recipe.ingredients?.length">Hozzávalók: {{ recipe.ingredients.join(', ') }}</p>
        <p v-if="recipe.authorEmail"><strong>Szerző:</strong> {{ recipe.authorEmail }}</p>
      </div>
    </li>
  </ul>
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
  list-style: none;
  padding: 0;
  margin: 0;
}
.recipe-item {
  margin-bottom: 16px;
}
.recipe-card {
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 12px;
  background: #fff;
}
</style>
