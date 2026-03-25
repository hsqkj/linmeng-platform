<template>
  <div class="member-page">
    <van-nav-bar title="会员中心" left-arrow @click-left="router.back()" />
    
    <div class="current-member" v-if="merchantInfo">
      <div class="member-card" :class="getMemberClass(merchantInfo.member_level)">
        <div class="member-header">
          <span class="member-level">{{ getMemberLevel(merchantInfo.member_level) }}</span>
          <span class="expire" v-if="merchantInfo.member_expire">
            有效期至: {{ formatDate(merchantInfo.member_expire) }}
          </span>
        </div>
        <div class="member-quota">
          <div class="quota-item">
            <span class="quota-label">每月报名配额:</span>
            <span class="quota-value">{{ merchantInfo.member_level === 3 ? '不限' : (merchantInfo.monthly_quota || 0) + '次' }}</span>
          </div>
          <div class="quota-item" v-if="merchantInfo.member_level !== 3">
            <span class="quota-label">本月已使用:</span>
            <span class="quota-value">{{ merchantInfo.used_quota || 0 }}次</span>
          </div>
          <div class="quota-item highlight" v-if="merchantInfo.member_level !== 3">
            <span class="quota-label">本月剩余:</span>
            <span class="quota-value">{{ (merchantInfo.monthly_quota || 0) - (merchantInfo.used_quota || 0) }}次</span>
          </div>
        </div>
      </div>
    </div>
    
    <van-cell-group inset title="会员套餐">
      <div class="package-list">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-item"
          :class="{ active: selectedPackage === pkg.id }"
          @click="selectedPackage = pkg.id"
        >
          <div class="package-header">
            <span class="package-name">{{ pkg.name }}</span>
            <span class="package-price">¥{{ pkg.price }}{{ pkg.duration === 30 ? '' : '/年' }}</span>
          </div>
          <div class="package-features">
            <div v-for="(feature, index) in getFeatures(pkg.features)" :key="index" class="feature-item">
              <van-icon name="passed" color="#07c160" />
              <span>{{ feature }}</span>
            </div>
          </div>
          <van-icon v-if="selectedPackage === pkg.id" name="success" class="check-icon" />
        </div>
      </div>
    </van-cell-group>
    
    <div class="bottom-bar">
      <div class="price-info">
        <span class="label">应付金额:</span>
        <span class="price">¥{{ selectedPackageInfo?.price || 0 }}</span>
      </div>
      <van-button type="primary" round @click="handlePay" :loading="payLoading">
        立即开通
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import api from '../api'
import { formatDate } from '../utils'

const router = useRouter()
const merchantInfo = ref(null)
const packages = ref([])
const selectedPackage = ref(1)
const payLoading = ref(false)

const getMemberClass = (level) => {
  const classes = ['', 'silver', 'gold', 'diamond']
  return classes[level] || ''
}

const getMemberLevel = (level) => {
  const levels = ['免费普通会员', '银卡会员', '金卡会员', '钻石会员']
  return levels[level] || '免费普通会员'
}

const getFeatures = (features) => {
  try {
    return JSON.parse(features)
  } catch {
    return []
  }
}

const selectedPackageInfo = computed(() => {
  return packages.value.find(p => p.id === selectedPackage.value)
})

const fetchMerchantInfo = async () => {
  try {
    const res = await api.merchant.getProfile()
    if (res.code === 200) {
      merchantInfo.value = res.data
    }
  } catch (error) {
    console.error('获取商家信息失败:', error)
  }
}

const fetchPackages = async () => {
  try {
    const res = await api.merchant.getMemberPackages()
    if (res.code === 200) {
      packages.value = res.data || []
    }
  } catch (error) {
    console.error('获取套餐失败:', error)
  }
}

const handlePay = async () => {
  if (!selectedPackage.value) {
    showToast('请选择套餐')
    return
  }
  
  payLoading.value = true
  try {
    const res = await api.merchant.createOrder({
      package_id: selectedPackage.value
    })
    
    if (res.code === 200) {
      showToast('支付功能开发中')
    }
  } catch (error) {
    showToast('创建订单失败')
  } finally {
    payLoading.value = false
  }
}

onMounted(() => {
  fetchMerchantInfo()
  fetchPackages()
})
</script>

<style scoped>
.member-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px;
}

.current-member {
  padding: 16px;
}

.member-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
}

.member-card.normal {
  background: linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%);
}

.member-card.silver {
  background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%);
}

.member-card.gold {
  background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
}

.member-card.diamond {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.member-level {
  font-size: 18px;
  font-weight: bold;
}

.expire {
  font-size: 12px;
  opacity: 0.8;
}

.member-quota {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 10px;
}

.quota-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.quota-item.highlight {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: bold;
}

.quota-label {
  opacity: 0.9;
}

.quota-value {
  font-weight: bold;
}

.package-list {
  padding: 12px;
}

.package-item {
  background: #fff;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
  transition: all 0.3s;
}

.package-item.active {
  border-color: #1989fa;
  background: #f0f7ff;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.package-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.package-price {
  font-size: 20px;
  font-weight: bold;
  color: #f5222d;
}

.package-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.check-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #1989fa;
  font-size: 24px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.price-info .label {
  font-size: 14px;
  color: #666;
}

.price-info .price {
  font-size: 24px;
  font-weight: bold;
  color: #f5222d;
  margin-left: 8px;
}

.bottom-bar .van-button {
  width: 120px;
}
</style>
