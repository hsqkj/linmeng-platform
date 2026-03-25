<template>
  <div class="activities-page">
    <van-nav-bar title="需求广场" left-arrow @click-left="router.back()">
      <template #right>
        <div class="nav-right">
          <van-icon name="filter-o" size="20" @click="showFilter = true" />
          <van-button v-if="!isLoggedIn" size="small" plain type="primary" @click="router.push('/login')">登录</van-button>
        </div>
      </template>
    </van-nav-bar>
    
    <van-search
      v-model="searchText"
      placeholder="搜索需求"
      @search="onSearch"
    />
    
    <van-dropdown-menu>
      <van-dropdown-item v-model="filter.demandType" :options="demandTypeOptions" @change="onFilterChange" />
      <van-dropdown-item v-model="filter.community" :options="communityOptions" @change="onFilterChange" />
      <van-dropdown-item v-model="filter.matchScore" :options="matchScoreOptions" @change="onFilterChange" />
      <van-dropdown-item v-model="filter.sort" :options="sortOptions" @change="onFilterChange" />
    </van-dropdown-menu>
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="list.length === 0 && !loading" description="暂无需求" />
        
        <van-card
          v-for="item in list"
          :key="item.id"
          class="activity-card"
          @click="showActivityDetail(item)"
        >
          <template #thumb>
            <van-image
              :src="item.cover_img || 'https://via.placeholder.com/100'"
              width="100"
              height="80"
              fit="cover"
            />
          </template>
          
          <template #title>
            <div class="card-title">{{ item.title }}</div>
          </template>
          
          <template #desc>
            <div class="card-desc">
              <div class="desc-item">
                <van-icon name="clock-o" />
                <span>{{ formatDateTime(item.start_time) }}</span>
              </div>
              <div class="desc-item">
                <van-icon name="location-o" />
                <span>{{ item.location }}</span>
              </div>
              <div class="desc-item">
                <van-icon name="friends-o" />
                <span>{{ item.expected_count }}人 · {{ item.target_crowd }}</span>
              </div>
            </div>
          </template>
          
          <template #tags>
            <van-tag plain type="primary" style="margin-right: 4px">{{ getDemandTypeText(item.demand_type) }}</van-tag>
            <van-tag plain type="success" style="margin-right: 4px">{{ item.sponsor_types }}</van-tag>
            <van-tag 
              v-for="(tag, index) in item.tag_names" 
              :key="'tag-' + index"
              plain 
              type="warning" 
              style="margin-right: 4px"
            >{{ tag }}</van-tag>
            <van-tag 
              v-for="(tag, index) in (item.custom_tags ? JSON.parse(item.custom_tags) : [])" 
              :key="'custom-' + index"
              plain 
              type="success" 
              style="margin-right: 4px"
            >{{ tag }}</van-tag>
          </template>
          
          <template #footer>
            <div class="card-footer">
              <div class="footer-left">
                <span class="community">{{ item.community_name }}</span>
                <span class="view-count">
                  <van-icon name="eye-o" /> {{ item.view_count || 0 }}
                </span>
                <div class="match-hearts">
                  <span class="match-label">匹配度：</span>
                  <van-icon 
                    v-for="i in 5" 
                    :key="i"
                    :name="i <= getHeartCount(item.match_score) ? 'like' : 'like-o'"
                    :color="i <= getHeartCount(item.match_score) ? '#ee0a24' : '#dcdee0'"
                    size="14"
                  />
                </div>
              </div>
              <div class="footer-actions">
                <van-icon 
                  :name="item.is_favorited ? 'star' : 'star-o'" 
                  :color="item.is_favorited ? '#ff976a' : '#969799'"
                  size="20"
                  @click.stop="toggleFavorite(item)"
                />
                <van-icon 
                  name="share-o" 
                  size="20"
                  color="#969799"
                  @click.stop="shareDemand(item)"
                />
                <van-button v-if="isLoggedIn" size="small" type="primary" @click.stop="openApplyPopup(item)">
                  立即报名
                </van-button>
                <van-button v-else size="small" plain type="primary" @click.stop="router.push('/login')">
                  登录报名
                </van-button>
              </div>
            </div>
          </template>
        </van-card>
      </van-list>
    </van-pull-refresh>
    
    <van-tabbar v-model="activeTabbar" fixed>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/activities">需求</van-tabbar-item>
      <van-tabbar-item v-if="isLoggedIn" icon="orders-o" to="/cooperations">合作</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
    
    <van-popup v-model:show="showFilter" position="right" style="width: 80%; height: 100%">
      <div class="filter-panel">
        <van-nav-bar title="筛选" left-arrow @click-left="showFilter = false" />
        <van-cell-group inset>
          <van-field label="活动时间" readonly />
          <van-calendar :show-confirm="false" @select="onDateSelect" />
        </van-cell-group>
        <div class="filter-footer">
          <van-button block @click="resetFilter">重置</van-button>
          <van-button type="primary" block @click="applyFilter">确定</van-button>
        </div>
      </div>
    </van-popup>
    
    <van-popup v-model:show="showApplyPopup" position="bottom" round style="height: 60%">
      <div class="apply-popup">
        <van-nav-bar title="报名赞助">
          <template #right>
            <van-icon name="cross" size="20" @click="showApplyPopup = false" />
          </template>
        </van-nav-bar>
        
        <van-form @submit="onApply">
          <van-cell-group inset>
            <van-field
              v-model="applyForm.sponsor_type"
              name="sponsor_type"
              label="赞助类型"
              placeholder="请输入赞助类型"
              :rules="[{ required: true, message: '请输入赞助类型' }]"
            />
            
            <van-field
              v-model="applyForm.sponsor_detail"
              name="sponsor_detail"
              label="赞助详情"
              placeholder="请详细描述您提供的赞助内容"
              type="textarea"
              rows="4"
              :rules="[{ required: true, message: '请输入赞助详情' }]"
            />
          </van-cell-group>
          
          <div class="apply-footer">
            <van-button type="primary" block round native-type="submit" :loading="applyLoading">
              提交报名
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
    
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="popup-content" v-if="selectedActivity">
        <div class="popup-header">
          <h3>活动详情</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        
        <div class="popup-body">
          <div class="community-card">
            <van-image
              :src="selectedActivity.community?.logo || 'https://via.placeholder.com/80'"
              round
              width="60"
              height="60"
            />
            <div class="community-info-card">
              <div class="name">{{ selectedActivity.community?.name }}</div>
              <div class="address">{{ selectedActivity.community?.address }}</div>
            </div>
          </div>
          
          <van-cell-group inset title="活动信息">
            <van-cell title="活动标题" :value="selectedActivity.title" />
            <van-cell title="活动地点" :value="selectedActivity.location" />
            <van-cell title="开始时间" :value="formatDateTime(selectedActivity.start_time)" />
            <van-cell title="结束时间" :value="formatDateTime(selectedActivity.end_time)" />
            <van-cell title="预计人数" :value="selectedActivity.expected_count" />
            <van-cell title="目标人群" :value="selectedActivity.target_crowd" />
            <van-cell title="所需赞助" :value="selectedActivity.sponsor_types" />
            <van-cell title="活动描述" :label="selectedActivity.description" />
          </van-cell-group>
          
          <template v-if="isLoggedIn">
            <van-cell-group inset title="社区联系方式">
              <van-cell title="联系人" :value="selectedActivity.community?.contact_name || '暂无'" />
              <van-cell title="联系电话" :value="selectedActivity.community?.phone || '暂无'" />
              <van-cell title="详细地址" :value="selectedActivity.community?.address || '暂无'" />
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
          <van-button type="primary" block round @click="openApplyPopup(selectedActivity)">
            立即报名
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import api from '../api'
import { formatDateTime } from '../utils'

const router = useRouter()
const isLoggedIn = ref(false)
const activeTabbar = ref(1)
const searchText = ref('')
const showFilter = ref(false)
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

const showApplyPopup = ref(false)
const applyLoading = ref(false)
const currentActivity = ref(null)
const showDetailPopup = ref(false)
const selectedActivity = ref(null)

const applyForm = reactive({
  sponsor_type: '',
  sponsor_detail: ''
})

const filter = reactive({
  demandType: 0,
  community: 0,
  matchScore: 0,
  sort: 0,
  date: null
})

const demandTypeOptions = [
  { text: '全部类型', value: 0 },
  { text: '活动需求', value: 'activity' },
  { text: '场地招商', value: 'space' },
  { text: '专家顾问', value: 'consult' }
]

const communityOptions = ref([
  { text: '全部社区', value: 0 }
])

const matchScoreOptions = [
  { text: '全部匹配度', value: 0 },
  { text: '60%以上', value: 60 },
  { text: '70%以上', value: 70 },
  { text: '80%以上', value: 80 },
  { text: '90%以上', value: 90 }
]

const sortOptions = [
  { text: '综合排序', value: 0 },
  { text: '即将开始', value: 1 },
  { text: '人数最多', value: 2 },
  { text: '关注最多', value: 3 },
  { text: '匹配度最高', value: 4 }
]

const getHeartCount = (score) => {
  if (score >= 90) return 5
  if (score >= 70) return 4
  if (score >= 50) return 3
  if (score >= 30) return 2
  if (score >= 10) return 1
  return 0
}

const fetchList = async () => {
  try {
    const params = {
      page: page.value,
      pageSize,
      keyword: searchText.value,
      demand_type: filter.demandType || undefined,
      community_id: filter.community || undefined,
      match_min: filter.matchScore || undefined,
      sort: filter.sort
    }
    const res = await api.merchant.getActivities(params)
    if (res.code === 200) {
      const newList = res.data.list || res.data || []
      if (page.value === 1) {
        list.value = newList
      } else {
        list.value.push(...newList)
      }
      finished.value = newList.length < pageSize
    }
  } catch (error) {
    console.error('获取需求列表失败:', error)
  }
}

const loadCommunities = async () => {
  try {
    const res = await api.merchant.getCommunities()
    if (res.code === 200 && res.data) {
      communityOptions.value = [
        { text: '全部社区', value: 0 },
        ...res.data.map(c => ({ text: c.community_name, value: c.id }))
      ]
    }
  } catch (error) {
    console.error('获取社区列表失败:', error)
  }
}

const toggleFavorite = async (item) => {
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  try {
    const res = await api.merchant.toggleFavorite(item.id)
    if (res.code === 200) {
      item.is_favorited = res.data.is_favorited
      showToast(res.message)
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    showToast('操作失败')
  }
}

const shareDemand = (item) => {
  if (navigator.share) {
    navigator.share({
      title: item.title,
      text: `社区需求：${item.title}`,
      url: window.location.href
    }).catch(err => console.log('分享取消', err))
  } else {
    showToast('请使用浏览器分享功能')
  }
}

const showActivityDetail = async (item) => {
  selectedActivity.value = item
  showDetailPopup.value = true
  
  if (isLoggedIn.value) {
    try {
      await api.merchant.incrementView(item.id)
      item.view_count = (item.view_count || 0) + 1
    } catch (error) {
      console.error('增加关注量失败:', error)
    }
  }
}

const onLoad = async () => {
  await fetchList()
  loading.value = false
  page.value++
}

const onRefresh = async () => {
  page.value = 1
  finished.value = false
  await fetchList()
  refreshing.value = false
}

const onSearch = () => {
  page.value = 1
  list.value = []
  finished.value = false
  onLoad()
}

const onFilterChange = () => {
  page.value = 1
  list.value = []
  finished.value = false
  onLoad()
}

const onDateSelect = (date) => {
  filter.date = date
}

const getDemandTypeText = (type) => {
  const texts = {
    activity: '活动需求',
    space: '场地招商',
    consult: '专家顾问'
  }
  return texts[type] || '活动需求'
}

const resetFilter = () => {
  filter.demandType = 0
  filter.industry = 0
  filter.crowd = 0
  filter.sort = 0
  filter.date = null
}

const applyFilter = () => {
  showFilter.value = false
  onFilterChange()
}

const openApplyPopup = (item) => {
  currentActivity.value = item
  applyForm.sponsor_type = ''
  applyForm.sponsor_detail = ''
  showApplyPopup.value = true
}

const onApply = async () => {
  if (!currentActivity.value) return
  
  applyLoading.value = true
  try {
    const res = await api.merchant.applyActivity(currentActivity.value.id, {
      sponsor_type: applyForm.sponsor_type,
      sponsor_detail: applyForm.sponsor_detail
    })
    
    if (res.code === 200) {
      showSuccessToast('报名成功')
      showApplyPopup.value = false
      router.push('/cooperations')
    } else {
      showToast(res.message || '报名失败')
    }
  } catch (error) {
    showToast(error.response?.data?.message || '报名失败')
  } finally {
    applyLoading.value = false
  }
}

onMounted(() => {
  const token = localStorage.getItem('merchant_token')
  isLoggedIn.value = !!token
  
  loadCommunities()
  onLoad()
})
</script>

<style scoped>
.activities-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-card {
  margin: 12px;
  border-radius: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 13px;
}

.desc-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  margin-top: 4px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.community {
  font-size: 12px;
  color: #999;
}

.view-count {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.match-hearts {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
}

.match-label {
  font-size: 12px;
  color: #969799;
  margin-right: 4px;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin-top: auto;
}

.apply-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.apply-footer {
  padding: 16px;
  margin-top: auto;
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
