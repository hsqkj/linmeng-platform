<template>
  <div class="comment-message-page">
    <van-nav-bar title="留言消息" left-arrow @click-left="router.back()">
      <template #right>
        <van-badge :dot="unreadCount > 0">
          <van-icon name="bell" size="20" />
        </van-badge>
      </template>
    </van-nav-bar>
    
    <van-tabs v-model:active="activeTab" @change="handleTabChange">
      <van-tab title="全部">
        <van-badge :content="unreadCount" v-if="unreadCount > 0" />
      </van-tab>
      <van-tab title="未读">
        <van-badge :content="unreadCount" v-if="unreadCount > 0" />
      </van-tab>
      <van-tab title="已读" />
    </van-tabs>
    
    <div class="message-list">
      <van-loading v-if="loading" size="24px" vertical>加载中...</van-loading>
      
      <van-empty v-else-if="messages.length === 0" description="暂无留言消息" />
      
      <van-list
        v-else
        v-model:loading="loadingMore"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadMore"
      >
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="{ unread: !msg.is_read }"
          @click="viewDetail(msg)"
        >
          <div class="message-header">
            <van-icon name="user-circle-o" size="20" />
            <span class="community-name">{{ msg.community?.community_name }}</span>
            <span class="message-time">{{ formatTime(msg.create_time) }}</span>
          </div>
          
          <div class="message-content">
            <div class="sponsor-title">关于：{{ msg.sponsor?.title }}</div>
            <div class="comment-text">{{ msg.content }}</div>
          </div>
          
          <div class="message-footer">
            <van-tag v-if="!msg.is_read" type="danger" size="small">未读</van-tag>
            <van-tag v-else type="success" size="small">已读</van-tag>
          </div>
        </div>
      </van-list>
    </div>
    
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="popup-content" v-if="selectedMessage">
        <div class="popup-header">
          <h3>留言详情</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        
        <div class="popup-body">
          <div class="message-info">
            <div class="info-row">
              <span class="label">社区：</span>
              <span>{{ selectedMessage.community?.community_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">联系人：</span>
              <span>{{ selectedMessage.community?.contact_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">联系电话：</span>
              <span>{{ selectedMessage.community?.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">赞助标题：</span>
              <span>{{ selectedMessage.sponsor?.title }}</span>
            </div>
            <div class="info-row">
              <span class="label">留言内容：</span>
              <span>{{ selectedMessage.content }}</span>
            </div>
          </div>
          
          <div class="reply-section">
            <van-field
              v-model="replyContent"
              rows="3"
              autosize
              type="textarea"
              placeholder="请输入回复内容..."
              maxlength="500"
              show-word-limit
            />
            <van-button
              type="primary"
              block
              @click="submitReply"
              :loading="replying"
              style="margin-top: 12px"
            >
              发送回复
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import api from '../api'

const router = useRouter()
const activeTab = ref(0)
const messages = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 20
const unreadCount = ref(0)
const showDetailPopup = ref(false)
const selectedMessage = ref(null)
const replyContent = ref('')
const replying = ref(false)

const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString()
}

const loadUnreadCount = async () => {
  try {
    const res = await api.sponsorComment.getUnreadCount()
    if (res.code === 200) {
      unreadCount.value = res.data.unreadCount
    }
  } catch (error) {
    console.error('获取未读数失败:', error)
  }
}

const loadMessages = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize
    }
    
    if (activeTab.value === 1) {
      params.is_read = false
    } else if (activeTab.value === 2) {
      params.is_read = true
    }
    
    const res = await api.sponsorComment.getMerchantList(params)
    if (res.code === 200) {
      if (page.value === 1) {
        messages.value = res.data.list || []
      } else {
        messages.value.push(...(res.data.list || []))
      }
      
      finished.value = messages.value.length >= res.data.total
    }
  } catch (error) {
    console.error('加载留言失败:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (!finished.value) {
    page.value++
    loadMessages()
  }
}

const handleTabChange = () => {
  page.value = 1
  finished.value = false
  messages.value = []
  loadMessages()
}

const viewDetail = async (msg) => {
  selectedMessage.value = msg
  showDetailPopup.value = true
  
  if (!msg.is_read) {
    try {
      await api.sponsorComment.markRead(msg.id)
      msg.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim()) {
    showToast('请输入回复内容')
    return
  }
  
  replying.value = true
  try {
    const res = await api.sponsorComment.reply({
      sponsor_id: selectedMessage.value.sponsor_id,
      content: replyContent.value,
      parent_id: selectedMessage.value.id,
      reply_to_id: selectedMessage.value.id
    })
    
    if (res.code === 200) {
      showSuccessToast('回复成功')
      replyContent.value = ''
      showDetailPopup.value = false
      loadMessages()
    }
  } catch (error) {
    console.error('回复失败:', error)
    showToast('回复失败')
  } finally {
    replying.value = false
  }
}

onMounted(() => {
  loadUnreadCount()
  loadMessages()
})
</script>

<style scoped>
.comment-message-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.message-list {
  padding: 12px;
}

.message-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.message-item.unread {
  border-left: 3px solid #1989fa;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.community-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-content {
  margin-bottom: 12px;
}

.sponsor-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.comment-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message-info {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.reply-section {
  margin-top: 16px;
}
</style>
