<template>
  <div class="profile-edit-page">
    <van-nav-bar title="编辑资料" left-arrow @click-left="router.back()" />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.community_name"
          name="community_name"
          label="社区全称"
          placeholder="请输入社区全称"
          :rules="[{ required: true, message: '请输入社区全称' }]"
        />
        
        <van-field
          v-model="form.contact_name"
          name="contact_name"
          label="负责人姓名"
          placeholder="请输入负责人姓名"
          :rules="[{ required: true, message: '请输入负责人姓名' }]"
        />
        
        <van-field
          v-model="form.street"
          name="street"
          label="所属街道"
          placeholder="请输入所属街道"
          :rules="[{ required: true, message: '请输入所属街道' }]"
        />
        
        <van-field
          v-model="form.address"
          name="address"
          label="详细地址"
          placeholder="请输入详细地址"
          :rules="[{ required: true, message: '请输入详细地址' }]"
        />
        
        <van-field
          v-model="form.total_households"
          type="number"
          name="total_households"
          label="居民总户数"
          placeholder="请输入居民总户数"
        />
        
        <van-field
          v-model="form.elderly_ratio"
          type="number"
          name="elderly_ratio"
          label="老年人占比(%)"
          placeholder="如: 30"
        />
        
        <van-field
          v-model="form.youth_family_ratio"
          type="number"
          name="youth_family_ratio"
          label="青少年家庭占比(%)"
          placeholder="如: 25"
        />
        
        <van-field
          v-model="form.public_space_area"
          type="number"
          name="public_space_area"
          label="公共空间面积(㎡)"
          placeholder="请输入公共空间面积"
        />
        
        <van-field
          v-model="form.residential_areas"
          name="residential_areas"
          label="所辖小区"
          placeholder="多个小区用逗号分隔"
          type="textarea"
          rows="2"
        />
        
        <van-field
          v-model="form.nearby_merchants"
          type="number"
          name="nearby_merchants"
          label="辖区商户数量"
          placeholder="请输入商户数量"
        />
        
        <van-field name="license_img" label="资质证明">
          <template #input>
            <van-uploader
              v-model="licenseList"
              :max-count="1"
              :after-read="afterRead"
            />
          </template>
        </van-field>
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button type="primary" block round native-type="submit" :loading="loading">
          保存修改
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import api from '../../api'

const router = useRouter()
const loading = ref(false)
const licenseList = ref([])

const form = reactive({
  community_name: '',
  contact_name: '',
  street: '',
  address: '',
  total_households: '',
  elderly_ratio: '',
  youth_family_ratio: '',
  public_space_area: '',
  residential_areas: '',
  nearby_merchants: '',
  license_img: ''
})

const fetchProfile = async () => {
  try {
    const res = await api.community.getProfile()
    if (res.code === 200) {
      Object.assign(form, res.data)
      if (res.data.license_img) {
        licenseList.value = [{ url: res.data.license_img }]
      }
    }
  } catch (error) {
    console.error('获取资料失败:', error)
  }
}

const afterRead = (file) => {
  file.status = 'uploading'
  file.message = '上传中...'
  
  const formData = new FormData()
  formData.append('file', file.file)
  
  fetch('/api/upload', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(res => res.json())
    .then(res => {
      if (res.code === 200) {
        file.status = 'done'
        const baseUrl = 'http://localhost:3000'
        const fullUrl = baseUrl + res.data.url
        file.url = fullUrl
        form.license_img = fullUrl
      } else {
        file.status = 'failed'
        file.message = '上传失败'
      }
    })
    .catch(() => {
      file.status = 'failed'
      file.message = '上传失败'
    })
}

const onSubmit = async () => {
  loading.value = true
  try {
    const res = await api.community.updateProfile(form)
    if (res.code === 200) {
      showSuccessToast('保存成功')
      router.back()
    }
  } catch (error) {
    showToast('保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-edit-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20px;
}

.submit-btn {
  margin: 20px 16px;
}
</style>
