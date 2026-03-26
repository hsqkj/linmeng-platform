<template>
  <div class="home-page">
    <van-nav-bar title="邻盟招商大使平台">
      <template #right>
        <van-icon name="user-o" size="20" @click="router.push('/profile')" />
      </template>
    </van-nav-bar>
    
    <div class="stats-cards">
      <van-grid :column-num="3" :border="false">
        <van-grid-item>
          <template #text>
            <div class="stat-value">{{ stats.merchantCount }}</div>
            <div class="stat-label">渠道商户</div>
          </template>
        </van-grid-item>
        <van-grid-item>
          <template #text>
            <div class="stat-value">¥{{ stats.totalCommission }}</div>
            <div class="stat-label">累计提成</div>
          </template>
        </van-grid-item>
        <van-grid-item>
          <template #text>
            <div class="stat-value">¥{{ stats.pendingCommission }}</div>
            <div class="stat-label">待结算</div>
          </template>
        </van-grid-item>
      </van-grid>
    </div>
    
    <div class="channel-section">
      <van-cell-group inset title="我的渠道码">
        <div class="channel-content">
          <div class="qrcode-wrapper">
            <van-image :src="qrcodeUrl" width="200" height="200" />
          </div>
          <div class="channel-info">
            <div class="info-row">
              <span class="label">渠道码：</span>
              <span class="value">{{ salesmanInfo?.channel_code }}</span>
              <van-button size="small" plain type="primary" @click="copyChannelCode">复制</van-button>
            </div>
            <div class="info-row">
              <span class="label">渠道链接：</span>
              <van-button size="small" plain type="primary" @click="copyChannelLink">复制链接</van-button>
            </div>
            <div class="info-row">
              <span class="label">提成比例：</span>
              <span class="value">{{ salesmanInfo?.commission_rate }}%</span>
            </div>
          </div>
        </div>
      </van-cell-group>
    </div>
    
    <div class="merchant-section">
      <van-cell-group inset title="渠道商户">
        <van-cell title="商户列表" is-link to="/merchants" :value="`${stats.merchantCount}家`" />
        <van-cell title="提成记录" is-link to="/commissions" />
      </van-cell-group>
    </div>
    
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="friends-o" to="/merchants">商户</van-tabbar-item>
      <van-tabbar-item icon="gold-coin-o" to="/commissions">提成</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import api from '../api'

const router = useRouter()
const activeTab = ref(0)
const salesmanInfo = ref(null)
const stats = ref({
  merchantCount: 0,
  totalCommission: 0,
  pendingCommission: 0
})
const qrcodeUrl = ref('')

const loadProfile = async () => {
  try {
    const res = await api.salesman.getProfile()
    if (res.code === 200) {
      salesmanInfo.value = res.data
      generateQRCode()
    }
  } catch (error) {
    console.error('获取信息失败:', error)
  }
}

const loadStats = async () => {
  try {
    const res = await api.salesman.getStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计失败:', error)
  }
}

const generateQRCode = () => {
  if (salesmanInfo.value?.channel_link) {
    qrcodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(salesmanInfo.value.channel_link)}`
  }
}

const copyChannelCode = () => {
  if (salesmanInfo.value?.channel_code) {
    navigator.clipboard.writeText(salesmanInfo.value.channel_code)
    showSuccessToast('渠道码已复制')
  }
}

const copyChannelLink = () => {
  if (salesmanInfo.value?.channel_link) {
    navigator.clipboard.writeText(salesmanInfo.value.channel_link)
    showSuccessToast('渠道链接已复制')
  }
}

onMounted(() => {
  loadProfile()
  loadStats()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}

.stats-cards {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin-bottom: 12px;
}

.stats-cards .van-grid {
  background: transparent;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.channel-section {
  margin-bottom: 12px;
}

.channel-content {
  padding: 16px;
}

.qrcode-wrapper {
  text-align: center;
  margin-bottom: 16px;
}

.channel-info {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  font-size: 14px;
  color: #666;
  width: 80px;
}

.info-row .value {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.merchant-section {
  margin-bottom: 12px;
}
</style>
