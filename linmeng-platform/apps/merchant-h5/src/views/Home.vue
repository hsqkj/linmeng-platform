<template>
  <div class="home-page">
    <van-nav-bar title="邻盟商家端">
      <template #right>
        <div class="nav-right">
          <van-badge :dot="unreadCount > 0" v-if="isLoggedIn">
            <van-icon name="bell" size="20" @click="router.push('/message')" />
          </van-badge>
          <div class="auth-buttons" v-else>
            <van-button size="small" plain type="primary" @click="router.push('/login')">登录</van-button>
            <van-button size="small" type="primary" @click="router.push('/register')">注册</van-button>
          </div>
        </div>
      </template>
    </van-nav-bar>
    
    <div class="banner">
      <p class="banner-text">精准触达社区居民，高效获客转化</p>
    </div>
    
    <div class="member-card" v-if="isLoggedIn && merchantInfo">
      <div class="member-info">
        <span class="member-level">{{ getMemberLevel(merchantInfo.member_level) }}</span>
        <span class="member-name">{{ merchantInfo.business_name }}</span>
      </div>
      <div class="member-quota">
        本月剩余报名次数: {{ merchantInfo.monthly_quota - merchantInfo.used_quota }}
      </div>
      <van-button size="small" type="primary" round @click="router.push('/member')">
        {{ merchantInfo.member_level === 0 ? '开通会员' : '续费/升级' }}
      </van-button>
    </div>
    
    <div class="section demand-section">
      <div class="section-header">
        <van-icon name="search" size="18" color="#1989fa" />
        <span class="section-title">需求广场</span>
      </div>
      
      <div class="demand-stats">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ platformStats.activityCount || 0 }}</div>
            <div class="stat-label">已发布需求</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ platformStats.recruitingCount || 0 }}</div>
            <div class="stat-label">招募中</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ platformStats.completedCount || 0 }}</div>
            <div class="stat-label">已完成对接</div>
          </div>
        </div>
      </div>
      
      <div class="demand-list-section">
        <van-cell-group inset>
          <van-cell title="需求推荐" is-link to="/activities" value="更多" />
          <van-skeleton v-if="loadingDemands" :row="3" />
          <van-empty v-else-if="demands.length === 0" description="暂无需求" />
          <div v-else>
            <div
              v-for="item in demands"
              :key="item.id"
              class="demand-item"
              @click="showDemandDetail(item)"
            >
              <div class="demand-header">
                <span class="demand-title">{{ item.title }}</span>
                <van-tag type="primary" plain size="small">{{ getDemandTypeText(item.demand_type) }}</van-tag>
              </div>
              <div class="demand-info">
                <div class="match-hearts">
                  <span class="match-label">匹配度：</span>
                  <van-icon 
                    v-for="i in 5" 
                    :key="i"
                    :name="i <= (item.match_hearts || 0) ? 'like' : 'like-o'"
                    :color="i <= (item.match_hearts || 0) ? '#ee0a24' : '#dcdee0'"
                    size="12"
                  />
                </div>
                <span class="community-name">{{ item.community?.name || '社区' }}</span>
              </div>
              <div class="demand-tags" v-if="item.tags && item.tags.length > 0">
                <van-tag 
                  v-for="tag in item.tags.slice(0, 3)" 
                  :key="tag" 
                  plain 
                  type="primary" 
                  size="small"
                  style="margin-right: 4px;"
                >
                  {{ tag }}
                </van-tag>
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>
    </div>
    
    <div class="section sponsor-section">
      <div class="section-header">
        <van-icon name="gift-o" size="18" color="#ff6b6b" />
        <span class="section-title">发布赞助</span>
      </div>
      
      <div class="sponsor-stats">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ sponsorStats.total || 0 }}</div>
            <div class="stat-label">已发布</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ sponsorStats.totalViews || 0 }}</div>
            <div class="stat-label">总浏览量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ sponsorStats.totalConsults || 0 }}</div>
            <div class="stat-label">总咨询量</div>
          </div>
        </div>
      </div>
      
      <div class="sponsor-list-section">
        <van-cell-group inset>
          <van-cell title="我的赞助" is-link to="/sponsor" value="更多" />
          <div class="quick-actions" v-if="isLoggedIn">
            <van-button type="primary" round @click="router.push('/sponsor/create')">
              <van-icon name="plus" /> 发布赞助
            </van-button>
          </div>
          <van-skeleton v-if="loadingSponsors" :row="3" />
          <van-empty v-else-if="sponsorList.length === 0" description="暂无赞助" />
          <div v-else>
            <div
              v-for="item in sponsorList"
              :key="item.id"
              class="sponsor-item"
              @click="router.push(`/sponsor/${item.id}`)"
            >
              <div class="sponsor-header">
                <span class="sponsor-title">{{ item.title }}</span>
                <van-tag :type="getStatusType(item.status)" size="small">{{ getStatusText(item.status) }}</van-tag>
              </div>
              <div class="sponsor-info">
                <span><van-icon name="eye-o" /> {{ item.view_count || 0 }}</span>
                <span><van-icon name="chat-o" /> {{ item.consult_count || 0 }}</span>
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>
    </div>
    
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/activities">需求</van-tabbar-item>
      <van-tabbar-item v-if="isLoggedIn" icon="orders-o" to="/cooperations">合作</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
    
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="popup-content" v-if="selectedDemand">
        <div class="popup-header">
          <h3>需求详情</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        
        <div class="popup-body">
          <div class="community-card">
            <van-image
              :src="selectedDemand.community?.logo || 'https://via.placeholder.com/80'"
              round
              width="60"
              height="60"
            />
            <div class="community-info-card">
              <div class="name">{{ selectedDemand.community?.name }}</div>
              <div class="address">{{ selectedDemand.community?.address }}</div>
            </div>
          </div>
          
          <van-cell-group inset title="需求信息">
            <van-cell title="标题" :value="selectedDemand.title" />
            <van-cell title="需求类型" :value="getDemandTypeText(selectedDemand.demand_type)" />
            <van-cell title="详细描述" :label="selectedDemand.description" />
          </van-cell-group>
          
          <template v-if="selectedDemand.demand_type === 'activity' || !selectedDemand.demand_type">
            <van-cell-group inset title="活动信息">
              <van-cell title="活动地点" :value="selectedDemand.location" />
              <van-cell title="开始时间" :value="formatDateTime(selectedDemand.start_time)" />
              <van-cell title="结束时间" :value="formatDateTime(selectedDemand.end_time)" />
              <van-cell title="预计人数" :value="selectedDemand.expected_count" />
              <van-cell title="所需赞助" :value="selectedDemand.sponsor_types" />
            </van-cell-group>
          </template>
          
          <template v-else-if="selectedDemand.demand_type === 'space'">
            <van-cell-group inset title="场地信息">
              <van-cell title="场地位置" :value="selectedDemand.space_location" />
              <van-cell title="场地面积" :value="`${selectedDemand.space_area}㎡`" />
              <van-cell title="运营要求" :label="selectedDemand.space_requirement" />
            </van-cell-group>
          </template>
          
          <template v-else-if="selectedDemand.demand_type === 'consult'">
            <van-cell-group inset title="顾问需求">
              <van-cell title="咨询领域" :value="selectedDemand.consult_field" />
              <van-cell title="咨询时长" :value="selectedDemand.consult_duration" />
              <van-cell title="具体要求" :label="selectedDemand.consult_requirement" />
            </van-cell-group>
          </template>
          
          <template v-if="isLoggedIn">
            <van-cell-group inset title="社区联系方式">
              <van-cell title="联系人" :value="selectedDemand.community?.contact_name || '暂无'" />
              <van-cell title="联系电话" :value="selectedDemand.community?.phone || '暂无'" />
              <van-cell title="详细地址" :value="selectedDemand.community?.address || '暂无'" />
            </van-cell-group>
          </template>
          
          <template v-else>
            <div class="login-tip">
              <van-icon name="lock" size="40" color="#999" />
              <p>登录后可查看社区联系方式和详细信息</p>
              <van-button type="primary" size="small" @click="router.push('/login')">立即登录</van-button>
            </div>
          </template>
        </div>
        
        <div class="popup-footer" v-if="isLoggedIn">
          <van-button type="primary" block round @click="contactCommunity">
            联系社区
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import api from '../api'
import { formatDateTime } from '../utils'

const router = useRouter()
const activeTab = ref(0)
const isLoggedIn = ref(false)
const merchantInfo = ref(null)
const demands = ref([])
const sponsorList = ref([])
const platformStats = ref({
  activityCount: 0,
  recruitingCount: 0,
  completedCount: 0
})
const sponsorStats = ref({
  total: 0,
  totalViews: 0,
  totalConsults: 0
})
const unreadCount = ref(0)
const loadingDemands = ref(true)
const loadingSponsors = ref(true)
const showDetailPopup = ref(false)
const selectedDemand = ref(null)

const getMemberLevel = (level) => {
  const levels = ['免费普通会员', '银卡会员', '金卡会员', '钻石会员']
  return levels[level] || '免费普通会员'
}

const getDemandTypeText = (type) => {
  const texts = {
    activity: '活动需求',
    space: '场地招商',
    consult: '专家顾问'
  }
  return texts[type] || '活动需求'
}

const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '招募中',
    2: '已结束'
  }
  return statusMap[status] || '未知'
}

const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'default'
  }
  return typeMap[status] || 'default'
}

const getHeartCount = (score) => {
  if (score >= 90) return 5
  if (score >= 70) return 4
  if (score >= 50) return 3
  if (score >= 30) return 2
  if (score >= 10) return 1
  return 0
}

const showDemandDetail = (item) => {
  selectedDemand.value = item
  showDetailPopup.value = true
}

const contactCommunity = () => {
  if (selectedDemand.value?.community?.phone) {
    window.location.href = `tel:${selectedDemand.value.community.phone}`
  } else {
    showSuccessToast('暂无联系方式')
  }
}

const fetchData = async () => {
  const token = localStorage.getItem('merchant_token')
  isLoggedIn.value = !!token
  
  loadingDemands.value = true
  loadingSponsors.value = true
  
  try {
    console.log('开始获取平台统计数据...')
    const [platformStatsRes, demandsRes] = await Promise.all([
      api.activity.getStats(),
      api.merchant.getActivities({ pageSize: 5 })
    ])
    
    console.log('平台统计数据响应:', platformStatsRes)
    console.log('需求列表响应:', demandsRes)
    
    if (platformStatsRes && platformStatsRes.code === 200) {
      platformStats.value = platformStatsRes.data
      console.log('platformStats.value已更新为:', platformStats.value)
    }
    
    if (demandsRes.code === 200) {
      demands.value = demandsRes.data.list || demandsRes.data || []
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loadingDemands.value = false
  }
  
  if (isLoggedIn.value) {
    try {
      const [profileRes, statsRes, messageRes, sponsorRes] = await Promise.all([
        api.merchant.getProfile(),
        api.sponsor.getStats(),
        api.message.getUnreadCount(),
        api.sponsor.getList({ pageSize: 5 })
      ])
      
      if (profileRes.code === 200) {
        merchantInfo.value = profileRes.data
      }
      
      if (statsRes.code === 200) {
        sponsorStats.value = statsRes.data
      }
      
      if (messageRes.code === 200) {
        unreadCount.value = messageRes.data.count
      }
      
      if (sponsorRes.code === 200) {
        sponsorList.value = sponsorRes.data.list || []
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
    } finally {
      loadingSponsors.value = false
    }
  } else {
    loadingSponsors.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
  background: #f5f5f5;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-buttons {
  display: flex;
  gap: 8px;
}

.banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin: 12px;
  border-radius: 12px;
}

.banner-text {
  color: #fff;
  font-size: 16px;
  text-align: center;
}

.member-card {
  background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
  margin: 12px;
  padding: 16px;
  border-radius: 12px;
  color: #fff;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.member-level {
  background: rgba(255, 255, 255, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.member-name {
  font-size: 18px;
  font-weight: bold;
}

.member-quota {
  font-size: 14px;
  margin-bottom: 12px;
  opacity: 0.9;
}

.section {
  margin-top: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.demand-stats,
.sponsor-stats {
  margin: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #323233;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.demand-list-section,
.sponsor-list-section {
  margin: 12px;
}

.quick-actions {
  padding: 12px;
  text-align: center;
}

.demand-item,
.sponsor-item {
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.demand-item:last-child,
.sponsor-item:last-child {
  border-bottom: none;
}

.demand-header,
.sponsor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.demand-title,
.sponsor-title {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demand-info,
.sponsor-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
}

.demand-info span,
.sponsor-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.match-hearts {
  display: flex;
  align-items: center;
  gap: 2px;
}

.match-label {
  font-size: 12px;
  color: #969799;
  margin-right: 4px;
}

.community-name {
  font-size: 12px;
  color: #969799;
}

.demand-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

.community-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f8f8;
  margin: 12px;
  border-radius: 8px;
}

.community-info-card .name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.community-info-card .address {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.popup-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.login-tip {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.login-tip p {
  margin: 16px 0;
  font-size: 14px;
}
</style>
