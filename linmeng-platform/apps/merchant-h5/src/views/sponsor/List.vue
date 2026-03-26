<template>
  <div class="sponsor-list-page">
    <van-nav-bar title="我的赞助信息" left-arrow @click-left="router.back()">
      <template #right>
        <van-icon name="plus" size="20" @click="router.push('/sponsor/create')" />
      </template>
    </van-nav-bar>
    
    <div class="list-content" v-if="list.length > 0">
      <div
        v-for="item in list"
        :key="item.id"
        class="sponsor-item"
        @click="showDetail(item)"
      >
        <div class="item-header">
          <span class="title">{{ item.title }}</span>
          <div class="header-right">
            <van-badge :content="item.unread_comment_count" v-if="item.unread_comment_count > 0" :max="99">
              <van-icon name="chat-o" size="18" color="#1989fa" />
            </van-badge>
            <van-tag :type="item.status === 1 ? 'success' : 'default'">
              {{ item.status === 1 ? '上架中' : '已下架' }}
            </van-tag>
          </div>
        </div>
        <div class="item-type">
          <van-tag plain>{{ item.sponsor_type }}</van-tag>
        </div>
        <div class="item-detail">{{ item.sponsor_detail }}</div>
        <div class="sponsor-tags" v-if="getSponsorTags(item).length > 0">
          <van-tag 
            v-for="(tag, index) in getSponsorTags(item).slice(0, 3)" 
            :key="index"
            plain 
            size="small"
            style="margin-right: 4px"
          >{{ tag }}</van-tag>
        </div>
        <div class="item-footer">
          <span class="time">{{ formatDateTime(item.create_time) }}</span>
          <div class="actions">
            <van-button 
              size="small" 
              type="primary" 
              plain
              @click.stop="showComments(item)"
            >
              <van-badge :content="item.unread_comment_count" v-if="item.unread_comment_count > 0" :max="99">
                查看留言
              </van-badge>
              <span v-else>查看留言</span>
            </van-button>
            <van-button size="small" type="primary" @click.stop="handleEdit(item)">编辑</van-button>
            <van-button size="small" :type="item.status === 1 ? 'default' : 'success'" @click.stop="toggleStatus(item)">
              {{ item.status === 1 ? '下架' : '上架' }}
            </van-button>
            <van-button size="small" type="danger" @click.stop="handleDelete(item)">删除</van-button>
          </div>
        </div>
      </div>
    </div>
    
    <van-empty v-else description="暂无赞助信息">
      <van-button type="primary" round @click="router.push('/sponsor/create')">发布赞助信息</van-button>
    </van-empty>
    
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="popup-content" v-if="selectedItem">
        <div class="popup-header">
          <h3>赞助详情</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        
        <div class="popup-body">
          <van-cell-group inset title="基本信息">
            <van-cell title="标题" :value="selectedItem.title" />
            <van-cell title="赞助类型" :value="selectedItem.sponsor_type" />
            <van-cell title="赞助详情" :label="selectedItem.sponsor_detail" />
          </van-cell-group>
          
          <van-cell-group inset title="联系信息">
            <van-cell title="联系人" :value="selectedItem.contact_name || '未设置'" />
            <van-cell title="联系电话" :value="selectedItem.contact_phone || '未设置'" />
            <van-cell title="发布时间" :value="formatDateTime(selectedItem.create_time)" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>
    
    <van-popup
      v-model:show="showCommentPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="popup-content" v-if="selectedItem">
        <div class="popup-header">
          <h3>留言列表</h3>
          <van-icon name="cross" @click="showCommentPopup = false" />
        </div>
        
        <div class="popup-body">
          <van-loading v-if="loadingComments" size="24px">加载中...</van-loading>
          <van-empty v-else-if="comments.length === 0" description="暂无留言" image-size="60" />
          <div v-else class="comment-list">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-main">
                <div class="comment-user">
                  <van-icon name="user-circle-o" size="18" color="#07c160" />
                  <span class="user-name community">社区：{{ comment.community?.community_name || '社区用户' }}</span>
                  <span class="comment-time">{{ formatTime(comment.create_time) }}</span>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
              </div>
              
              <div v-if="comment.replies && comment.replies.length > 0" class="replies">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                  <div class="reply-user">
                    <van-icon name="shop-o" size="16" color="#1989fa" />
                    <span class="user-name merchant">商家：{{ reply.merchant?.business_name || '商家回复' }}</span>
                    <span class="comment-time">{{ formatTime(reply.create_time) }}</span>
                  </div>
                  <div class="reply-content">{{ reply.content }}</div>
                </div>
              </div>
              
              <van-button size="small" type="primary" plain @click="showReplyInput(comment)" style="margin-top: 8px">
                回复
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
    
    <van-dialog
      v-model:show="showReplyDialog"
      title="回复留言"
      show-cancel-button
      :before-close="beforeCloseReply"
    >
      <van-field
        v-model="replyContent"
        rows="3"
        autosize
        type="textarea"
        placeholder="请输入回复内容..."
        maxlength="500"
        show-word-limit
      />
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showConfirmDialog } from 'vant'
import api from '../../api'
import { formatDateTime } from '../../utils'

const router = useRouter()
const list = ref([])
const allTags = ref([])
const showDetailPopup = ref(false)
const showCommentPopup = ref(false)
const selectedItem = ref(null)
const comments = ref([])
const loadingComments = ref(false)
const showReplyDialog = ref(false)
const replyContent = ref('')
const replyingComment = ref(null)

const fetchList = async () => {
  try {
    const res = await api.sponsor.getMy()
    console.log('API返回数据:', res)
    if (res.code === 200) {
      list.value = res.data || []
      console.log('列表数据:', list.value)
    }
  } catch (error) {
    console.error('获取列表失败:', error)
  }
}

const loadTags = async () => {
  try {
    const res = await api.tag.getAll({ category: 'merchant' })
    if (res.code === 200) {
      allTags.value = res.data || []
    }
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

const getSponsorTags = (item) => {
  const tags = []
  
  if (item.tags) {
    try {
      const tagIds = JSON.parse(item.tags)
      if (Array.isArray(tagIds) && tagIds.length > 0) {
        const tagNames = tagIds.map(id => {
          const tag = allTags.value.find(t => t.id === id)
          return tag ? tag.name : null
        }).filter(name => name)
        tags.push(...tagNames)
      }
    } catch (e) {
      console.error('解析标签失败:', e)
    }
  }
  
  if (item.custom_tags) {
    try {
      const customTags = JSON.parse(item.custom_tags)
      if (Array.isArray(customTags)) {
        tags.push(...customTags)
      }
    } catch (e) {
      console.error('解析自定义标签失败:', e)
    }
  }
  
  return tags
}

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

const loadComments = async (sponsorId) => {
  loadingComments.value = true
  try {
    const res = await api.sponsorComment.getMerchantList({ sponsor_id: sponsorId, pageSize: 100 })
    if (res.code === 200) {
      comments.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载留言失败:', error)
  } finally {
    loadingComments.value = false
  }
}

const showDetail = (item) => {
  selectedItem.value = item
  showDetailPopup.value = true
}

const showComments = (item) => {
  selectedItem.value = item
  showCommentPopup.value = true
  loadComments(item.id)
}

const showReplyInput = (comment) => {
  replyingComment.value = comment
  replyContent.value = ''
  showReplyDialog.value = true
}

const beforeCloseReply = async (action) => {
  if (action === 'confirm') {
    if (!replyContent.value.trim()) {
      showSuccessToast('请输入回复内容')
      return false
    }
    
    try {
      const res = await api.sponsorComment.reply({
        sponsor_id: selectedItem.value.id,
        content: replyContent.value,
        parent_id: replyingComment.value.id,
        reply_to_id: replyingComment.value.id
      })
      
      if (res.code === 200) {
        showSuccessToast('回复成功')
        loadComments(selectedItem.value.id)
        fetchList()
        return true
      }
      return false
    } catch (error) {
      console.error('回复失败:', error)
      showSuccessToast('回复失败')
      return false
    }
  }
  return true
}

const handleEdit = (item) => {
  router.push(`/sponsor/edit/${item.id}`)
}

const toggleStatus = async (item) => {
  try {
    const newStatus = item.status === 1 ? 0 : 1
    const res = await api.sponsor.updateStatus(item.id, { status: newStatus })
    if (res.code === 200) {
      showSuccessToast(res.message)
      fetchList()
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleDelete = async (item) => {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除这条赞助信息吗？'
  })
    .then(async () => {
      try {
        const res = await api.sponsor.delete(item.id)
        if (res.code === 200) {
          showSuccessToast('删除成功')
          fetchList()
        }
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
    .catch(() => {})
}

onMounted(() => {
  loadTags()
  fetchList()
})
</script>

<style scoped>
.sponsor-list-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.list-content {
  padding: 12px;
}

.sponsor-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-header .title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-type {
  margin-bottom: 8px;
}

.item-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sponsor-tags {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-footer .time {
  font-size: 12px;
  color: #999;
}

.actions {
  display: flex;
  gap: 8px;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  position: relative;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  background: #fff;
  z-index: 10;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.comment-section {
  margin-top: 16px;
  padding: 0 12px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
}

.comment-count {
  font-size: 12px;
  color: #999;
}

.comment-list {
  margin-top: 12px;
}

.comment-item {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.comment-main {
  margin-bottom: 8px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.comment-user .user-name {
  font-size: 14px;
  font-weight: 500;
}

.comment-user .user-name.community {
  color: #07c160;
}

.comment-user .user-name.merchant {
  color: #1989fa;
}

.comment-time {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.comment-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.replies {
  margin-top: 8px;
  padding-left: 20px;
  border-left: 2px solid #1989fa;
}

.reply-item {
  background: #fff;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 8px;
}

.reply-user {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.reply-user .user-name {
  font-size: 13px;
  font-weight: 500;
  color: #1989fa;
}

.reply-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
</style>
