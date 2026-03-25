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
          <h3>{{ userInfo.business_name }}</h3>
          <p>{{ userInfo.contact_name }} · {{ userInfo.phone }}</p>
          <van-tag v-if="userInfo.status === 0" type="warning">待审核</van-tag>
          <van-tag v-else-if="userInfo.status === 1" type="success">已认证</van-tag>
          <van-tag v-else-if="userInfo.status === 2" type="danger">已驳回</van-tag>
        </div>
      </div>
      
      <div class="user-tags" v-if="merchantTags.length > 0 || customTags.length > 0">
        <van-tag 
          v-for="(tag, index) in merchantTags" 
          :key="'tag-' + index"
          plain 
          type="primary" 
          size="medium"
          style="margin-right: 4px; margin-bottom: 4px"
        >{{ tag }}</van-tag>
        <van-tag 
          v-for="(tag, index) in customTags" 
          :key="'custom-' + index"
          plain 
          type="success" 
          size="medium"
          style="margin-right: 4px; margin-bottom: 4px"
        >{{ tag }}</van-tag>
      </div>
      
      <div class="member-info" v-if="userInfo.member_level > 0">
        <span class="member-level">{{ getMemberLevel(userInfo.member_level) }}</span>
        <span class="member-quota">剩余报名: {{ userInfo.monthly_quota - userInfo.used_quota }}次</span>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <div class="value">{{ stats.totalCooperations }}</div>
          <div class="label">参与活动</div>
        </div>
        <div class="stat-item">
          <div class="value">{{ stats.completedCooperations }}</div>
          <div class="label">完成合作</div>
        </div>
        <div class="stat-item">
          <div class="value">{{ userInfo.star_rating || 5.0 }}</div>
          <div class="label">综合评分</div>
        </div>
      </div>
    </div>
    
    <van-cell-group inset>
      <van-cell title="商家信息" icon="shop-o" is-link to="/profile/edit" />
      <van-cell title="会员中心" icon="gem-o" is-link to="/member">
        <template #value>
          <van-tag v-if="userInfo?.member_level > 0" type="primary">
            {{ getMemberLevel(userInfo.member_level) }}
          </van-tag>
          <span v-else class="unopened">未开通</span>
        </template>
      </van-cell>
      <van-cell title="我的合作" icon="orders-o" is-link to="/cooperations" />
      <van-cell title="我的赞助信息" icon="gift-o" is-link to="/sponsor" />
      <van-cell title="收到的评价" icon="star-o" is-link to="/evaluates" />
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
      <van-tabbar-item icon="search" to="/activities">需求</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/cooperations">合作</van-tabbar-item>
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
const merchantTags = ref([])
const customTags = ref([])

const stats = reactive({
  totalCooperations: 0,
  completedCooperations: 0
})

const settingsActions = [
  { name: '编辑资料', key: 'edit' },
  { name: '修改手机号', key: 'phone' },
  { name: '清除缓存', key: 'cache' }
]

const getMemberLevel = (level) => {
  const levels = ['免费普通会员', '银卡会员', '金卡会员', '钻石会员']
  return levels[level] || '免费普通会员'
}

const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace('http://localhost:3000', 'http://localhost:3001')
  }
  return `http://localhost:3001${url.startsWith('/') ? '' : '/'}${url}`
}

const fetchUserInfo = async () => {
  try {
    const res = await api.merchant.getProfile()
    if (res.code === 200) {
      userInfo.value = res.data
      if (res.data.logo) {
        userInfo.value.logo = getImageUrl(res.data.logo)
      }
      if (res.data.tags) {
        try {
          const tagIds = JSON.parse(res.data.tags)
          if (Array.isArray(tagIds) && tagIds.length > 0) {
            const tagRes = await api.tag.getAll({ category: 'merchant' })
            if (tagRes.code === 200) {
              const tagMap = {}
              tagRes.data.forEach(tag => {
                tagMap[tag.id] = tag.name
              })
              merchantTags.value = tagIds.map(id => tagMap[id]).filter(name => name)
            }
          }
        } catch (e) {
          merchantTags.value = []
        }
      }
      if (res.data.custom_tags) {
        try {
          customTags.value = JSON.parse(res.data.custom_tags)
        } catch (e) {
          customTags.value = []
        }
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const fetchStats = async () => {
  try {
    const res = await api.merchant.getStats()
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
      localStorage.removeItem('merchant_token')
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

.user-tags {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.member-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.member-level {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.member-quota {
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

.unopened {
  color: #999;
  font-size: 13px;
}

.logout-btn {
  margin: 20px 16px;
}
</style>
