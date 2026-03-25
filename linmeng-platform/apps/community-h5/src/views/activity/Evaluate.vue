<template>
  <div class="evaluate-page">
    <van-nav-bar title="评价商家" left-arrow @click-left="router.back()" />
    
    <van-cell-group inset title="合作商家">
      <div class="merchant-card" v-if="merchant">
        <van-image
          :src="merchant.logo || 'https://via.placeholder.com/60'"
          round
          width="60"
          height="60"
        />
        <div class="merchant-info">
          <div class="name">{{ merchant.business_name }}</div>
          <div class="industry">{{ merchant.industry }}</div>
        </div>
      </div>
    </van-cell-group>
    
    <van-form @submit="onSubmit">
      <van-cell-group inset title="评分">
        <van-cell title="赞助质量">
          <template #right-icon>
            <van-rate v-model="form.score_quality" :size="24" />
          </template>
        </van-cell>
        
        <van-cell title="配合度">
          <template #right-icon>
            <van-rate v-model="form.score_cooperate" :size="24" />
          </template>
        </van-cell>
        
        <van-cell title="服务态度">
          <template #right-icon>
            <van-rate v-model="form.score_service" :size="24" />
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset title="评价内容">
        <van-field
          v-model="form.content"
          rows="4"
          autosize
          type="textarea"
          placeholder="请输入您的评价内容"
          :rules="[{ required: true, message: '请输入评价内容' }]"
        />
        
        <van-field name="img" label="上传照片">
          <template #input>
            <van-uploader
              v-model="fileList"
              multiple
              :max-count="5"
              :after-read="afterRead"
            />
          </template>
        </van-field>
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button type="primary" block round native-type="submit" :loading="loading">
          提交评价
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import api from '../../api'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const fileList = ref([])
const merchant = ref(null)

const form = reactive({
  score_quality: 5,
  score_cooperate: 5,
  score_service: 5,
  content: '',
  img: ''
})

const totalScore = computed(() => {
  return ((form.score_quality + form.score_cooperate + form.score_service) / 3).toFixed(1)
})

const fetchMerchant = async () => {
  try {
    const res = await api.cooperation.getMerchant(route.params.id)
    if (res.code === 200) {
      merchant.value = res.data
    }
  } catch (error) {
    console.error('获取商家信息失败:', error)
  }
}

const afterRead = (file) => {
  if (Array.isArray(file)) {
    file.forEach(f => uploadFile(f))
  } else {
    uploadFile(file)
  }
}

const uploadFile = async (file) => {
  file.status = 'uploading'
  file.message = '上传中...'
  
  const formData = new FormData()
  formData.append('file', file.file)
  
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(r => r.json())
    
    if (res.code === 200) {
      file.status = 'done'
      const baseUrl = 'http://localhost:3000'
      file.url = baseUrl + res.data.url
    } else {
      file.status = 'failed'
      file.message = '上传失败'
    }
  } catch {
    file.status = 'failed'
    file.message = '上传失败'
  }
}

const onSubmit = async () => {
  loading.value = true
  
  const urls = fileList.value
    .filter(f => f.status === 'done' && f.url)
    .map(f => f.url)
  
  try {
    const res = await api.evaluate.create({
      ...form,
      activity_id: route.params.id,
      business_id: merchant.value?.id,
      total_score: parseFloat(totalScore.value),
      img: urls.join(',')
    })
    
    if (res.code === 200) {
      showSuccessToast('评价成功')
      router.back()
    }
  } catch (error) {
    showToast('评价失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMerchant()
})
</script>

<style scoped>
.evaluate-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20px;
}

.merchant-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.merchant-info .name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.merchant-info .industry {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.submit-btn {
  margin: 20px 16px;
}
</style>
