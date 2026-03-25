<template>
  <div class="cooperation-detail-page">
    <van-nav-bar title="合作详情" left-arrow @click-left="router.back()" />
    
    <van-skeleton v-if="loading" :row="10" />
    
    <template v-else-if="cooperation">
      <van-cell-group inset>
        <div class="header">
          <div class="title">{{ cooperation.activity?.title }}</div>
          <van-tag :type="getStatusType(cooperation.status)" size="large">
            {{ getStatusText(cooperation.status) }}
          </van-tag>
        </div>
      </van-cell-group>
      
      <van-cell-group inset title="活动信息">
        <van-cell title="活动时间" :value="formatDateTime(cooperation.activity?.start_time)" icon="clock-o" />
        <van-cell title="活动地点" :value="cooperation.activity?.location" icon="location-o" />
        <van-cell title="预计人数" :value="`${cooperation.activity?.expected_count}人`" icon="friends-o" />
      </van-cell-group>
      
      <van-cell-group inset title="社区信息">
        <van-cell title="社区名称" :value="cooperation.communityInfo?.community_name" icon="home-o" />
        <van-cell title="联系人" :value="cooperation.communityInfo?.contact_name" icon="user-o" />
        <van-cell title="联系电话" :value="cooperation.communityInfo?.phone" icon="phone-o" />
      </van-cell-group>
      
      <van-cell-group inset title="我的赞助">
        <van-cell title="赞助类型" :value="cooperation.sponsor_type" />
        <van-cell title="赞助详情">
          <template #value>
            <div class="sponsor-detail">{{ cooperation.sponsor_detail }}</div>
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset title="申请时间">
        <van-cell :value="formatDateTime(cooperation.create_time)" />
      </van-cell-group>
      
      <div class="bottom-bar" v-if="cooperation.status === 0">
        <van-button type="danger" block round @click="handleCancel">
          取消报名
        </van-button>
      </div>
    </template>
    
    <van-empty v-else description="合作记录不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import api from '../api'
import { formatDateTime } from '../utils'

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
    const res = await api.merchant.getCooperationDetail(route.params.id)
    if (res.code === 200) {
      cooperation.value = res.data
    }
  } catch (error) {
    console.error('获取合作详情失败:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = async () => {
  showConfirmDialog({
    title: '取消报名',
    message: '确定要取消此报名吗？'
  })
    .then(async () => {
      const res = await api.merchant.cancelCooperation(route.params.id)
      if (res.code === 200) {
        showToast('已取消报名')
        router.back()
      } else {
        showToast(res.message || '操作失败')
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.header .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.sponsor-detail {
  text-align: right;
  color: #666;
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style>
