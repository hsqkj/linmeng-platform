<template>
  <div class="activity-list-page">
    <van-nav-bar title="我的需求" left-arrow @click-left="router.back()">
      <template #right>
        <van-icon name="plus" size="20" @click="router.push('/activity/create')" style="margin-right: 12px;" />
        <van-icon name="description" size="20" @click="showImportPopup = true" />
      </template>
    </van-nav-bar>
    
    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab title="全部" name="all" />
      <van-tab title="待审核" name="0" />
      <van-tab title="招募中" name="1" />
      <van-tab title="进行中" name="2" />
      <van-tab title="已完成" name="3" />
    </van-tabs>
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-empty v-if="list.length === 0 && !loading" description="暂无需求" />
        
        <van-card
          v-for="item in list"
          :key="item.id"
          class="activity-card"
          @click="router.push(`/activity/${item.id}`)"
        >
          <template #title>
            <div class="card-header">
              <span class="title">{{ item.title }}</span>
              <div class="tags">
                <van-tag type="primary" plain size="small">{{ getDemandTypeText(item.demand_type) }}</van-tag>
                <van-tag :type="getStatusType(item.status)">{{ getStatusText(item.status) }}</van-tag>
              </div>
            </div>
          </template>
          
          <template #desc>
            <div class="card-desc">
              <template v-if="item.demand_type === 'activity' || !item.demand_type">
                <div class="desc-item">
                  <van-icon name="clock-o" />
                  <span>{{ formatDateTime(item.start_time) }} ~ {{ formatDateTime(item.end_time) }}</span>
                </div>
                <div class="desc-item">
                  <van-icon name="location-o" />
                  <span>{{ item.location }}</span>
                </div>
                <div class="desc-item">
                  <van-icon name="friends-o" />
                  <span>{{ item.expected_count }}人 · {{ item.target_crowd }}</span>
                </div>
              </template>
              <template v-else-if="item.demand_type === 'space'">
                <div class="desc-item">
                  <van-icon name="location-o" />
                  <span>{{ item.space_location }}</span>
                </div>
                <div class="desc-item">
                  <van-icon name="apps-o" />
                  <span>{{ item.space_area }}㎡ · {{ item.space_type }}</span>
                </div>
              </template>
              <template v-else-if="item.demand_type === 'consult'">
                <div class="desc-item">
                  <van-icon name="user-o" />
                  <span>咨询领域：{{ item.consult_field }}</span>
                </div>
                <div class="desc-item">
                  <van-icon name="clock-o" />
                  <span>{{ item.consult_duration }}</span>
                </div>
              </template>
            </div>
          </template>
          
          <template #footer>
            <div class="card-footer">
              <span class="apply-count" v-if="item.demand_type === 'activity' || !item.demand_type">
                已报名商家: {{ item.apply_count || 0 }}家
              </span>
              <van-button size="small" type="primary" plain>查看详情</van-button>
            </div>
          </template>
        </van-card>
      </van-list>
    </van-pull-refresh>
    
    <van-popup v-model:show="showImportPopup" round position="bottom" :style="{ height: '40%' }">
      <div class="import-popup">
        <div class="popup-header">
          <h3>批量导入需求</h3>
          <van-icon name="cross" @click="showImportPopup = false" />
        </div>
        
        <div class="popup-content">
          <van-cell-group inset>
            <van-cell title="下载导入模板" is-link @click="downloadTemplate">
              <template #icon>
                <van-icon name="down" class="cell-icon" />
              </template>
            </van-cell>
            
            <van-cell title="上传需求文件" is-link @click="triggerUpload">
              <template #icon>
                <van-icon name="upgrade" class="cell-icon" />
              </template>
            </van-cell>
          </van-cell-group>
          
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
    
    <van-tabbar v-model="activeTabbar" fixed>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="records-o" to="/activity/list">需求</van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/message">消息</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast, showDialog } from 'vant'
import api from '../../api'
import { formatDateTime } from '../../utils'

const router = useRouter()
const activeTab = ref('all')
const activeTabbar = ref(1)
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 10
const initialized = ref(false)

const showImportPopup = ref(false)
const showProgressDialog = ref(false)
const progressText = ref('正在导入...')
const fileInput = ref(null)

const getStatusType = (status) => {
  const types = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'default',
    4: 'danger'
  }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    0: '待审核',
    1: '招募中',
    2: '进行中',
    3: '已完成',
    4: '已取消'
  }
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

const fetchList = async () => {
  try {
    const params = {
      page: page.value,
      pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    }
    const res = await api.activity.getMyList(params)
    if (res.code === 200) {
      const newList = res.data.list || res.data || []
      if (page.value === 1) {
        list.value = newList
      } else {
        list.value.push(...newList)
      }
      finished.value = newList.length < pageSize
    }
  } catch (error) {
    console.error('获取活动列表失败:', error)
  }
}

const onLoad = async () => {
  if (!initialized.value) return
  await fetchList()
  loading.value = false
  page.value++
}

const onRefresh = async () => {
  page.value = 1
  finished.value = false
  await fetchList()
  refreshing.value = false
  page.value++
}

const onTabChange = () => {
  page.value = 1
  list.value = []
  finished.value = false
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
      
      page.value = 1
      finished.value = false
      await fetchList()
      page.value++
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

onMounted(() => {
  initialized.value = true
})
</script>

<style scoped>
.activity-list-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.activity-card {
  margin: 12px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.card-desc {
  margin-top: 8px;
}

.desc-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.apply-count {
  font-size: 13px;
  color: #999;
}

.import-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.popup-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
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
  background: #f7f8fa;
  border-radius: 8px;
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
