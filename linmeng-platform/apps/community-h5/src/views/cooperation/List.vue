<template>
  <div class="cooperation-list-page">
    <van-nav-bar title="合作记录" left-arrow @click-left="router.back()" />
    
    <van-tabs v-model:active="activeTab" sticky>
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
              <div class="merchant-info">
                <van-image
                  :src="item.merchant_logo || 'https://via.placeholder.com/40'"
                  round
                  width="40"
                  height="40"
                />
                <div class="merchant-detail">
                  <div class="merchant-name">{{ item.merchant_name }}</div>
                  <div class="sponsor-type">{{ item.sponsor_type }}</div>
                </div>
              </div>
            </div>
          </template>
          
          <template #footer>
            <div class="card-footer">
              <span class="time">{{ formatDateTime(item.create_time) }}</span>
            </div>
          </template>
        </van-card>
      </van-list>
    </van-pull-refresh>
    
    <van-tabbar v-model="activeTabbar" fixed>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="records-o" to="/activity/list">活动</van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/message">消息</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import { formatDateTime } from '../../utils'

const router = useRouter()
const activeTab = ref('all')
const activeTabbar = ref(0)
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

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
    const res = await api.cooperation.getList(params)
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

watch(activeTab, () => {
  page.value = 1
  list.value = []
  finished.value = false
  onLoad()
})

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.cooperation-list-page {
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
  margin-top: 12px;
}

.merchant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.merchant-name {
  font-size: 14px;
  color: #333;
}

.sponsor-type {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.time {
  font-size: 12px;
  color: #999;
}
</style>
