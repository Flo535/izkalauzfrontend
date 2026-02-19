import { createRouter, createWebHistory } from 'vue-router'

// Oldalak importálása
import Home from '../pages/Home.vue'
import Recipes from '../pages/Recipe.vue'       // pontos fájlnév
import Favorites from '../pages/Favorites.vue'
import Cart from '../pages/Cart.vue'
import Menu from '../pages/Menu.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'
import AdminUsers from '../pages/AdminUsers.vue'
import RecipeDetails from '../pages/RecipeDetails.vue'
import NewRecipe from '../pages/NewRecipe.vue'
import EditRecipe from '../pages/EditRecipe.vue'
import ShoppingList from '../pages/ShoppingList.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/recipes', component: Recipes },
  { path: '/receptek', component: Recipes },  // magyar URL
  { path: '/kedvencek', component: Favorites },
  { path: '/jegyzet', component: Cart, meta: { requiresAuth: true } },
  { path: '/menu', component: Menu },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile },
  { path: '/new-recipe', name: 'NewRecipe', component: NewRecipe },
  { path: '/edit-recipe/:id', name: 'EditRecipe', component: EditRecipe },
  { path: '/admin', component: AdminUsers, meta: { requiresAdmin: true } },
  { path: '/bevasarlolista', component: ShoppingList, meta: { requiresAuth: true } },
  { path: '/recept/:id', component: RecipeDetails }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Globális navigációs őr – admin ellenőrzés
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  let role = null
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      role = payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
    } catch {}
  }

  if (to.meta.requiresAdmin && role?.toLowerCase() !== 'admin') {
    alert('Ehhez a felülethez nincs jogosultságod!')
    return next('/')
  }

  next()
})

export default router
