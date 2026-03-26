<template>
  <div class="merchants-page">
    <van-nav-bar
      title="我的商户"
      left-arrow
      @click-left="$router.back()"
    />
    
    <van-search
      v-model="searchText"
      placeholder="搜索商户名称"
      @search="onSearch"
    />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="list.length === 0 && !loading" description="暂无商户" />
        
        <van-cell-group v-for="item in list" :key="item.id" inset class="merchant-item">
          <van-cell>
            <template #title>
              <div class="merchant-name">{{ item.business_name }}</div>
              <div class="merchant-info">
                <van-tag type="primary" size="small">{{ item.industry || '未设置行业' }}</van-tag>
                <span class="merchant-time">{{ formatTime(item.create_time) }}</span>
              </div>
            </template>
            <template #value>
              <div class="merchant-stats">
                <div class="stat-item">
                  <div class="stat-label">会员等级</div>
                  <div class="stat-value">{{ getMemberLevel(item.member_level) }}</div>
                </div>
              </div>
            </template>
          </van-cell>
          
          <van-cell>
            <template #title>
              <div class="contact-info">
                <div><van-icon name="user-o" /> {{ item.contact_name || '未设置' }}</div>
                <div><van-icon name="phone-o" /> {{ item.phone || '未设置' }}</div>
                <div><van-icon name="location-o" /> {{ item.address || '未设置地址' }}</div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showSuccessToast } from 'vant'
import api from '../api'

const searchText = ref('')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 20

const formatTime = (time) => {
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getMemberLevel = (level) => {
  const levels = ['普通会员', '铜牌会员', '银牌会员', '金牌会员', '钻石会员']
  return levels[level] || '普通会员'
}

const fetchList = async () => {
  try {
    const res = await api.salesman.getMerchants({
      page: page.value,
      pageSize,
      search: searchText.value
    })
    
    if (res.code === 200) {
      const newList = res.data.list || []
      if (page.value === 1) {
        list.value = newList
      } else {
        list.value.push(...newList)
      }
      finished.value = newList.length < pageSize
    }
  } catch (error) {
    console.error('获取商户列表失败:', error)
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
  finished.value = false
  list.value = []
  onLoad()
}

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.merchants-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20px;
}

.merchant-item {
  margin: 12px;
}

.merchant-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.merchant-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.merchant-time {
  font-size: 12px;
  color: #999;
}

.merchant-stats {
  text-align: right;
}

.stat-item {
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #1989fa;
}

.contact-info {
  font-size: 14px;
  color: #666;
}

.contact-info div {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
