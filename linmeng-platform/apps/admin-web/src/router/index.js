import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '数据概览' }
      },
      {
        path: 'community',
        name: 'Community',
        redirect: '/community/list',
        meta: { title: '社区管理' },
        children: [
          {
            path: 'list',
            name: 'CommunityList',
            component: () => import('../views/community/List.vue'),
            meta: { title: '社区信息管理' }
          },
          {
            path: 'demand',
            name: 'CommunityDemand',
            component: () => import('../views/community/Demand.vue'),
            meta: { title: '社区需求管理' }
          }
        ]
      },
      {
        path: 'merchant',
        name: 'Merchant',
        redirect: '/merchant/list',
        meta: { title: '商家管理' },
        children: [
          {
            path: 'list',
            name: 'MerchantList',
            component: () => import('../views/merchant/List.vue'),
            meta: { title: '商家信息管理' }
          },
          {
            path: 'member',
            name: 'MerchantMember',
            redirect: '/merchant/member/list',
            meta: { title: '会员管理' },
            children: [
              {
                path: 'list',
                name: 'MemberList',
                component: () => import('../views/merchant/Member.vue'),
                meta: { title: '会员列表' }
              },
              {
                path: 'order',
                name: 'OrderList',
                component: () => import('../views/order/List.vue'),
                meta: { title: '订单管理' }
              }
            ]
          },
          {
            path: 'sponsor',
            name: 'MerchantSponsor',
            component: () => import('../views/merchant/Sponsor.vue'),
            meta: { title: '商家赞助管理' }
          }
        ]
      },
      {
        path: 'admin',
        name: 'AdminList',
        component: () => import('../views/admin/List.vue'),
        meta: { title: '管理员管理' }
      },
      {
        path: 'tag',
        name: 'TagLibrary',
        component: () => import('../views/tag/List.vue'),
        meta: { title: '标签库管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 邻盟管理后台` : '邻盟管理后台'
  
  const token = localStorage.getItem('admin_token')
  const userStr = localStorage.getItem('admin_user')
  const user = userStr ? JSON.parse(userStr) : {}
  
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else if (to.path === '/admin' && user.role !== 'super_admin') {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
