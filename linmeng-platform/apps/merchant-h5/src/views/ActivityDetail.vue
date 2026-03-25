<template>
  <div class="activity-detail-page">
    <van-nav-bar title="活动详情" left-arrow @click-left="router.back()" />
    
    <van-skeleton v-if="loading" :row="10" />
    
    <template v-else-if="activity">
      <div class="header">
        <van-image
          v-if="activity.cover_img"
          :src="activity.cover_img"
          width="100%"
          height="200"
          fit="cover"
        />
        <div class="status-bar">
          <van-tag type="primary" size="large">招募中</van-tag>
        </div>
      </div>
      
      <van-cell-group inset>
        <div class="title-section">
          <h2>{{ activity.title }}</h2>
          <p class="community">
            {{ activity.community_name }}
            <van-icon name="info-o" @click="showCommunityInfo" class="info-icon" />
          </p>
        </div>
        
        <van-cell title="活动时间" :value="formatDateTime(activity.start_time)" icon="clock-o" />
        <van-cell title="活动地点" :value="activity.location" icon="location-o" />
        <van-cell title="预计人数" :value="`${activity.expected_count}人`" icon="friends-o" />
        <van-cell title="面向人群" :value="activity.target_crowd" icon="user-o" />
        <van-cell title="需求赞助" :value="activity.sponsor_types" icon="gift-o" />
      </van-cell-group>
      
      <van-cell-group inset title="活动简介">
        <div class="description">
          {{ activity.description || '暂无简介' }}
        </div>
      </van-cell-group>
      
      <van-cell-group inset title="需求详情">
        <div class="need-detail">
          <div v-for="(item, index) in needList" :key="index" class="need-item">
            <span class="need-type">{{ item.type }}</span>
            <span class="need-count">数量: {{ item.count }}</span>
            <span class="need-budget">预算: ¥{{ item.budget }}</span>
          </div>
        </div>
      </van-cell-group>
      
      <van-cell-group inset title="商家回报">
        <div class="returns">
          {{ activity.returns || '暂无设置' }}
        </div>
      </van-cell-group>
      
      <div class="bottom-bar">
        <van-button type="primary" block round @click="showApplyPopup = true">
          立即报名
        </van-button>
      </div>
    </template>
    
    <van-empty v-else description="活动不存在" />
    
    <van-popup v-model:show="showApplyPopup" position="bottom" round style="height: 60%">
      <div class="apply-popup">
        <van-nav-bar title="报名赞助">
          <template #right>
            <van-icon name="cross" size="20" @click="showApplyPopup = false" />
          </template>
        </van-nav-bar>
        
        <van-form @submit="onApply">
          <van-cell-group inset>
            <van-field
              v-model="applyForm.sponsor_type"
              name="sponsor_type"
              label="赞助类型"
              placeholder="请输入赞助类型"
              :rules="[{ required: true, message: '请输入赞助类型' }]"
            />
            
            <van-field
              v-model="applyForm.sponsor_detail"
              name="sponsor_detail"
              label="赞助详情"
              placeholder="请详细描述您提供的赞助内容"
              type="textarea"
              rows="4"
              :rules="[{ required: true, message: '请输入赞助详情' }]"
            />
            
            <van-field name="images" label="相关图片">
              <template #input>
                <van-uploader
                  v-model="applyImages"
                  multiple
                  :max-count="5"
                  :after-read="uploadApplyImage"
                />
              </template>
            </van-field>
          </van-cell-group>
          
          <div class="apply-footer">
            <van-button type="primary" block round native-type="submit" :loading="applyLoading">
              提交报名
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
    
    <van-popup
      v-model:show="showCommunityPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="community-popup" v-if="communityInfo">
        <div class="popup-header">
          <h3>社区信息</h3>
          <van-icon name="cross" @click="showCommunityPopup = false" />
        </div>
        
        <div class="popup-body">
          <div class="community-card">
            <van-icon name="home-o" size="60" color="#1989fa" />
            <div class="community-name">{{ communityInfo.community_name }}</div>
            <van-tag v-if="communityInfo.status === 1" type="success">已认证</van-tag>
          </div>
          
          <template v-if="isMember">
            <van-cell-group inset title="基本信息">
              <van-cell title="负责人" :value="communityInfo.contact_name" icon="user-o" />
              <van-cell title="联系电话" :value="communityInfo.phone" icon="phone-o" />
              <van-cell title="所在区" :value="communityInfo.district || '暂无'" icon="location-o" />
              <van-cell title="所属街道" :value="communityInfo.street" icon="guide-o" />
              <van-cell title="详细地址" :value="communityInfo.address" icon="map-marked" />
            </van-cell-group>
            
            <van-cell-group inset title="社区档案">
              <van-cell title="居民总户数" :value="`${communityInfo.total_households || 0}户`" />
              <van-cell title="老年人占比" :value="communityInfo.elderly_ratio ? `${communityInfo.elderly_ratio}%` : '暂无'" />
              <van-cell title="青少年家庭占比" :value="communityInfo.youth_family_ratio ? `${communityInfo.youth_family_ratio}%` : '暂无'" />
              <van-cell title="公共空间面积" :value="communityInfo.public_space_area ? `${communityInfo.public_space_area}㎡` : '暂无'" />
              <van-cell title="所辖小区" :value="communityInfo.residential_areas || '暂无'" />
              <van-cell title="辖区商户数量" :value="communityInfo.nearby_merchants || 0" />
            </van-cell-group>
          </template>
          
          <template v-else>
            <div class="member-notice">
              <van-icon name="lock" size="40" color="#999" />
              <p>成为会员可查看社区详细信息</p>
              <p class="notice-desc">包括联系电话、详细地址、社区档案等</p>
              <van-button type="primary" size="small" round @click="router.push('/member')">
                开通会员
              </van-button>
            </div>
          </template>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import api from '../api'
import { formatDateTime } from '../utils'

const router = useRouter()
const route = useRoute()
const activity = ref(null)
const loading = ref(true)
const showApplyPopup = ref(false)
const applyLoading = ref(false)
const applyImages = ref([])
const showCommunityPopup = ref(false)
const communityInfo = ref(null)
const userInfo = ref(null)

const applyForm = reactive({
  sponsor_type: '',
  sponsor_detail: '',
  images: ''
})

const isMember = computed(() => {
  if (!userInfo.value) return false
  const level = userInfo.value.member_level || 0
  if (level === 0) return false
  const expire = userInfo.value.member_expire
  if (!expire) return false
  return new Date(expire) > new Date()
})

const needList = computed(() => {
  if (!activity.value?.need_detail) return []
  try {
    return JSON.parse(activity.value.need_detail)
  } catch {
    return []
  }
})

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await api.merchant.getActivityDetail(route.params.id)
    if (res.code === 200) {
      activity.value = res.data
    }
  } catch (error) {
    console.error('获取活动详情失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchUserInfo = async () => {
  try {
    const res = await api.merchant.getProfile()
    if (res.code === 200) {
      userInfo.value = res.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const showCommunityInfo = async () => {
  if (!activity.value?.community_id) {
    showToast('无法获取社区信息')
    return
  }
  
  try {
    const res = await api.merchant.getCommunityInfo(activity.value.community_id)
    if (res.code === 200) {
      communityInfo.value = res.data
      showCommunityPopup.value = true
    }
  } catch (error) {
    showToast('获取社区信息失败')
  }
}

const uploadApplyImage = async (file) => {
  file.status = 'uploading'
  file.message = '上传中...'
  
  const formData = new FormData()
  formData.append('file', file.file)
  
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('merchant_token')}`
      }
    }).then(r => r.json())
    
    if (res.code === 200) {
      file.status = 'done'
      const baseUrl = 'http://localhost:3000'
      file.url = baseUrl + res.data.url
    } else {
      file.status = 'failed'
    }
  } catch {
    file.status = 'failed'
  }
}

const onApply = async () => {
  applyLoading.value = true
  
  const urls = applyImages.value
    .filter(f => f.status === 'done' && f.url)
    .map(f => f.url)
  
  try {
    const res = await api.merchant.applyActivity(route.params.id, {
      ...applyForm,
      images: urls.join(',')
    })
    
    if (res.code === 200) {
      showSuccessToast('报名成功')
      showApplyPopup.value = false
      router.push('/cooperations')
    }
  } catch (error) {
    showToast('报名失败')
  } finally {
    applyLoading.value = false
  }
}

onMounted(() => {
  fetchDetail()
  fetchUserInfo()
})
</script>

<style scoped>
.activity-detail-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px;
}

.header {
  position: relative;
}

.status-bar {
  position: absolute;
  top: 12px;
  right: 12px;
}

.title-section {
  padding: 16px;
}

.title-section h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.title-section .community {
  margin: 8px 0 0;
  font-size: 13px;
  color: #999;
}

.info-icon {
  margin-left: 8px;
  color: #1989fa;
  cursor: pointer;
}

.description, .returns {
  padding: 12px 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.need-detail {
  padding: 12px 16px;
}

.need-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.need-item:last-child {
  border-bottom: none;
}

.need-type {
  color: #333;
  font-weight: 500;
}

.need-count, .need-budget {
  color: #666;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.apply-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.apply-footer {
  padding: 16px;
  margin-top: auto;
}

.community-popup {
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
  padding-bottom: 20px;
}

.community-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: #f8f8f8;
  margin: 12px;
  border-radius: 8px;
}

.community-name {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-top: 12px;
}

.member-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.member-notice p {
  margin: 8px 0;
  color: #666;
}

.member-notice .notice-desc {
  font-size: 12px;
  color: #999;
}
</style>
