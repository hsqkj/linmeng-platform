<template>
  <div class="home-page">
    <van-nav-bar title="邻盟社区">
      <template #right>
        <div class="nav-right">
          <van-badge :dot="unreadCount > 0" v-if="isLoggedIn">
            <van-icon name="bell" size="20" @click="router.push('/message')" />
          </van-badge>
          <div class="auth-buttons" v-else>
            <van-button size="small" plain type="primary" @click="router.push('/login')">登录</van-button>
            <van-button size="small" type="primary" @click="router.push('/register')">注册</van-button>
          </div>
        </div>
      </template>
    </van-nav-bar>
    
    <div class="banner">
      <p class="banner-text">社区活动缺资源？社区空间缺运营？社区服务缺专家？【邻盟智能助手】免费智能匹配商家赞助、物资、人力、场地、技术、专家、媒体宣传等优质爱心资源。</p>
    </div>
    
    <div class="section demand-section">
      <div class="section-header">
        <van-icon name="notes-o" size="18" color="#4facfe" />
        <span class="section-title">需求版块</span>
      </div>
      
      <div class="quick-actions" v-if="isLoggedIn">
        <van-button type="primary" round @click="router.push('/activity/create')">
          <van-icon name="plus" /> 发布需求
        </van-button>
        <van-button type="default" round @click="showImportPopup = true">
          <van-icon name="description" /> 批量导入
        </van-button>
      </div>
      
      <div class="guide-section" v-if="isLoggedIn">
        <van-cell-group inset>
          <van-cell title="操作指引" />
          <div class="guide-content">
            <van-steps :active="999" active-color="#4facfe">
              <van-step>
                <van-icon name="edit" class="step-icon" />
                <h4>发布需求</h4>
                <p>填写活动需求</p>
              </van-step>
              <van-step>
                <van-icon name="clock-o" class="step-icon" />
                <h4>等待审核</h4>
                <p>24小时内审核</p>
              </van-step>
              <van-step>
                <van-icon name="friends-o" class="step-icon" />
                <h4>商家匹配</h4>
                <p>自动匹配商家</p>
              </van-step>
              <van-step>
                <van-icon name="success" class="step-icon" />
                <h4>达成合作</h4>
                <p>完成活动合作</p>
              </van-step>
            </van-steps>
          </div>
        </van-cell-group>
      </div>
      
      <div class="statistics" v-if="isLoggedIn">
        <van-cell-group inset>
          <van-cell title="我的需求" is-link to="/activity/list" />
          <van-grid :column-num="3" :border="false">
            <van-grid-item>
              <template #text>
                <div class="stat-value">{{ statistics.totalActivities }}</div>
                <div class="stat-label">已发布需求</div>
              </template>
            </van-grid-item>
            <van-grid-item>
              <template #text>
                <div class="stat-value">{{ statistics.recruitingActivities }}</div>
                <div class="stat-label">招募中</div>
              </template>
            </van-grid-item>
            <van-grid-item>
              <template #text>
                <div class="stat-value">{{ statistics.completedCooperations }}</div>
                <div class="stat-label">已完成合作</div>
              </template>
            </van-grid-item>
          </van-grid>
        </van-cell-group>
      </div>
      
      <div class="activity-list" v-if="isLoggedIn">
        <van-cell-group inset>
          <van-cell title="需求列表" is-link to="/activity/list" value="更多" />
          <van-skeleton v-if="loadingActivities" :row="3" />
          <div v-else-if="recentActivities.length === 0" class="empty-activity">
            <van-empty description="暂无需求" image-size="60" />
            <van-button type="primary" size="small" round @click="router.push('/activity/create')">
              立即发布需求
            </van-button>
          </div>
          <van-cell
            v-else
            v-for="activity in recentActivities.slice(0, 1)"
            :key="activity.id"
            :title="activity.title"
            :label="`${formatDateTime(activity.start_time)} | ${getStatusText(activity.status)}`"
            is-link
            :to="`/activity/${activity.id}`"
          />
        </van-cell-group>
      </div>
    </div>
    
    <div class="section sponsor-section">
      <div class="section-header">
        <van-icon name="gift-o" size="18" color="#ff6b6b" />
        <span class="section-title">商家赞助</span>
      </div>
      
      <div class="sponsor-stats">
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ platformStats.merchantCount || 0 }}</div>
            <div class="stat-label">已发布赞助商家</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ platformStats.sponsoredActivityCount || 0 }}</div>
            <div class="stat-label">已对接数量</div>
          </div>
        </div>
      </div>
      
      <div class="sponsor-list-section">
        <van-cell-group inset>
          <van-cell title="商家赞助推荐" is-link to="/sponsor" value="更多" />
          <van-skeleton v-if="loadingSponsors" :row="3" />
          <van-empty v-else-if="sponsorList.length === 0" description="暂无赞助信息" />
          <div v-else>
            <div
              v-for="item in sponsorList"
              :key="item.id"
              class="sponsor-item"
              @click="showSponsorDetail(item)"
            >
              <div class="sponsor-header">
                <van-image
                  :src="item.merchant?.logo || 'https://via.placeholder.com/50'"
                  round
                  width="40"
                  height="40"
                />
                <div class="sponsor-info">
                  <div class="sponsor-title">{{ item.title }}</div>
                  <div class="sponsor-merchant">{{ item.merchant?.business_name }}</div>
                </div>
                <van-tag type="primary" size="small">{{ item.sponsor_type }}</van-tag>
              </div>
              <div class="sponsor-detail-preview">{{ item.sponsor_detail }}</div>
            </div>
          </div>
        </van-cell-group>
      </div>
    </div>
    
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
      <van-tabbar-item v-if="isLoggedIn" icon="chat-o" :badge="unreadCount || ''" to="/message">消息</van-tabbar-item>
    </van-tabbar>
    
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="popup-content" v-if="selectedSponsor">
        <div class="popup-header">
          <h3>赞助详情</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        
        <div class="popup-body">
          <div class="merchant-card">
            <van-image
              :src="selectedSponsor.merchant?.logo || 'https://via.placeholder.com/80'"
              round
              width="60"
              height="60"
            />
            <div class="merchant-info-card">
              <div class="name">{{ selectedSponsor.merchant?.business_name }}</div>
              <div class="industry">{{ selectedSponsor.merchant?.industry }}</div>
              <div class="member-tag" v-if="selectedSponsor.merchant?.member_level > 0">
                <van-tag type="primary" size="small">
                  {{ getMemberLevel(selectedSponsor.merchant?.member_level) }}
                </van-tag>
                <span class="rating">评分: {{ selectedSponsor.merchant?.star_rating || 5.0 }}</span>
              </div>
            </div>
          </div>
          
          <van-cell-group inset title="赞助信息">
            <van-cell title="标题" :value="selectedSponsor.title" />
            <van-cell title="赞助类型" :value="selectedSponsor.sponsor_type" />
            <van-cell title="赞助详情" :label="selectedSponsor.sponsor_detail" />
          </van-cell-group>
          
          <template v-if="isLoggedIn">
            <van-cell-group inset title="联系方式">
              <van-cell title="联系人" :value="selectedSponsor.contact_name || '暂无'" />
              <van-cell title="联系电话" :value="selectedSponsor.contact_phone || '暂无'" />
            </van-cell-group>
            
            <van-cell-group inset title="图片展示" v-if="parsedImages.length > 0">
              <div class="image-gallery">
                <van-image
                  v-for="(img, index) in parsedImages"
                  :key="index"
                  :src="img"
                  width="80"
                  height="80"
                  fit="cover"
                  @click="previewImage(index)"
                />
              </div>
            </van-cell-group>
            
            <van-cell-group inset title="视频展示" v-if="selectedSponsor.video">
              <video :src="selectedSponsor.video" controls class="video-player"></video>
            </van-cell-group>
            
            <van-cell-group inset title="商家简介" v-if="selectedSponsor.merchant?.description">
              <div class="description-text">
                {{ selectedSponsor.merchant.description }}
              </div>
            </van-cell-group>
          </template>
          
          <template v-else>
            <div class="login-tip">
              <van-icon name="lock" size="40" color="#999" />
              <p>登录后可查看商家联系方式和详细信息</p>
              <van-button type="primary" size="small" @click="router.push('/login')">立即登录</van-button>
            </div>
          </template>
        </div>
        
        <div class="popup-footer" v-if="isLoggedIn">
          <van-button type="primary" block round @click="contactMerchant">
            联系商家
          </van-button>
        </div>
      </div>
    </van-popup>
    
    <van-popup v-model:show="showImportPopup" round position="bottom" :style="{ height: '50%' }">
      <div class="import-popup">
        <div class="popup-header">
          <h3>批量导入需求</h3>
          <van-icon name="cross" @click="showImportPopup = false" />
        </div>
        
        <div class="popup-content">
          <div class="import-actions">
            <van-button type="primary" block @click="downloadTemplate" style="margin-bottom: 12px;">
              <van-icon name="down" /> 下载导入模板
            </van-button>
            
            <van-button type="default" block @click="triggerUpload">
              <van-icon name="upgrade" /> 上传需求文件
            </van-button>
          </div>
          
          <div class="import-tips">
            <van-notice-bar
              left-icon="info-o"
              background="#ecf9ff"
              color="#1989fa"
            >
              请先下载模板，按模板格式填写后上传
            </van-notice-bar>
          </div>
          
          <div class="import-rules">
            <h4>导入说明：</h4>
            <ul>
              <li>1. 带 * 号的为必填项</li>
              <li>2. 需求类型必须为：活动需求、场地招商、专家顾问</li>
              <li>3. 时间格式为：YYYY-MM-DD HH:mm</li>
              <li>4. 单次最多导入100条需求</li>
              <li>5. 导入的需求默认为待审核状态</li>
            </ul>
          </div>
        </div>
      </div>
    </van-popup>
    
    <van-dialog v-model:show="showProgressDialog" title="导入进度" :show-confirm-button="false">
      <div class="progress-content">
        <van-loading size="24px" vertical>{{ progressText }}</van-loading>
      </div>
    </van-dialog>
    
    <input 
      type="file" 
      ref="fileInput" 
      accept=".xlsx,.xls" 
      style="display: none;" 
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showDialog, showImagePreview } from 'vant'
import api from '../api'
import { formatDateTime } from '../utils'

const router = useRouter()
const activeTab = ref(0)
const isLoggedIn = ref(false)
const statistics = ref({
  totalActivities: 0,
  recruitingActivities: 0,
  completedCooperations: 0
})
const platformStats = ref({
  merchantCount: 0,
  sponsoredActivityCount: 0
})
const recentActivities = ref([])
const unreadCount = ref(0)
const sponsorList = ref([])
const loadingSponsors = ref(true)
const loadingActivities = ref(true)
const showDetailPopup = ref(false)
const selectedSponsor = ref(null)

const showImportPopup = ref(false)
const showProgressDialog = ref(false)
const progressText = ref('正在导入...')
const fileInput = ref(null)

const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '招募中',
    2: '对接中',
    3: '已完成',
    4: '已取消'
  }
  return statusMap[status] || '未知'
}

const getMemberLevel = (level) => {
  const levels = ['免费普通会员', '银卡会员', '金卡会员', '钻石会员']
  return levels[level] || '免费普通会员'
}

const parsedImages = computed(() => {
  if (!selectedSponsor.value?.images) return []
  try {
    return JSON.parse(selectedSponsor.value.images)
  } catch {
    return []
  }
})

const previewImage = (index) => {
  showImagePreview({
    images: parsedImages.value,
    startPosition: index
  })
}

const showSponsorDetail = async (item) => {
  selectedSponsor.value = item
  showDetailPopup.value = true
  
  if (isLoggedIn.value) {
    try {
      await api.sponsor.incrementView(item.id)
    } catch (error) {
      console.error('增加阅读量失败:', error)
    }
  }
}

const contactMerchant = async () => {
  try {
    if (selectedSponsor.value?.id) {
      await api.sponsor.incrementConsult(selectedSponsor.value.id)
    }
  } catch (error) {
    console.error('增加咨询量失败:', error)
  }
  
  if (selectedSponsor.value?.contact_phone) {
    window.location.href = `tel:${selectedSponsor.value.contact_phone}`
  } else if (selectedSponsor.value?.merchant?.phone) {
    window.location.href = `tel:${selectedSponsor.value.merchant.phone}`
  } else {
    showSuccessToast('暂无联系方式')
  }
}

const downloadTemplate = () => {
  const token = localStorage.getItem('community_token')
  const link = document.createElement('a')
  link.href = `${api.baseURL}/community/demand-template?token=${token}`
  link.download = '需求导入模板.xlsx'
  link.click()
  showSuccessToast('模板下载中...')
}

const triggerUpload = () => {
  fileInput.value.click()
}

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
  
  if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
    showFailToast('请上传Excel文件（.xlsx或.xls格式）')
    return
  }
  
  showImportPopup.value = false
  
  const confirmed = await showDialog({
    title: '确认导入',
    message: `即将导入文件：${file.name}\n\n导入的需求将进入待审核状态，确认继续吗？`,
    showCancelButton: true,
    confirmButtonText: '确认导入',
    cancelButtonText: '取消'
  }).catch(() => false)
  
  if (!confirmed) {
    event.target.value = ''
    return
  }
  
  showProgressDialog.value = true
  progressText.value = '正在验证文件格式...'
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    progressText.value = '正在导入数据...'
    
    const res = await api.community.importDemands(formData)
    
    showProgressDialog.value = false
    
    if (res.code === 200) {
      await showDialog({
        title: '导入成功',
        message: `成功导入 ${res.data.success} 条需求\n\n需求已进入待审核状态，审核通过后将自动推送给匹配的商家。`,
        confirmButtonText: '查看需求'
      })
      
      fetchData()
    } else if (res.code === 400 && res.data) {
      const errorData = res.data
      let errorMsg = `数据验证失败\n\n总计：${errorData.total} 条\n有效：${errorData.valid} 条\n无效：${errorData.invalid} 条\n\n`
      
      if (errorData.errors && errorData.errors.length > 0) {
        errorMsg += '错误详情：\n'
        errorData.errors.slice(0, 5).forEach(err => {
          errorMsg += `第${err.row}行【${err.title}】：${err.errors.join('、')}\n`
        })
        if (errorData.errors.length > 5) {
          errorMsg += `...还有 ${errorData.errors.length - 5} 条错误`
        }
      }
      
      await showDialog({
        title: '导入失败',
        message: errorMsg,
        confirmButtonText: '知道了'
      })
    } else {
      showFailToast(res.message || '导入失败')
    }
  } catch (error) {
    showProgressDialog.value = false
    console.error('导入失败:', error)
    showFailToast('导入失败，请稍后重试')
  } finally {
    event.target.value = ''
  }
}

const fetchData = async () => {
  const token = localStorage.getItem('community_token')
  isLoggedIn.value = !!token
  
  try {
    console.log('开始获取平台统计数据...')
    const [platformStatsRes, sponsorRes] = await Promise.all([
      api.activity.getStats(),
      api.sponsor.getList({ pageSize: 5 })
    ])
    
    console.log('平台统计数据响应:', platformStatsRes)
    console.log('平台统计数据code:', platformStatsRes.code)
    console.log('平台统计数据data:', platformStatsRes.data)
    console.log('赞助列表:', sponsorRes)
    
    if (platformStatsRes && platformStatsRes.code === 200) {
      platformStats.value = platformStatsRes.data
      console.log('platformStats.value已更新为:', platformStats.value)
    } else {
      console.error('平台统计数据获取失败:', platformStatsRes)
    }
    
    if (sponsorRes && sponsorRes.code === 200) {
      sponsorList.value = sponsorRes.data.list || []
    }
    
    loadingSponsors.value = false
  } catch (error) {
    console.error('获取数据失败:', error)
    loadingSponsors.value = false
  }
  
  if (isLoggedIn.value) {
    loadingActivities.value = true
    try {
      const [statsRes, activitiesRes, messageRes] = await Promise.all([
        api.community.getStatistics(),
        api.community.getActivities({ pageSize: 5 }),
        api.message.getUnreadCount()
      ])
      
      if (statsRes.code === 200) {
        statistics.value = statsRes.data
      }
      
      if (activitiesRes.code === 200) {
        recentActivities.value = activitiesRes.data.list || activitiesRes.data
      }
      
      if (messageRes.code === 200) {
        unreadCount.value = messageRes.data.count
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
    } finally {
      loadingActivities.value = false
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.home-page {
  padding-bottom: 60px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-buttons {
  display: flex;
  gap: 8px;
}

.banner {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 20px;
  margin: 12px;
  border-radius: 12px;
}

.banner-text {
  color: #fff;
  font-size: 16px;
  text-align: center;
}

.section {
  margin-top: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.quick-actions {
  padding: 12px;
  display: flex;
  gap: 12px;
}

.quick-actions .van-button {
  flex: 1;
  font-size: 15px;
}

.guide-section {
  margin: 12px;
}

.guide-content {
  padding: 16px 8px;
}

.guide-content .step-icon {
  font-size: 20px;
  color: #4facfe;
  margin-bottom: 4px;
}

.guide-content h4 {
  margin: 8px 0 4px 0;
  font-size: 13px;
  color: #333;
  text-align: center;
}

.guide-content p {
  margin: 0;
  font-size: 11px;
  color: #999;
  text-align: center;
  white-space: nowrap;
}

.statistics {
  margin: 12px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #4facfe;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.activity-list {
  margin: 12px;
}

.empty-activity {
  padding: 20px;
  text-align: center;
}

.empty-activity .van-button {
  margin-top: 12px;
}

.sponsor-stats {
  margin: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.sponsor-stats .stat-item {
  text-align: center;
  flex: 1;
}

.sponsor-stats .stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #ff6b6b;
  text-align: center;
}

.sponsor-stats .stat-label {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
  text-align: center;
}

.sponsor-list-section {
  margin: 12px;
}

.sponsor-item {
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.sponsor-item:last-child {
  border-bottom: none;
}

.sponsor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.sponsor-info {
  flex: 1;
}

.sponsor-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.sponsor-merchant {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.sponsor-detail-preview {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recent-activities {
  margin: 12px;
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
  padding-bottom: 80px;
}

.merchant-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f8f8;
  margin: 12px;
  border-radius: 8px;
}

.merchant-info-card .name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.merchant-info-card .industry {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.member-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.rating {
  font-size: 12px;
  color: #999;
}

.description-text {
  padding: 12px 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.popup-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
}

.image-gallery .van-image {
  border-radius: 4px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  max-height: 300px;
  margin: 12px 16px;
  border-radius: 8px;
}

.login-tip {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.login-tip p {
  margin: 16px 0;
  font-size: 14px;
}

.import-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.import-popup .popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  flex-shrink: 0;
  background: #fff;
}

.import-popup .popup-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.import-popup .popup-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.import-actions {
  margin-bottom: 16px;
}

.import-popup .popup-content .van-cell-group {
  margin: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.import-popup .popup-content .van-cell {
  padding: 14px 16px;
}

.cell-icon {
  margin-right: 8px;
  color: #1989fa;
}

.import-tips {
  margin-top: 16px;
}

.import-rules {
  margin-top: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.import-rules h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.import-rules ul {
  margin: 0;
  padding-left: 20px;
}

.import-rules li {
  font-size: 12px;
  color: #666;
  line-height: 1.8;
}

.progress-content {
  padding: 32px;
  text-align: center;
}
</style>
