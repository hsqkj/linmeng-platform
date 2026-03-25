<template>
  <div class="message-page">
    <van-nav-bar title="消息中心">
      <template #right>
        <span class="read-all" @click="readAll">全部已读</span>
      </template>
    </van-nav-bar>
    
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="系统通知" name="system" />
      <van-tab title="对接消息" name="cooperation" />
    </van-tabs>
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="list.length === 0 && !loading" description="暂无消息" />
        
        <div
          v-for="item in list"
          :key="item.id"
          class="message-item"
          :class="{ unread: item.read_status === 0 }"
          @click="handleClick(item)"
        >
          <div class="message-icon">
            <van-icon v-if="item.msg_type === 0" name="bell" size="24" color="#1989fa" />
            <van-icon v-else name="chat-o" size="24" color="#07c160" />
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="title">{{ item.msg_type === 0 ? '系统通知' : '对接消息' }}</span>
              <span class="time">{{ formatTime(item.create_time) }}</span>
            </div>
            <div class="message-text">{{ item.content }}</div>
          </div>
        </div>
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
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import api from '../api'
import { formatDateTime } from '../utils'

const router = useRouter()
const activeTab = ref('system')
const activeTabbar = ref(0)
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const unreadCount = ref(0)
const page = ref(1)
const pageSize = 20

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return `${date.getMonth() + 1}-${date.getDate()}`
}

const fetchList = async () => {
  try {
    const res = await api.message.getList({
      page: page.value,
      pageSize,
      msg_type: activeTab.value === 'system' ? 0 : 1
    })
    
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
    console.error('获取消息列表失败:', error)
  }
}

const fetchUnreadCount = async () => {
  try {
    const res = await api.message.getUnreadCount()
    if (res.code === 200) {
      unreadCount.value = res.data.count
    }
  } catch (error) {
    console.error('获取未读数量失败:', error)
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

const handleClick = async (item) => {
  if (item.read_status === 0) {
    await api.message.read(item.id)
    item.read_status = 1
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
  
  if (item.msg_type === 1 && item.activity_id) {
    router.push(`/activity/${item.activity_id}`)
  }
}

const readAll = async () => {
  try {
    await api.message.readAll()
    list.value.forEach(item => {
      item.read_status = 1
    })
    unreadCount.value = 0
    showSuccessToast('已全部标记为已读')
  } catch (error) {
    console.error('操作失败:', error)
  }
}

watch(activeTab, () => {
  page.value = 1
  list.value = []
  finished.value = false
  onLoad()
})

onMounted(() => {
  fetchUnreadCount()
})
</script>

<style scoped>
.message-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.read-all {
  font-size: 14px;
  color: #1989fa;
}

.message-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.message-item.unread {
  background: #f0f7ff;
}

.message-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.message-header .title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.message-header .time {
  font-size: 12px;
  color: #999;
}

.message-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
