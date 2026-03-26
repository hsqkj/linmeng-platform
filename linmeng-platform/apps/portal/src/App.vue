<template>
  <div class="portal-page">
    <div class="header">
      <div class="logo">
        <van-icon name="cluster-o" size="48" color="#fff" />
      </div>
      <h1>邻盟</h1>
      <p class="slogan">社区爱心资源智能匹配助手</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h3>请选择您的身份</h3>
        
        <div class="card-list">
          <div class="card" @click="goTo('community')">
            <div class="card-icon community">
              <van-icon name="home-o" size="32" />
            </div>
            <div class="card-info">
              <div class="card-title">社区端</div>
              <div class="card-desc">发布活动需求、对接商家赞助</div>
            </div>
            <van-icon name="arrow" class="card-arrow" />
          </div>
          
          <div class="card" @click="goTo('merchant')">
            <div class="card-icon merchant">
              <van-icon name="shop-o" size="32" />
            </div>
            <div class="card-info">
              <div class="card-title">商家端</div>
              <div class="card-desc">发布赞助信息、参与社区活动</div>
            </div>
            <van-icon name="arrow" class="card-arrow" />
          </div>
        </div>
      </div>
      
      <div class="section" v-if="channelCode">
        <div class="channel-tip">
          <van-icon name="info-o" />
          <span>您正在通过招商大使邀请注册</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2026 邻盟社区爱心资源智能匹配助手</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const channelCode = ref('')

const urls = {
  community: 'http://localhost:5171',
  merchant: 'http://localhost:5172'
}

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  channelCode.value = params.get('channel_code') || params.get('channel') || ''
})

const goTo = (type) => {
  let url = urls[type]
  
  if (type === 'merchant' && channelCode.value) {
    url += `/register?channel_code=${channelCode.value}`
  }
  
  window.location.href = url
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.portal-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  padding: 60px 20px 40px;
  color: #fff;
}

.logo {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.header h1 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.slogan {
  font-size: 16px;
  opacity: 0.9;
}

.content {
  flex: 1;
  padding: 0 20px;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  color: #fff;
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: normal;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:active {
  transform: scale(0.98);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.card-icon.community {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
}

.card-icon.merchant {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: #fff;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 13px;
  color: #999;
}

.card-arrow {
  color: #ccc;
  font-size: 16px;
}

.channel-tip {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}
</style>
