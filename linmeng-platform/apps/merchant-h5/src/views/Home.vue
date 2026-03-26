<template>
  <div class="home-page">
    <van-nav-bar title="邻盟商家端">
      <template #right>
        <div class="nav-right">
          <van-badge :dot="unreadCount > 0" v-if="isLoggedIn">
            <van-icon name="bell" size="20" @click="router.push('/message')" />
          </van-badge>
          <van-badge :dot="commentUnreadCount > 0" v-if="isLoggedIn" style="margin-left: 12px">
            <van-icon name="chat-o" size="20" @click="router.push('/comment-message')" />
          </van-badge>
          <div class="auth-buttons" v-else>
            <van-button size="small" plain type="primary" @click="router.push('/login')">登录</van-button>
            <van-button size="small" type="primary" @click="router.push('/register')">注册</van-button>
          </div>
        </div>
      </template>
    </van-nav-bar>
    
    <div class="banner">
      <p class="banner-text">精准触达社区居民，高效获客转化</p>
    </div>
    
    <div class="member-card" v-if="isLoggedIn && merchantInfo">
      <div class="member-info">
        <span class="member-level">{{ getMemberLevel(merchantInfo.member_level) }}</span>
        <span class="member-name">{{ merchantInfo.business_name }}</span>
      </div>
      <div class="member-quota">
        本月剩余报名次数: {{ merchantInfo.monthly_quota - merchantInfo.used_quota }}
      </div>
      <van-button size="small" type="primary" round @click="router.push('/member')">
        {{ merchantInfo.member_level === 0 ? '开通会员' : '续费/升级' }}
      </van-button>
    </div>
    
    <div class="section demand-section">
      <div class="section-header">
        <van-icon name="search" size="18" color="#1989fa" />
        <span class="section-title">需求广场</span>
      </div>
      
      <div class="demand-stats">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ platformStats.activityCount || 0 }}</div>
            <div class="stat-label">已发布需求</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ platformStats.recruitingCount || 0 }}</div>
            <div class="stat-label">招募中</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ platformStats.completedCount || 0 }}</div>
            <div class="stat-label">已完成对接</div>
          </div>
        </div>
      </div>
      
      <div class="demand-list-section">
        <van-cell-group inset>
          <van-cell title="需求推荐" is-link to="/activities" value="更多" />
          <van-skeleton v-if="loadingDemands" :row="3" />
          <van-empty v-else-if="demands.length === 0" description="暂无需求" />
          <div v-else>
            <div
              v-for="item in demands"
              :key="item.id"
              class="demand-item"
              @click="showDemandDetail(item)"
            >
              <div class="demand-header">
                <span class="demand-title">{{ item.title }}</span>
                <van-tag type="primary" plain size="small">{{ getDemandTypeText(item.demand_type) }}</van-tag>
              </div>
              <div class="demand-info">
                <div class="match-hearts">
                  <span class="match-label">匹配度：</span>
                  <van-icon 
                    v-for="i in 5" 
                    :key="i"
                    :name="i <= (item.match_hearts || 0) ? 'like' : 'like-o'"
                    :color="i <= (item.match_hearts || 0) ? '#ee0a24' : '#dcdee0'"
                    size="12"
                  />
                </div>
                <span class="community-name">{{ item.community?.name || '社区' }}</span>
              </div>
              <div class="demand-tags" v-if="item.tags && item.tags.length > 0">
                <van-tag 
                  v-for="tag in item.tags.slice(0, 3)" 
                  :key="tag" 
                  plain 
                  type="primary" 
                  size="small"
                  style="margin-right: 4px;"
                >
                  {{ tag }}
                </van-tag>
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>
    </div>
    
    <div class="section sponsor-section">
      <div class="section-header">
        <van-icon name="gift-o" size="18" color="#ff6b6b" />
        <span class="section-title">发布赞助</span>
      </div>
      
      <div class="sponsor-stats">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ sponsorStats.total || 0 }}</div>
            <div class="stat-label">已发布</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ sponsorStats.totalViews || 0 }}</div>
            <div class="stat-label">总浏览量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ sponsorStats.totalConsults || 0 }}</div>
            <div class="stat-label">总咨询量</div>
          </div>
        </div>
      </div>
      
      <div class="sponsor-list-section">
        <van-cell-group inset>
          <van-cell title="我的赞助" is-link to="/sponsor" value="更多" />
          <div class="quick-actions" v-if="isLoggedIn">
            <van-button type="primary" round @click="router.push('/sponsor/create')">
              <van-icon name="plus" /> 发布赞助
            </van-button>
          </div>
          <van-skeleton v-if="loadingSponsors" :row="3" />
          <van-empty v-else-if="sponsorList.length === 0" description="暂无赞助" />
          <div v-else>
            <div
              v-for="item in sponsorList"
              :key="item.id"
              class="sponsor-item"
              @click="showSponsorDetail(item)"
            >
              <div class="sponsor-header">
                <span class="sponsor-title">{{ item.title }}</span>
                <van-tag :type="getStatusType(item.status)" size="small">{{ getStatusText(item.status) }}</van-tag>
              </div>
              <div class="sponsor-tags-home" v-if="getSponsorTags(item).length > 0">
                <van-tag 
                  v-for="(tag, index) in getSponsorTags(item).slice(0, 3)" 
                  :key="index"
                  plain 
                  size="small"
                  style="margin-right: 4px"
                >{{ tag }}</van-tag>
              </div>
              <div class="sponsor-info">
                <span><van-icon name="eye-o" /> {{ item.view_count || 0 }}</span>
                <span><van-icon name="chat-o" /> {{ item.consult_count || 0 }}</span>
                <van-button 
                  size="mini" 
                  type="primary" 
                  plain
                  @click.stop="showSponsorComments(item)"
                >
                  <van-badge :content="item.unread_comment_count" v-if="item.unread_comment_count > 0" :max="99">
                    查看留言
                  </van-badge>
                  <span v-else>查看留言</span>
                </van-button>
              </div>
            </div>
          </div>
        </van-cell-group>
      </div>
    </div>
    
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/activities">需求</van-tabbar-item>
      <van-tabbar-item v-if="isLoggedIn" icon="orders-o" to="/cooperations">合作</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
    
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="popup-content" v-if="selectedDemand">
        <div class="popup-header">
          <h3>需求详情</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        
        <div class="popup-body">
          <div class="community-card">
            <van-image
              :src="getImageUrl(selectedDemand.community?.logo) || 'https://via.placeholder.com/80'"
              round
              width="60"
              height="60"
            />
            <div class="community-info-card">
              <div class="name">{{ selectedDemand.community?.name }}</div>
              <div class="address">{{ selectedDemand.community?.address }}</div>
            </div>
          </div>
          
          <van-cell-group inset title="需求信息">
            <van-cell title="标题" :value="selectedDemand.title" />
            <van-cell title="需求类型" :value="getDemandTypeText(selectedDemand.demand_type)" />
            <van-cell title="详细描述" :label="selectedDemand.description" />
          </van-cell-group>
          
          <template v-if="selectedDemand.demand_type === 'activity' || !selectedDemand.demand_type">
            <van-cell-group inset title="活动信息">
              <van-cell title="活动地点" :value="selectedDemand.location" />
              <van-cell title="开始时间" :value="formatDateTime(selectedDemand.start_time)" />
              <van-cell title="结束时间" :value="formatDateTime(selectedDemand.end_time)" />
              <van-cell title="预计人数" :value="selectedDemand.expected_count" />
              <van-cell title="所需赞助" :value="selectedDemand.sponsor_types" />
            </van-cell-group>
          </template>
          
          <template v-else-if="selectedDemand.demand_type === 'space'">
            <van-cell-group inset title="场地信息">
              <van-cell title="场地位置" :value="selectedDemand.space_location" />
              <van-cell title="场地面积" :value="`${selectedDemand.space_area}㎡`" />
              <van-cell title="运营要求" :label="selectedDemand.space_requirement" />
            </van-cell-group>
          </template>
          
          <template v-else-if="selectedDemand.demand_type === 'consult'">
            <van-cell-group inset title="顾问需求">
              <van-cell title="咨询领域" :value="selectedDemand.consult_field" />
              <van-cell title="咨询时长" :value="selectedDemand.consult_duration" />
              <van-cell title="具体要求" :label="selectedDemand.consult_requirement" />
            </van-cell-group>
          </template>
          
          <template v-if="isLoggedIn">
            <van-cell-group inset title="社区联系方式">
              <van-cell title="联系人" :value="selectedDemand.community?.contact_name || '暂无'" />
              <van-cell title="联系电话" :value="selectedDemand.community?.phone || '暂无'" />
              <van-cell title="详细地址" :value="selectedDemand.community?.address || '暂无'" />
            </van-cell-group>
          </template>
          
          <template v-else>
            <div class="login-tip">
              <van-icon name="lock" size="40" color="#999" />
              <p>登录后可查看社区联系方式和详细信息</p>
              <van-button type="primary" size="small" @click="router.push('/login')">立即登录</van-button>
            </div>
          </template>
        </div>
        
        <div class="popup-footer" v-if="isLoggedIn">
          <van-button type="primary" block round @click="contactCommunity">
            联系社区
          </van-button>
        </div>
      </div>
    </van-popup>
    
    <van-popup
      v-model:show="showSponsorPopup"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="popup-content" v-if="selectedSponsor">
        <div class="popup-header">
          <h3>赞助详情</h3>
          <van-icon name="cross" @click="showSponsorPopup = false" />
        </div>
        
        <div class="popup-body">
          <van-cell-group inset title="基本信息">
            <van-cell title="标题" :value="selectedSponsor.title" />
            <van-cell title="赞助类型" :value="selectedSponsor.sponsor_type" />
            <van-cell title="赞助详情" :label="selectedSponsor.sponsor_detail" />
          </van-cell-group>
          
          <van-cell-group inset title="联系信息">
            <van-cell title="联系人" :value="selectedSponsor.contact_name || '未设置'" />
            <van-cell title="联系电话" :value="selectedSponsor.contact_phone || '未设置'" />
            <van-cell title="发布时间" :value="formatDateTime(selectedSponsor.create_time)" />
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
      <div class="popup-content" v-if="selectedSponsor">
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
import { showSuccessToast } from 'vant'
import api from '../api'
import { formatDateTime, getMemberLevel, getImageUrl } from '../utils'

const router = useRouter()
const activeTab = ref(0)
const isLoggedIn = ref(false)
const merchantInfo = ref(null)
const demands = ref([])
const sponsorList = ref([])
const allTags = ref([])
const platformStats = ref({
  activityCount: 0,
  recruitingCount: 0,
  completedCount: 0
})
const sponsorStats = ref({
  total: 0,
  totalViews: 0,
  totalConsults: 0
})
const unreadCount = ref(0)
const commentUnreadCount = ref(0)
const loadingDemands = ref(true)
const loadingSponsors = ref(true)
const showDetailPopup = ref(false)
const selectedDemand = ref(null)
const showSponsorPopup = ref(false)
const selectedSponsor = ref(null)
const showCommentPopup = ref(false)
const comments = ref([])
const loadingComments = ref(false)
const showReplyDialog = ref(false)
const replyContent = ref('')
const replyingComment = ref(null)

const getDemandTypeText = (type) => {
  const texts = {
    activity: '活动需求',
    space: '场地招商',
    consult: '专家顾问'
  }
  return texts[type] || '活动需求'
}

const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '招募中',
    2: '已结束'
  }
  return statusMap[status] || '未知'
}

const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'default'
  }
  return typeMap[status] || 'default'
}

const getHeartCount = (score) => {
  if (score >= 90) return 5
  if (score >= 70) return 4
  if (score >= 50) return 3
  if (score >= 30) return 2
  if (score >= 10) return 1
  return 0
}

const showDemandDetail = (item) => {
  selectedDemand.value = item
  showDetailPopup.value = true
}

const showSponsorDetail = (item) => {
  selectedSponsor.value = item
  showSponsorPopup.value = true
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

const showSponsorComments = (item) => {
  selectedSponsor.value = item
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
        sponsor_id: selectedSponsor.value.id,
        content: replyContent.value,
        parent_id: replyingComment.value.id,
        reply_to_id: replyingComment.value.id
      })
      
      if (res.code === 200) {
        showSuccessToast('回复成功')
        loadComments(selectedSponsor.value.id)
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

const contactCommunity = () => {
  if (selectedDemand.value?.community?.phone) {
    window.location.href = `tel:${selectedDemand.value.community.phone}`
  } else {
    showSuccessToast('暂无联系方式')
  }
}

const fetchData = async () => {
  const token = localStorage.getItem('merchant_token')
  isLoggedIn.value = !!token
  
  loadingDemands.value = true
  loadingSponsors.value = true
  
  try {
    console.log('开始获取平台统计数据...')
    const [platformStatsRes, demandsRes] = await Promise.all([
      api.activity.getStats(),
      api.merchant.getActivities({ pageSize: 5 })
    ])
    
    console.log('平台统计数据响应:', platformStatsRes)
    console.log('需求列表响应:', demandsRes)
    
    if (platformStatsRes && platformStatsRes.code === 200) {
      platformStats.value = platformStatsRes.data
      console.log('platformStats.value已更新为:', platformStats.value)
    }
    
    if (demandsRes.code === 200) {
      demands.value = demandsRes.data.list || demandsRes.data || []
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loadingDemands.value = false
  }
  
  if (isLoggedIn.value) {
    try {
      const [profileRes, statsRes, messageRes, sponsorRes, commentUnreadRes] = await Promise.all([
        api.merchant.getProfile(),
        api.sponsor.getStats(),
        api.message.getUnreadCount(),
        api.sponsor.getList({ pageSize: 5 }),
        api.sponsorComment.getUnreadCount()
      ])
      
      if (profileRes.code === 200) {
        merchantInfo.value = profileRes.data
      }
      
      if (statsRes.code === 200) {
        sponsorStats.value = statsRes.data
      }
      
      if (messageRes.code === 200) {
        unreadCount.value = messageRes.data.count
      }
      
      if (sponsorRes.code === 200) {
        sponsorList.value = sponsorRes.data.list || []
      }
      
      if (commentUnreadRes.code === 200) {
        commentUnreadCount.value = commentUnreadRes.data.unreadCount
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
    } finally {
      loadingSponsors.value = false
    }
  } else {
    loadingSponsors.value = false
  }
}

onMounted(() => {
  loadTags()
  fetchData()
})
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
  background: var(--bg-page);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.auth-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.banner {
  background: var(--primary-gradient);
  padding: var(--spacing-lg);
  margin: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
}

.banner-text {
  color: #fff;
  font-size: var(--font-size-large);
  text-align: center;
  line-height: var(--line-height-large);
}

.member-card {
  background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
  margin: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  color: #fff;
  box-shadow: var(--shadow-card);
}

.member-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.member-level {
  background: rgba(255, 255, 255, 0.3);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-round);
  font-size: var(--font-size-small);
}

.member-name {
  font-size: 18px;
  font-weight: bold;
}

.member-quota {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-md);
  opacity: 0.9;
}

.section {
  margin-top: var(--spacing-md);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-white);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  margin: 0 var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-large);
  font-weight: 600;
  color: var(--text-primary);
}

.demand-stats,
.sponsor-stats {
  margin: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.demand-list-section,
.sponsor-list-section {
  margin: var(--spacing-md);
}

.quick-actions {
  padding: var(--spacing-md);
  text-align: center;
  background: var(--bg-white);
  margin: 0 var(--spacing-md);
}

.demand-item,
.sponsor-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-lighter);
  transition: var(--transition-base);
}

.demand-item:hover,
.sponsor-item:hover {
  background: var(--bg-hover);
}

.demand-item:last-child,
.sponsor-item:last-child {
  border-bottom: none;
}

.demand-header,
.sponsor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.demand-title,
.sponsor-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demand-info,
.sponsor-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.sponsor-tags-home {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.demand-info span,
.sponsor-info span {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.match-hearts {
  display: flex;
  align-items: center;
  gap: 2px;
}

.match-label {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  margin-right: var(--spacing-xs);
}

.community-name {
  font-size: var(--font-size-small);
  color: var(--text-secondary);
}

.demand-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
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
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-lighter);
}

.popup-header h3 {
  margin: 0;
  font-size: var(--font-size-large);
  font-weight: 600;
  color: var(--text-primary);
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

.community-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-page);
  margin: var(--spacing-md);
  border-radius: var(--border-radius-lg);
}

.community-info-card .name {
  font-size: var(--font-size-large);
  font-weight: 600;
  color: var(--text-primary);
}

.community-info-card .address {
  font-size: var(--font-size-base);
  color: var(--text-regular);
  margin-top: var(--spacing-xs);
}

.popup-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: var(--bg-white);
  border-top: 1px solid var(--border-lighter);
}

.login-tip {
  text-align: center;
  padding: 40px var(--spacing-lg);
  color: var(--text-secondary);
}

.login-tip p {
  margin: var(--spacing-md) 0;
  font-size: var(--font-size-base);
}

.comment-list {
  padding: 16px;
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
}

.reply-user .user-name.community {
  color: #07c160;
}

.reply-user .user-name.merchant {
  color: #1989fa;
}

.reply-content {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}
</style>
