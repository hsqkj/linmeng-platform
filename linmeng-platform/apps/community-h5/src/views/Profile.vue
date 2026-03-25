<template>
  <div class="profile-page">
    <van-nav-bar title="个人中心">
      <template #right>
        <van-icon name="setting-o" size="20" @click="showSettings = true" />
      </template>
    </van-nav-bar>
    
    <div class="user-card" v-if="userInfo">
      <div class="user-info">
        <van-image
          :src="userInfo.logo || 'https://via.placeholder.com/80'"
          round
          width="80"
          height="80"
        />
        <div class="info">
          <h3>{{ userInfo.community_name }}</h3>
          <p>{{ userInfo.contact_name }} · {{ userInfo.phone }}</p>
          <van-tag v-if="userInfo.status === 0" type="warning">待审核</van-tag>
          <van-tag v-else-if="userInfo.status === 1" type="success">已认证</van-tag>
          <van-tag v-else-if="userInfo.status === 2" type="danger">已驳回</van-tag>
        </div>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <div class="value">{{ stats.totalActivities }}</div>
          <div class="label">发布活动</div>
        </div>
        <div class="stat-item">
          <div class="value">{{ stats.completedCooperations }}</div>
          <div class="label">完成合作</div>
        </div>
        <div class="stat-item">
          <div class="value">{{ stats.totalEvaluates }}</div>
          <div class="label">评价数量</div>
        </div>
      </div>
    </div>
    
    <van-cell-group inset>
      <van-cell title="社区信息" icon="home-o" is-link to="/profile/edit" />
      <van-cell title="我的活动" icon="records-o" is-link to="/activity/list" />
      <van-cell title="合作记录" icon="link-o" is-link to="/cooperation/list" />
      <van-cell title="我的评价" icon="star-o" is-link to="/evaluate/list" />
    </van-cell-group>
    
    <van-cell-group inset>
      <van-cell title="帮助中心" icon="question-o" is-link />
      <van-cell title="关于我们" icon="info-o" is-link />
      <van-cell title="联系客服" icon="service-o" is-link />
    </van-cell-group>
    
    <div class="logout-btn">
      <van-button type="danger" block round plain @click="handleLogout">
        退出登录
      </van-button>
    </div>
    
    <van-tabbar v-model="activeTabbar" fixed>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="records-o" to="/activity/list">活动</van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/message">消息</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
    
    <van-action-sheet
      v-model:show="showSettings"
      :actions="settingsActions"
      cancel-text="取消"
      close-on-click-action
      @select="onSettingsSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast } from 'vant'
import api from '../api'

const router = useRouter()
const activeTabbar = ref(3)
const showSettings = ref(false)
const userInfo = ref(null)

const stats = reactive({
  totalActivities: 0,
  completedCooperations: 0,
  totalEvaluates: 0
})

const settingsActions = [
  { name: '编辑资料', key: 'edit' },
  { name: '修改手机号', key: 'phone' },
  { name: '清除缓存', key: 'cache' }
]

const fetchUserInfo = async () => {
  try {
    const res = await api.community.getProfile()
    if (res.code === 200) {
      userInfo.value = res.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const fetchStats = async () => {
  try {
    const res = await api.community.getStats()
    if (res.code === 200) {
      Object.assign(stats, res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const onSettingsSelect = (action) => {
  if (action.key === 'edit') {
    router.push('/profile/edit')
  } else if (action.key === 'phone') {
    router.push('/profile/phone')
  } else if (action.key === 'cache') {
    localStorage.clear()
    showSuccessToast('缓存已清除')
  }
}

const handleLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  })
    .then(() => {
      localStorage.removeItem('community_token')
      router.replace('/login')
    })
    .catch(() => {})
}

onMounted(() => {
  fetchUserInfo()
  fetchStats()
})
</script>

<style scoped>
.profile-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin: 12px;
  border-radius: 12px;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info .info h3 {
  margin: 0;
  font-size: 18px;
}

.user-info .info p {
  margin: 8px 0;
  font-size: 13px;
  opacity: 0.9;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-item .value {
  font-size: 24px;
  font-weight: bold;
}

.stat-item .label {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.logout-btn {
  margin: 20px 16px;
}
</style>
