import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Recipes from '../pages/Recipe.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'
import AdminUsers from '../pages/AdminUsers.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/recipes', component: Recipes },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile },
  { 
    path: '/admin', 
    component: AdminUsers,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Globális navigációs őr
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  let role = null
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      role = payload.role
    } catch {}
  }

  if (to.meta.requiresAdmin && role !== 'Admin') {
    alert('Ehhez a felülethez nincs jogosultságod!')
    return next('/')
  }

  next()
})

export default router
