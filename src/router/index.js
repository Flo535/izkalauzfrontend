import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Profile from '../pages/Profile.vue'
import Home from '../pages/Home.vue' 
import Recipes from '../pages/Recipe.vue'


const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile },
  { path: '/recipes', component: Recipes }, // <-- EZ ÚJ
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
