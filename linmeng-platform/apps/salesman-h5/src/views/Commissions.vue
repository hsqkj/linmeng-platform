<template>
  <div class="commissions-page">
    <van-nav-bar
      title="提成记录"
      left-arrow
      @click-left="$router.back()"
    />
    
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部" name="all" />
      <van-tab title="待结算" name="pending" />
      <van-tab title="已结算" name="settled" />
    </van-tabs>
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="list.length === 0 && !loading" description="暂无提成记录" />
        
        <van-cell-group v-for="item in list" :key="item.id" inset class="commission-item">
          <van-cell>
            <template #title>
              <div class="merchant-name">{{ item.merchant?.business_name || '未知商户' }}</div>
              <div class="order-info">提成编号：{{ item.commission_code || '-' }}</div>
            </template>
            <template #value>
              <div class="commission-amount">+¥{{ item.commission_amount }}</div>
            </template>
          </van-cell>
          
          <van-cell>
            <template #title>
              <div class="detail-info">
                <div><span class="label">订单金额：</span>¥{{ item.order_amount }}</div>
                <div><span class="label">提成比例：</span>{{ item.commission_rate }}%</div>
                <div><span class="label">创建时间：</span>{{ formatTime(item.create_time) }}</div>
                <div><span class="label">结算状态：</span>
                  <van-tag :type="item.status === 1 ? 'success' : 'warning'">
                    {{ item.status === 1 ? '已结算' : '待结算' }}
                  </van-tag>
                </div>
                <div v-if="item.settle_time"><span class="label">结算时间：</span>{{ formatTime(item.settle_time) }}</div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import api from '../api'

const activeTab = ref('all')
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 20

const formatTime = (time) => {
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const fetchList = async () => {
  try {
    const params = {
      page: page.value,
      pageSize
    }
    
    if (activeTab.value === 'pending') {
      params.status = 0
    } else if (activeTab.value === 'settled') {
      params.status = 1
    }
    
    const res = await api.salesman.getCommissions(params)
    
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
    console.error('获取提成记录失败:', error)
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
})

onMounted(() => {
  onLoad()
})
</script>

<style scoped>
.commissions-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20px;
}

.commission-item {
  margin: 12px;
}

.merchant-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.order-info {
  font-size: 12px;
  color: #999;
}

.commission-amount {
  font-size: 18px;
  font-weight: bold;
  color: #f5222d;
}

.detail-info {
  font-size: 14px;
  color: #666;
}

.detail-info div {
  margin-bottom: 4px;
}

.label {
  color: #999;
}
</style>
