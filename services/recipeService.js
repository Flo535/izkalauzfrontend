// src/services/recipeService.js
import api from './api'

// Összes recept lekérése
export const getAllRecipes = () => api.get('/Recipes')

// Egy recept lekérése ID alapján
export const getRecipeById = (id) => api.get(`/${id}`)

// Új recept létrehozása
export const createRecipe = (recipe) => api.post('/', recipe)

// Recept módosítása
export const updateRecipe = (id, recipe) => api.put(`/${id}`, recipe)

// Recept törlése
export const deleteRecipe = (id) => api.delete(`/${id}`)
