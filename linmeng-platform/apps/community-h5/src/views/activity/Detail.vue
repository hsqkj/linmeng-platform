<template>
  <div class="activity-detail-page">
    <van-nav-bar title="需求详情" left-arrow @click-left="router.back()" />
    
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
          <van-tag type="primary" plain size="medium">{{ getDemandTypeText(activity.demand_type) }}</van-tag>
          <van-tag :type="getStatusType(activity.status)" size="medium">
            {{ getStatusText(activity.status) }}
          </van-tag>
        </div>
      </div>
      
      <van-cell-group inset>
        <div class="title-section">
          <h2>{{ activity.title }}</h2>
        </div>
      </van-cell-group>
      
      <template v-if="activity.demand_type === 'activity' || !activity.demand_type">
        <van-cell-group inset>
          <van-cell title="活动时间" :value="`${formatDateTime(activity.start_time)} ~ ${formatDateTime(activity.end_time)}`" icon="clock-o" />
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
        
        <van-cell-group inset title="报名商家" v-if="cooperations.length > 0">
          <div class="cooperation-list">
            <div
              v-for="item in cooperations"
              :key="item.id"
              class="cooperation-item"
              @click="showCooperationDetail(item)"
            >
              <div class="merchant-info">
                <van-image
                  :src="item.merchant?.logo || 'https://via.placeholder.com/50'"
                  round
                  width="40"
                  height="40"
                />
                <div class="merchant-detail">
                  <div class="merchant-name">
                    {{ item.merchant?.business_name }}
                  </div>
                  <div class="match-hearts">
                    <span class="match-label">匹配度</span>
                    <van-icon
                      v-for="n in 5"
                      :key="n"
                      name="like"
                      :class="n <= getMatchHearts(item.match_score) ? 'heart-active' : 'heart-inactive'"
                    />
                  </div>
                  <div class="sponsor-type">
                    <span class="sponsor-label">可赞助</span>
                    {{ item.sponsor_type }}
                  </div>
                </div>
              </div>
              <div class="action">
                <van-tag v-if="item.status === 0" type="warning">待确认</van-tag>
                <van-tag v-else-if="item.status === 1" type="success">已确认</van-tag>
                <van-tag v-else-if="item.status === 2" type="danger">已拒绝</van-tag>
              </div>
            </div>
          </div>
        </van-cell-group>
      </template>
      
      <template v-else-if="activity.demand_type === 'space'">
        <van-cell-group inset>
          <van-cell title="场地位置" :value="activity.space_location" icon="location-o" />
          <van-cell title="场地面积" :value="`${activity.space_area}㎡`" icon="apps-o" />
          <van-cell title="场地类型" :value="activity.space_type" icon="shop-o" />
        </van-cell-group>
        
        <van-cell-group inset title="配套设施">
          <div class="description">
            {{ activity.space_facilities || '暂无信息' }}
          </div>
        </van-cell-group>
        
        <van-cell-group inset title="招商要求">
          <div class="description">
            {{ activity.space_requirements || '暂无要求' }}
          </div>
        </van-cell-group>
        
        <van-cell-group inset title="合作回报">
          <div class="description">
            {{ activity.space_returns || '暂无设置' }}
          </div>
        </van-cell-group>
        
        <van-cell-group inset title="补充说明">
          <div class="description">
            {{ activity.description || '暂无说明' }}
          </div>
        </van-cell-group>
      </template>
      
      <template v-else-if="activity.demand_type === 'consult'">
        <van-cell-group inset>
          <van-cell title="咨询领域" :value="activity.consult_field" icon="bookmark-o" />
          <van-cell title="专业要求" :value="activity.consult_expertise" icon="user-o" />
          <van-cell title="咨询周期" :value="activity.consult_duration" icon="clock-o" />
          <van-cell title="预算范围" :value="activity.consult_budget" icon="gold-coin-o" />
        </van-cell-group>
        
        <van-cell-group inset title="需求详情">
          <div class="description">
            {{ activity.description || '暂无详情' }}
          </div>
        </van-cell-group>
      </template>
      
      <div class="bottom-bar" v-if="activity.status === 3">
        <van-button type="primary" block round @click="router.push(`/activity/${activity.id}/evaluate`)">
          评价商家
        </van-button>
      </div>
    </template>
    
    <van-empty v-else description="需求不存在" />
    
    <van-popup
      v-model:show="showDetailPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="popup-content" v-if="selectedCooperation">
        <div class="popup-header">
          <h3>商家赞助详情</h3>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        
        <div class="popup-body">
          <div class="merchant-card">
            <van-image
              :src="selectedCooperation.merchant?.logo || 'https://via.placeholder.com/80'"
              round
              width="60"
              height="60"
            />
            <div class="merchant-info-card">
              <div class="name">{{ selectedCooperation.merchant?.business_name }}</div>
              <div class="match-hearts-large">
                <span class="match-label">匹配度</span>
                <van-icon
                  v-for="n in 5"
                  :key="n"
                  name="like"
                  :class="n <= getMatchHearts(selectedCooperation.match_score) ? 'heart-active' : 'heart-inactive'"
                />
              </div>
            </div>
          </div>
          
          <van-cell-group inset title="赞助信息">
            <van-cell title="赞助类型" :value="selectedCooperation.sponsor_type" />
            <van-cell title="赞助详情" :label="selectedCooperation.sponsor_detail || '暂无详情'" />
            <van-cell title="报名时间" :value="formatDateTime(selectedCooperation.create_time)" />
            <van-cell title="当前状态">
              <template #value>
                <van-tag v-if="selectedCooperation.status === 0" type="warning">待确认</van-tag>
                <van-tag v-else-if="selectedCooperation.status === 1" type="success">已确认</van-tag>
                <van-tag v-else-if="selectedCooperation.status === 2" type="danger">已拒绝</van-tag>
              </template>
            </van-cell>
          </van-cell-group>
          
          <van-cell-group inset title="商家基本信息">
            <van-cell title="联系人" :value="selectedCooperation.merchant?.contact_name" icon="user-o" />
            <van-cell title="联系电话" :value="selectedCooperation.merchant?.phone" icon="phone-o" />
            <van-cell title="所属行业" :value="selectedCooperation.merchant?.industry" icon="shop-o" />
            <van-cell title="商家地址" :value="selectedCooperation.merchant?.address || '暂无'" icon="location-o" />
            <van-cell title="目标人群" :value="parseJson(selectedCooperation.merchant?.target_crowd).join('、') || '暂无'" icon="friends-o" />
            <van-cell title="可提供赞助" :value="parseJson(selectedCooperation.merchant?.sponsor_types).join('、') || '暂无'" icon="gift-o" />
            <van-cell title="期望回报" :value="parseJson(selectedCooperation.merchant?.return_expect).join('、') || '暂无'" icon="star-o" />
            <van-cell title="会员等级">
              <template #value>
                <van-tag v-if="selectedCooperation.merchant?.member_level > 0" type="primary">
                  {{ getMemberLevel(selectedCooperation.merchant?.member_level) }}
                </van-tag>
                <span v-else>普通用户</span>
              </template>
            </van-cell>
            <van-cell title="综合评分" :value="selectedCooperation.merchant?.star_rating || 5.0" icon="star-o" />
          </van-cell-group>
          
          <van-cell-group inset title="商家简介" v-if="selectedCooperation.merchant?.description">
            <div class="description-text">
              {{ selectedCooperation.merchant.description }}
            </div>
          </van-cell-group>
        </div>
        
        <div class="popup-footer" v-if="selectedCooperation.status === 0">
          <van-button type="danger" plain round @click="handleReject">
            拒绝
          </van-button>
          <van-button type="primary" round @click="handleConfirm">
            同意
          </van-button>
        </div>
        <div class="popup-footer" v-else>
          <van-button type="default" round block @click="showDetailPopup = false">
            关闭
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showConfirmDialog, showSuccessToast, showToast } from 'vant'
import api from '../../api'
import { formatDateTime } from '../../utils'

const router = useRouter()
const route = useRoute()
const activity = ref(null)
const cooperations = ref([])
const loading = ref(true)
const showDetailPopup = ref(false)
const selectedCooperation = ref(null)

const needList = computed(() => {
  if (!activity.value?.need_detail) return []
  try {
    return JSON.parse(activity.value.need_detail)
  } catch {
    return []
  }
})

const getStatusType = (status) => {
  const types = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'default', 4: 'danger' }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = { 0: '待审核', 1: '招募中', 2: '进行中', 3: '已完成', 4: '已取消' }
  return texts[status] || '未知'
}

const getDemandTypeText = (type) => {
  const texts = {
    activity: '活动需求',
    space: '场地招商',
    consult: '专家顾问'
  }
  return texts[type] || '活动需求'
}

const parseJson = (str) => {
  try {
    return JSON.parse(str) || []
  } catch {
    return []
  }
}

const getMemberLevel = (level) => {
  const levels = ['普通用户', '普通会员', '银卡会员', '金卡会员', '钻石会员']
  return levels[level] || '普通用户'
}

const getMatchScoreClass = (score) => {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

const getMatchHearts = (score) => {
  if (score >= 90) return 5
  if (score >= 75) return 4
  if (score >= 55) return 3
  if (score >= 35) return 2
  return 1
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const [activityRes, coopRes] = await Promise.all([
      api.activity.getDetail(route.params.id),
      api.cooperation.getList({ activity_id: route.params.id })
    ])
    
    if (activityRes.code === 200) {
      activity.value = activityRes.data
    }
    
    if (coopRes.code === 200) {
      cooperations.value = coopRes.data.list || coopRes.data || []
    }
  } catch (error) {
    console.error('获取活动详情失败:', error)
  } finally {
    loading.value = false
  }
}

const showCooperationDetail = (item) => {
  selectedCooperation.value = item
  showDetailPopup.value = true
}

const handleConfirm = async () => {
  if (!selectedCooperation.value) return
  
  try {
    const res = await api.cooperation.confirm(selectedCooperation.value.id)
    if (res.code === 200) {
      showSuccessToast('已同意合作')
      showDetailPopup.value = false
      fetchDetail()
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    showToast(error.message || '操作失败')
  }
}

const handleReject = async () => {
  if (!selectedCooperation.value) return
  
  showConfirmDialog({
    title: '拒绝原因',
    message: '请确认是否拒绝该商家的赞助申请？',
    confirmButtonText: '确认拒绝',
    cancelButtonText: '取消'
  })
    .then(async () => {
      try {
        const res = await api.cooperation.reject(selectedCooperation.value.id, { reason: '不符合需求' })
        if (res.code === 200) {
          showSuccessToast('已拒绝')
          showDetailPopup.value = false
          fetchDetail()
        } else {
          showToast(res.message || '操作失败')
        }
      } catch (error) {
        showToast(error.message || '操作失败')
      }
    })
    .catch(() => {})
}

onMounted(() => {
  fetchDetail()
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

.title-section .time {
  margin: 8px 0 0;
  font-size: 13px;
  color: #999;
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

.cooperation-list {
  padding: 0 16px;
}

.cooperation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cooperation-item:last-child {
  border-bottom: none;
}

.merchant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.merchant-name {
  font-size: 14px;
  color: #333;
}

.match-hearts {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
}

.match-hearts-large {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}

.heart-active {
  color: #f44336;
  font-size: 14px;
}

.heart-inactive {
  color: #ddd;
  font-size: 14px;
}

.match-hearts-large .heart-active {
  font-size: 18px;
}

.match-hearts-large .heart-inactive {
  font-size: 18px;
}

.match-label {
  font-size: 12px;
  color: #666;
  margin-right: 6px;
}

.sponsor-type {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.sponsor-label {
  color: #666;
  margin-right: 4px;
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
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.popup-footer .van-button {
  flex: 1;
}
</style>
