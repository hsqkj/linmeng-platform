<template>
  <div class="evaluate-list-page">
    <van-nav-bar title="我的评价" left-arrow @click-left="router.back()" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="list.length === 0 && !loading" description="暂无评价" />
        
        <van-card
          v-for="item in list"
          :key="item.id"
          class="evaluate-card"
        >
          <template #title>
            <div class="card-header">
              <span class="merchant-name">{{ item.business_name }}</span>
              <van-rate :model-value="item.total_score" readonly size="12" />
            </div>
          </template>
          
          <template #desc>
            <div class="card-desc">
              <div class="scores">
                <span>质量: {{ item.score_quality }}</span>
                <span>配合: {{ item.score_cooperate }}</span>
                <span>服务: {{ item.score_service }}</span>
              </div>
              <div class="content">{{ item.content }}</div>
            </div>
          </template>
          
          <template #footer>
            <div class="card-footer">
              <span class="activity">{{ item.activity_title }}</span>
              <span class="time">{{ item.create_time }}</span>
            </div>
          </template>
          
          <template #thumb>
            <van-image
              v-if="item.img"
              :src="item.img.split(',')[0]"
              width="80"
              height="80"
              fit="cover"
              @click="previewImage(item.img)"
            />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showImagePreview } from 'vant'
import api from '../../api'

const router = useRouter()
const activeTabbar = ref(0)
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10

const fetchList = async () => {
  try {
    const res = await api.evaluate.getList({
      page: page.value,
      pageSize
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
    console.error('获取评价列表失败:', error)
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

const previewImage = (imgs) => {
  const images = imgs.split(',')
  showImagePreview(images)
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.evaluate-list-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.evaluate-card {
  margin: 12px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.merchant-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.card-desc {
  margin-top: 8px;
}

.scores {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.content {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
</style>
