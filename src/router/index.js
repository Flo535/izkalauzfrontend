import { createRouter, createWebHistory } from 'vue-router'

// Oldalak importálása
import Home from '../pages/Home.vue'
import Recipe from '../pages/Recipe.vue'
import RecipeDetails from '../pages/RecipeDetails.vue'
import Profile from '../pages/Profile.vue'
import Favorites from '../pages/Favorites.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import EditRecipe from '../pages/EditRecipe.vue'
import NewRecipe from '../pages/NewRecipe.vue'
import Menu from '../pages/Menu.vue' 
import ShoppingList from '../pages/ShoppingList.vue'
import Note from '../pages/Note.vue'

// Admin oldalak
import AdminPanel from '../pages/AdminPanel.vue'
import AdminUsers from '../pages/AdminUsers.vue'
import AdminRecipes from '../pages/AdminRecipes.vue'

const routes = [
  // Alapvető útvonalak
  { path: '/', component: Home },
  { path: '/receptek', component: Recipe },
  { path: '/recept/:id', component: RecipeDetails },
  { path: '/profile', component: Profile },
  { path: '/kedvencek', component: Favorites },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/szerkesztes/:id', component: EditRecipe },
  { path: '/uj-recept', component: NewRecipe },
  
  // Funkcionális oldalak
  { path: '/menu', component: Menu }, 
  { path: '/vasarlas', component: ShoppingList },
  { path: '/jegyzet', component: Note },

  // Admin felület útvonalai
  { path: '/admin', component: AdminPanel },
  { path: '/admin/users', component: AdminUsers },
  { path: '/admin/recipes', component: AdminRecipes }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigációs őr javított verziója
router.beforeEach((to, from, next) => {
  // Azok az oldalak, amiket bárki (bejelentkezés nélkül is) láthat
  const publicPages = ['/', '/login', '/register', '/receptek', '/menu'];
  
  // Megnézzük, hogy a cél útvonal a listában van-e, 
  // vagy egy konkrét recept adatlapja-e (ami szintén publikus)
  const isPublicPage = publicPages.includes(to.path) || to.path.startsWith('/recept/');
  
  const loggedIn = localStorage.getItem('token');

  // Csak akkor irányítunk át a loginra, ha az oldal nem publikus ÉS nincs bejelentkezve
  if (!isPublicPage && !loggedIn) {
    return next('/login');
  }
  
  next();
});

export default router