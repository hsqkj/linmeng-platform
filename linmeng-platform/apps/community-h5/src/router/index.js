import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

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
    meta: { title: '社区用户注册' }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/activity/create',
    name: 'ActivityCreate',
    component: () => import('../views/activity/Create.vue'),
    meta: { title: '发布活动', requiresAuth: true }
  },
  {
    path: '/activity/list',
    name: 'ActivityList',
    component: () => import('../views/activity/List.vue'),
    meta: { title: '我的活动', requiresAuth: true }
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: () => import('../views/activity/Detail.vue'),
    meta: { title: '活动详情', requiresAuth: true }
  },
  {
    path: '/activity/:id/evaluate',
    name: 'ActivityEvaluate',
    component: () => import('../views/activity/Evaluate.vue'),
    meta: { title: '评价商家', requiresAuth: true }
  },
  {
    path: '/cooperation/list',
    name: 'CooperationList',
    component: () => import('../views/cooperation/List.vue'),
    meta: { title: '合作记录', requiresAuth: true }
  },
  {
    path: '/cooperation/:id',
    name: 'CooperationDetail',
    component: () => import('../views/cooperation/Detail.vue'),
    meta: { title: '合作详情', requiresAuth: true }
  },
  {
    path: '/evaluate/list',
    name: 'EvaluateList',
    component: () => import('../views/evaluate/List.vue'),
    meta: { title: '我的评价', requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'ProfileEdit',
    component: () => import('../views/profile/Edit.vue'),
    meta: { title: '编辑资料', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '个人中心', requiresAuth: true }
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
    meta: { title: '商家赞助' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 邻盟` : '邻盟'
  
  const userStore = useUserStore()
  const token = localStorage.getItem('community_token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/home')
  } else if (to.path === '/' && !token) {
    next('/home')
  } else {
    next()
  }
})

export default router
