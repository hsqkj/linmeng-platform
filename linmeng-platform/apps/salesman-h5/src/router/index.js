import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页', requiresAuth: true }
  },
  {
    path: '/merchants',
    name: 'Merchants',
    component: () => import('../views/Merchants.vue'),
    meta: { title: '我的商户', requiresAuth: true }
  },
  {
    path: '/commissions',
    name: 'Commissions',
    component: () => import('../views/Commissions.vue'),
    meta: { title: '提成记录', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 招商大使端` : '招商大使端'
  
  const token = localStorage.getItem('salesman_token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/home')
  } else if (to.path === '/' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
