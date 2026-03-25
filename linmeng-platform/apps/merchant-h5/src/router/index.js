import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
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
    meta: { title: '商家用户注册' }
  },
  {
    path: '/register/result',
    name: 'RegisterResult',
    component: () => import('../views/RegisterResult.vue'),
    meta: { title: '注册结果' }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('../views/Activities.vue'),
    meta: { title: '需求广场' }
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: () => import('../views/ActivityDetail.vue'),
    meta: { title: '活动详情', requiresAuth: true }
  },
  {
    path: '/cooperations',
    name: 'Cooperations',
    component: () => import('../views/Cooperations.vue'),
    meta: { title: '我的合作', requiresAuth: true }
  },
  {
    path: '/cooperation/:id',
    name: 'CooperationDetail',
    component: () => import('../views/CooperationDetail.vue'),
    meta: { title: '合作详情', requiresAuth: true }
  },
  {
    path: '/member',
    name: 'Member',
    component: () => import('../views/Member.vue'),
    meta: { title: '会员中心', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'ProfileEdit',
    component: () => import('../views/profile/Edit.vue'),
    meta: { title: '编辑资料', requiresAuth: true }
  },
  {
    path: '/evaluates',
    name: 'Evaluates',
    component: () => import('../views/Evaluates.vue'),
    meta: { title: '收到的评价', requiresAuth: true }
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('../views/Message.vue'),
    meta: { title: '消息中心', requiresAuth: true }
  },
  {
    path: '/sponsor',
    name: 'SponsorList',
    component: () => import('../views/sponsor/List.vue'),
    meta: { title: '我的赞助信息', requiresAuth: true }
  },
  {
    path: '/sponsor/create',
    name: 'SponsorCreate',
    component: () => import('../views/sponsor/Create.vue'),
    meta: { title: '发布赞助信息', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 邻盟商家端` : '邻盟商家端'
  
  const token = localStorage.getItem('merchant_token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/home')
  } else {
    next()
  }
})

export default router
