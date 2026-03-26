<template>
  <div class="profile-page">
    <van-nav-bar title="个人中心" />
    
    <div class="profile-header">
      <van-image
        round
        width="80"
        height="80"
        :src="profile.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
      />
      <div class="profile-info">
        <div class="name">{{ profile.name }}</div>
        <div class="phone">{{ profile.phone }}</div>
        <van-tag type="primary" size="small">{{ profile.status === 1 ? '正常' : '已禁用' }}</van-tag>
      </div>
    </div>
    
    <van-cell-group inset class="stats-group">
      <van-cell title="累计提成" :value="`¥${stats.totalCommission || 0}`" />
      <van-cell title="待结算提成" :value="`¥${stats.pendingCommission || 0}`" />
      <van-cell title="推广商户数" :value="stats.merchantCount || 0" />
      <van-cell title="提成比例" :value="`${profile.commission_rate || 0}%`" />
    </van-cell-group>
    
    <van-cell-group inset title="渠道推广" class="channel-group">
      <van-cell title="我的渠道码" :value="profile.channel_code" is-link @click="showChannelCode" />
      <van-cell title="推广链接" is-link @click="showShareLink" />
      <van-cell title="推广二维码" is-link @click="showQRCode" />
    </van-cell-group>
    
    <van-cell-group inset title="其他" class="other-group">
      <van-cell title="修改密码" is-link to="/change-password" />
      <van-cell title="关于我们" is-link />
      <van-cell title="退出登录" @click="handleLogout" />
    </van-cell-group>
    
    <van-popup v-model:show="showChannelPopup" round :style="{ width: '80%', padding: '20px' }">
      <div class="channel-popup">
        <h3>我的渠道码</h3>
        <div class="channel-code">{{ profile.channel_code }}</div>
        <van-button type="primary" block @click="copyChannelCode">复制渠道码</van-button>
      </div>
    </van-popup>
    
    <van-popup v-model:show="showLinkPopup" round :style="{ width: '80%', padding: '20px' }">
      <div class="link-popup">
        <h3>推广链接</h3>
        <div class="share-link">{{ shareLink }}</div>
        <van-button type="primary" block @click="copyShareLink">复制链接</van-button>
      </div>
    </van-popup>
    
    <van-popup v-model:show="showQRPopup" round :style="{ width: '80%', padding: '20px' }">
      <div class="qr-popup">
        <h3>推广二维码</h3>
        <div class="qr-code">
          <img :src="qrCodeUrl" alt="二维码" />
        </div>
        <van-button type="primary" block @click="saveQRCode">保存二维码</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import api from '../api'

const router = useRouter()
const profile = ref({})
const stats = ref({})
const showChannelPopup = ref(false)
const showLinkPopup = ref(false)
const showQRPopup = ref(false)

const shareLink = computed(() => {
  const baseUrl = window.location.origin
  return `${baseUrl}/merchant/register?channel_code=${profile.value.channel_code}`
})

const qrCodeUrl = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink.value)}`
})

const fetchProfile = async () => {
  try {
    const res = await api.salesman.getProfile()
    if (res.code === 200) {
      profile.value = res.data
    }
  } catch (error) {
    console.error('获取个人信息失败:', error)
  }
}

const fetchStats = async () => {
  try {
    const res = await api.salesman.getStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const showChannelCode = () => {
  showChannelPopup.value = true
}

const showShareLink = () => {
  showLinkPopup.value = true
}

const showQRCode = () => {
  showQRPopup.value = true
}

const copyChannelCode = () => {
  navigator.clipboard.writeText(profile.value.channel_code)
  showSuccessToast('复制成功')
  showChannelPopup.value = false
}

const copyShareLink = () => {
  navigator.clipboard.writeText(shareLink.value)
  showSuccessToast('复制成功')
  showLinkPopup.value = false
}

const saveQRCode = () => {
  const link = document.createElement('a')
  link.href = qrCodeUrl.value
  link.download = `渠道码_${profile.value.channel_code}.png`
  link.click()
  showSuccessToast('保存成功')
  showQRPopup.value = false
}

const handleLogout = () => {
  localStorage.removeItem('salesman_token')
  showSuccessToast('退出成功')
  router.push('/login')
}

onMounted(() => {
  fetchProfile()
  fetchStats()
})
</script>

<style scoped>
.profile-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20px;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.profile-info {
  flex: 1;
}

.name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.phone {
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.stats-group,
.channel-group,
.other-group {
  margin-top: 12px;
}

.channel-popup,
.link-popup,
.qr-popup {
  text-align: center;
}

.channel-popup h3,
.link-popup h3,
.qr-popup h3 {
  margin-bottom: 20px;
}

.channel-code {
  font-size: 32px;
  font-weight: bold;
  color: #1989fa;
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.share-link {
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
  word-break: break-all;
}

.qr-code {
  margin-bottom: 20px;
}

.qr-code img {
  width: 200px;
  height: 200px;
}
</style>
