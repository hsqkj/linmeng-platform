<template>
  <div class="comment-section">
    <div class="comment-header">
      <h4>留言咨询</h4>
      <span class="comment-count">{{ comments.length }}条留言</span>
    </div>
    
    <div class="comment-input" v-if="isLoggedIn">
      <van-field
        v-model="newComment"
        rows="2"
        autosize
        type="textarea"
        placeholder="请输入您的留言..."
        maxlength="500"
        show-word-limit
      />
      <van-button type="primary" size="small" @click="submitComment" :loading="submitting">
        发送留言
      </van-button>
    </div>
    <div class="login-tip" v-else>
      <van-button type="primary" size="small" @click="$router.push('/login')">
        登录后留言
      </van-button>
    </div>
    
    <div class="comment-list">
      <div v-if="loading" class="loading">
        <van-loading size="24px">加载中...</van-loading>
      </div>
      <van-empty v-else-if="comments.length === 0" description="暂无留言" image-size="60" />
      <div v-else>
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-main">
            <div class="comment-user">
              <van-icon name="user-circle-o" size="20" color="#07c160" />
              <span class="user-name community">社区：{{ comment.community?.community_name || '社区用户' }}</span>
              <span class="comment-time">{{ formatTime(comment.create_time) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
          
          <div v-if="comment.replies && comment.replies.length > 0" class="replies">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <div class="reply-user">
                <van-icon name="shop-o" size="18" color="#1989fa" />
                <span class="user-name merchant">商家：{{ reply.merchant?.business_name || '商家回复' }}</span>
                <span class="comment-time">{{ formatTime(reply.create_time) }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import api from '../api'

const props = defineProps({
  sponsorId: {
    type: Number,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
})

const comments = ref([])
const newComment = ref('')
const loading = ref(false)
const submitting = ref(false)

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

const loadComments = async () => {
  loading.value = true
  try {
    const res = await api.sponsorComment.getList(props.sponsorId)
    if (res.code === 200) {
      comments.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载留言失败:', error)
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    showToast('请输入留言内容')
    return
  }
  
  submitting.value = true
  try {
    const res = await api.sponsorComment.create({
      sponsor_id: props.sponsorId,
      content: newComment.value
    })
    
    if (res.code === 200) {
      showSuccessToast('留言成功')
      newComment.value = ''
      loadComments()
    }
  } catch (error) {
    console.error('留言失败:', error)
    showToast('留言失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-section {
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.comment-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.comment-count {
  font-size: 12px;
  color: #999;
}

.comment-input {
  margin-bottom: 16px;
}

.comment-input .van-field {
  margin-bottom: 8px;
}

.login-tip {
  text-align: center;
  padding: 20px 0;
}

.comment-list {
  margin-top: 16px;
}

.loading {
  text-align: center;
  padding: 20px 0;
}

.comment-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-main {
  margin-bottom: 8px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-name.community {
  color: #07c160;
}

.user-name.merchant {
  color: #1989fa;
}

.comment-time {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.comment-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  padding-left: 28px;
}

.replies {
  margin-left: 28px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
}

.reply-item {
  margin-bottom: 8px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-user .user-name {
  font-size: 13px;
  color: #1989fa;
}

.reply-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  padding-left: 24px;
}
</style>
