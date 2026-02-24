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
  { path: '/', component: Home },
  { path: '/receptek', component: Recipe },
  { path: '/recept/:id', component: RecipeDetails },
  { path: '/profile', component: Profile },
  { path: '/kedvencek', component: Favorites },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  
  // JAVÍTÁS: Mindkét útvonal ugyanoda (EditRecipe) vezessen!
  { path: '/szerkesztes/:id', component: EditRecipe },
  { path: '/edit-recipe/:id', component: EditRecipe }, // Ez kell az Admin Panelnek
  
  { path: '/uj-recept', component: NewRecipe },
  { path: '/menu', component: Menu }, 
  { path: '/vasarlas', component: ShoppingList },
  { path: '/jegyzet', component: Note },

  { path: '/admin', component: AdminPanel },
  { path: '/admin/users', component: AdminUsers },
  { path: '/admin/recipes', component: AdminRecipes }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/', '/login', '/register', '/receptek', '/menu'];
  
  // Fontos: a startsWith segít a paraméteres útvonalaknál
  const isPublicPage = publicPages.includes(to.path) || to.path.startsWith('/recept/');
  
  const loggedIn = localStorage.getItem('token');

  if (!isPublicPage && !loggedIn) {
    return next('/login');
  }
  
  next();
});

export default router