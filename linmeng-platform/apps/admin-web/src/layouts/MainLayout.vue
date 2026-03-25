<template>
  <el-container class="main-layout">
    <el-aside width="220px">
      <div class="logo">
        <h1>邻盟后台</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        
        <el-sub-menu index="community">
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>社区管理</span>
          </template>
          <el-menu-item index="/community/list">社区信息管理</el-menu-item>
          <el-menu-item index="/community/demand">社区需求管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="merchant">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>商家管理</span>
          </template>
          <el-menu-item index="/merchant/list">商家信息管理</el-menu-item>
          <el-sub-menu index="member">
            <template #title>
              <span>会员管理</span>
            </template>
            <el-menu-item index="/merchant/member/list">会员列表</el-menu-item>
            <el-menu-item index="/merchant/member/order">订单管理</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/merchant/sponsor">商家赞助管理</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item v-if="isSuperAdmin" index="/admin">
          <el-icon><User /></el-icon>
          <span>管理员管理</span>
        </el-menu-item>
        
        <el-menu-item index="/tag">
          <el-icon><PriceTag /></el-icon>
          <span>标签库管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ userName }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const userInfo = computed(() => {
  const userStr = localStorage.getItem('admin_user')
  return userStr ? JSON.parse(userStr) : {}
})

const userName = computed(() => userInfo.value.real_name || '管理员')

const isSuperAdmin = computed(() => userInfo.value.role === 'super_admin')

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #263445;
    
    h1 {
      color: #fff;
      font-size: 20px;
      margin: 0;
    }
  }
}

.el-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-main {
  background-color: #f0f2f5;
}
</style>
