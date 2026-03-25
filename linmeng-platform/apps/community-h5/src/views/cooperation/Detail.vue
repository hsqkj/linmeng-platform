<template>
  <div class="cooperation-detail-page">
    <van-nav-bar title="合作详情" left-arrow @click-left="router.back()" />
    
    <van-skeleton v-if="loading" :row="8" />
    
    <template v-else-if="cooperation">
      <van-cell-group inset>
        <van-cell title="活动名称" :value="cooperation.activity_title" />
        <van-cell title="活动时间" :value="formatDateTime(cooperation.activity_time)" />
        <van-cell title="活动地点" :value="cooperation.activity_location" />
      </van-cell-group>
      
      <van-cell-group inset title="商家信息">
        <div class="merchant-card">
          <van-image
            :src="cooperation.merchant_logo || 'https://via.placeholder.com/60'"
            round
            width="60"
            height="60"
          />
          <div class="merchant-info">
            <div class="name">{{ cooperation.merchant_name }}</div>
            <div class="industry">{{ cooperation.merchant_industry }}</div>
            <van-rate :model-value="cooperation.merchant_rating" readonly size="12" />
          </div>
        </div>
      </van-cell-group>
      
      <van-cell-group inset title="赞助信息">
        <van-cell title="赞助类型" :value="cooperation.sponsor_type" />
        <van-cell title="赞助详情">
          <template #value>
            <div class="sponsor-detail">{{ cooperation.sponsor_detail }}</div>
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset title="状态">
        <div class="status-card">
          <van-tag :type="getStatusType(cooperation.status)" size="large">
            {{ getStatusText(cooperation.status) }}
          </van-tag>
          <p v-if="cooperation.reject_reason" class="reject-reason">
            拒绝原因: {{ cooperation.reject_reason }}
          </p>
        </div>
      </van-cell-group>
      
      <div class="bottom-bar" v-if="cooperation.status === 0">
        <van-button type="danger" plain @click="handleReject">拒绝</van-button>
        <van-button type="primary" @click="handleConfirm">确认合作</van-button>
      </div>
    </template>
    
    <van-empty v-else description="合作不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showConfirmDialog, showToast, showSuccessToast } from 'vant'
import api from '../../api'
import { formatDateTime } from '../../utils'

const router = useRouter()
const route = useRoute()
const cooperation = ref(null)
const loading = ref(true)

const getStatusType = (status) => {
  const types = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'default' }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = { 0: '待确认', 1: '已确认', 2: '已拒绝', 3: '已完成' }
  return texts[status] || '未知'
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await api.cooperation.getDetail(route.params.id)
    if (res.code === 200) {
      cooperation.value = res.data
    }
  } catch (error) {
    console.error('获取合作详情失败:', error)
  } finally {
    loading.value = false
  }
}

const handleConfirm = async () => {
  showConfirmDialog({
    title: '确认合作',
    message: '确认接受该商家的赞助申请？'
  })
    .then(async () => {
      const res = await api.cooperation.confirm(route.params.id)
      if (res.code === 200) {
        showSuccessToast('确认成功')
        fetchDetail()
      }
    })
    .catch(() => {})
}

const handleReject = async () => {
  showConfirmDialog({
    title: '拒绝合作',
    message: '确定要拒绝该商家的赞助申请吗？'
  })
    .then(async () => {
      const res = await api.cooperation.reject(route.params.id, { reason: '不符合需求' })
      if (res.code === 200) {
        showToast('已拒绝')
        fetchDetail()
      }
    })
    .catch(() => {})
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.cooperation-detail-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px;
}

.merchant-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.merchant-info .name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.merchant-info .industry {
  font-size: 13px;
  color: #999;
  margin: 4px 0;
}

.sponsor-detail {
  text-align: right;
  max-width: 200px;
  word-break: break-all;
}

.status-card {
  padding: 20px;
  text-align: center;
}

.reject-reason {
  margin-top: 12px;
  font-size: 13px;
  color: #999;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.bottom-bar .van-button {
  flex: 1;
}
</style>
