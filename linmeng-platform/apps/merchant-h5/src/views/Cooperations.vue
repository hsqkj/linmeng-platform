<template>
  <div class="cooperations-page">
    <van-nav-bar title="我的合作" left-arrow @click-left="router.back()" />
    
    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab title="全部" name="all" />
      <van-tab title="待确认" name="0" />
      <van-tab title="已确认" name="1" />
      <van-tab title="已完成" name="3" />
    </van-tabs>
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="list.length === 0 && !loading" description="暂无合作记录" />
        
        <van-card
          v-for="item in list"
          :key="item.id"
          class="cooperation-card"
          @click="router.push(`/cooperation/${item.id}`)"
        >
          <template #title>
            <div class="card-header">
              <span class="activity-title">{{ item.activity_title }}</span>
              <van-tag :type="getStatusType(item.status)">{{ getStatusText(item.status) }}</van-tag>
            </div>
          </template>
          
          <template #desc>
            <div class="card-desc">
              <div class="desc-item">
                <van-icon name="clock-o" />
                <span>{{ formatDateTime(item.activity_time) }}</span>
              </div>
              <div class="desc-item">
                <van-icon name="location-o" />
                <span>{{ item.activity_location }}</span>
              </div>
              <div class="sponsor-info">
                <span class="label">我的赞助:</span>
                <span>{{ item.sponsor_type }}</span>
              </div>
            </div>
          </template>
          
          <template #footer>
            <div class="card-footer">
              <span class="community">{{ item.community_name }}</span>
              <span class="time">{{ formatDateTime(item.create_time) }}</span>
            </div>
          </template>
        </van-card>
      </van-list>
    </van-pull-refresh>
    
    <van-tabbar v-model="activeTabbar" fixed>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/activities">需求</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/cooperations">合作</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { formatDateTime } from '../utils'

const router = useRouter()
const activeTab = ref('all')
const activeTabbar = ref(2)
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10
const initialized = ref(false)

const getStatusType = (status) => {
  const types = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'default' }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = { 0: '待确认', 1: '已确认', 2: '已拒绝', 3: '已完成' }
  return texts[status] || '未知'
}

const fetchList = async () => {
  try {
    const params = {
      page: page.value,
      pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    }
    const res = await api.merchant.getCooperations(params)
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
    console.error('获取合作列表失败:', error)
  }
}

const onLoad = async () => {
  if (!initialized.value) return
  await fetchList()
  loading.value = false
  page.value++
}

const onRefresh = async () => {
  page.value = 1
  finished.value = false
  await fetchList()
  refreshing.value = false
  page.value++
}

const onTabChange = () => {
  page.value = 1
  list.value = []
  finished.value = false
}

onMounted(() => {
  initialized.value = true
})
</script>

<style scoped>
.cooperations-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.cooperation-card {
  margin: 12px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.card-desc {
  margin-top: 8px;
}

.desc-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.sponsor-info {
  margin-top: 8px;
  font-size: 13px;
}

.sponsor-info .label {
  color: #999;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
</style>
