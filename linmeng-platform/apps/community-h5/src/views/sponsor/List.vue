<template>
  <div class="sponsor-market-page">
    <van-nav-bar title="商家赞助" left-arrow @click-left="router.back()">
      <template #right>
        <div class="nav-right" v-if="!isLoggedIn">
          <van-button size="small" plain type="primary" @click="router.push('/login')">登录</van-button>
        </div>
      </template>
    </van-nav-bar>
    
    <div class="filter-bar">
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterType" :options="typeOptions" @change="fetchList" />
        <van-dropdown-item v-model="sortBy" :options="sortOptions" @change="fetchList" />
      </van-dropdown-menu>
    </div>
    
    <div class="list-content" v-if="list.length > 0">
      <div
        v-for="item in list"
        :key="item.id"
        class="sponsor-item"
        @click="showDetail(item)"
      >
        <div class="merchant-info">
          <van-image
            :src="item.merchant?.logo || 'https://via.placeholder.com/50'"
            round
            width="50"
            height="50"
          />
          <div class="merchant-detail">
            <div class="merchant-name">{{ item.merchant?.business_name }}</div>
            <div class="merchant-tags">
              <van-tag plain size="small">{{ item.merchant?.industry }}</van-tag>
              <van-tag v-if="item.merchant?.member_level > 0" type="primary" size="small">
                {{ getMemberLevel(item.merchant?.member_level) }}
              </van-tag>
            </div>
          </div>
        </div>
        
        <div class="sponsor-title">{{ item.title }}</div>
        
        <div class="sponsor-type-row">
          <van-tag type="primary">{{ item.sponsor_type }}</van-tag>
        </div>
        
        <div class="sponsor-detail">{{ item.sponsor_detail }}</div>
        
        <div class="item-footer">
          <span class="time">{{ formatDateTime(item.create_time) }}</span>
          <van-button size="small" type="primary" @click.stop="showDetail(item)">
            查看详情
          </van-button>
        </div>
      </div>
    </div>
    
    <van-empty v-else description="暂无赞助信息" />
    
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="popup-content" v-if="selectedItem">
        <div class="popup-header">
          <h3>赞助详情</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        
        <div class="popup-body">
          <div class="merchant-card">
            <van-image
              :src="selectedItem.merchant?.logo || 'https://via.placeholder.com/80'"
              round
              width="60"
              height="60"
            />
            <div class="merchant-info-card">
              <div class="name">{{ selectedItem.merchant?.business_name }}</div>
              <div class="industry">{{ selectedItem.merchant?.industry }}</div>
              <div class="member-tag" v-if="selectedItem.merchant?.member_level > 0">
                <van-tag type="primary" size="small">
                  {{ getMemberLevel(selectedItem.merchant?.member_level) }}
                </van-tag>
                <span class="rating">评分: {{ selectedItem.merchant?.star_rating || 5.0 }}</span>
              </div>
            </div>
          </div>
          
          <van-cell-group inset title="赞助信息">
            <van-cell title="标题" :value="selectedItem.title" />
            <van-cell title="赞助类型" :value="selectedItem.sponsor_type" />
            <van-cell title="赞助详情" :label="selectedItem.sponsor_detail" />
          </van-cell-group>
          
          <template v-if="isLoggedIn">
            <van-cell-group inset title="联系方式">
              <van-cell title="联系人" :value="selectedItem.contact_name || '暂无'" />
              <van-cell title="联系电话" :value="selectedItem.contact_phone || '暂无'" />
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
            
            <van-cell-group inset title="视频展示" v-if="selectedItem.video">
              <video :src="selectedItem.video" controls class="video-player"></video>
            </van-cell-group>
            
            <van-cell-group inset title="商家简介" v-if="selectedItem.merchant?.description">
              <div class="description-text">
                {{ selectedItem.merchant.description }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showImagePreview } from 'vant'
import api from '../../api'
import { formatDateTime } from '../../utils'

const router = useRouter()
const isLoggedIn = ref(false)
const list = ref([])
const filterType = ref(0)
const sortBy = ref('comprehensive')
const showDetailPopup = ref(false)
const selectedItem = ref(null)

const typeOptions = [
  { text: '全部类型', value: 0 },
  { text: '物资类', value: '物资类' },
  { text: '场地类', value: '场地类' },
  { text: '服务类', value: '服务类' },
  { text: '人力类', value: '人力类' },
  { text: '媒体类', value: '媒体类' },
  { text: '其他', value: '其他' }
]

const sortOptions = [
  { text: '综合排序', value: 'comprehensive' },
  { text: '距离优先', value: 'distance' },
  { text: '最新发布', value: 'time' },
  { text: '匹配度高', value: 'match' }
]

const getMemberLevel = (level) => {
  const levels = ['普通用户', '普通会员', '银卡会员', '金卡会员', '钻石会员']
  return levels[level] || '普通用户'
}

const parsedImages = computed(() => {
  if (!selectedItem.value?.images) return []
  try {
    return JSON.parse(selectedItem.value.images)
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

const fetchList = async () => {
  try {
    const params = {
      sortBy: sortBy.value
    }
    if (filterType.value !== 0) {
      params.sponsor_type = filterType.value
    }
    
    const communityProfile = localStorage.getItem('community_profile')
    if (communityProfile) {
      const profile = JSON.parse(communityProfile)
      if (profile.latitude && profile.longitude) {
        params.communityLat = profile.latitude
        params.communityLng = profile.longitude
      }
    }
    
    const res = await api.sponsor.getList(params)
    if (res.code === 200) {
      list.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取列表失败:', error)
  }
}

const showDetail = async (item) => {
  selectedItem.value = item
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
    if (selectedItem.value?.id) {
      await api.sponsor.incrementConsult(selectedItem.value.id)
    }
  } catch (error) {
    console.error('增加咨询量失败:', error)
  }
  
  if (selectedItem.value?.contact_phone) {
    window.location.href = `tel:${selectedItem.value.contact_phone}`
  } else if (selectedItem.value?.merchant?.phone) {
    window.location.href = `tel:${selectedItem.value.merchant.phone}`
  } else {
    showSuccessToast('暂无联系方式')
  }
}

onMounted(() => {
  const token = localStorage.getItem('community_token')
  isLoggedIn.value = !!token
  
  fetchList()
})
</script>

<style scoped>
.sponsor-market-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.filter-bar {
  background: #fff;
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

.merchant-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.merchant-detail {
  flex: 1;
}

.merchant-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.merchant-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.sponsor-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.sponsor-type-row {
  margin-bottom: 8px;
}

.sponsor-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
</style>
