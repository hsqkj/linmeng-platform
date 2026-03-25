<template>
  <div class="profile-edit-page">
    <van-nav-bar title="编辑资料" left-arrow @click-left="router.back()" />
    
    <van-form @submit="onSubmit">
      <van-notice-bar
        left-icon="info-o"
        color="#1989fa"
        background="#ecf9ff"
        style="margin: 12px 0"
      >
        填写的越详细，匹配度越精准，获得推荐的机会越大
      </van-notice-bar>
      
      <van-cell-group inset>
        <van-field
          v-model="form.business_name"
          name="business_name"
          label="商家名称"
          placeholder="请输入商家名称"
          :rules="[{ required: true, message: '请输入商家名称' }]"
        />
        
        <van-field
          v-model="form.contact_name"
          name="contact_name"
          label="联系人姓名"
          placeholder="请输入联系人姓名"
          :rules="[{ required: true, message: '请输入联系人姓名' }]"
        />
        
        <van-field
          v-model="form.industry"
          name="industry"
          label="所属行业"
          placeholder="请选择所属行业"
          readonly
          clickable
          @click="showIndustryPicker = true"
          :rules="[{ required: true, message: '请选择所属行业' }]"
        />
        
        <van-field
          v-model="form.address"
          name="address"
          label="商家地址"
          placeholder="请输入商家地址"
          :rules="[{ required: true, message: '请输入商家地址' }]"
        />
        
        <van-field name="logo" label="商家Logo">
          <template #input>
            <van-uploader
              v-model="logoList"
              :max-count="1"
              :after-read="(file) => uploadFile(file, 'logo')"
            />
          </template>
        </van-field>
        
        <van-field
          v-model="form.description"
          name="description"
          label="商家简介"
          placeholder="请输入商家简介"
          type="textarea"
          rows="3"
        />
        
        <van-field
          v-model="form.sponsor_types"
          name="sponsor_types"
          label="可提供赞助"
          placeholder="如: 物资、场地、服务"
        />
        
        <van-field
          v-model="form.target_crowd"
          name="target_crowd"
          label="目标人群"
          placeholder="如: 老年人、亲子家庭"
        />
        
        <van-field name="tags" label="标签选择">
          <template #input>
            <div class="tag-selector">
              <van-tag
                v-for="tag in allTags"
                :key="tag.id"
                :type="selectedTags.includes(tag.id) ? 'primary' : 'default'"
                size="medium"
                style="margin: 4px"
                @click="toggleTag(tag.id)"
              >
                {{ tag.name }}
              </van-tag>
            </div>
          </template>
        </van-field>
        
        <van-field
          v-model="customTagInput"
          name="custom_tag"
          label="自定义标签"
          placeholder="输入后点击添加按钮"
        >
          <template #button>
            <van-button size="small" type="primary" @click="addCustomTag">添加</van-button>
          </template>
        </van-field>
        
        <van-field name="custom_tags" label="已添加标签" v-if="customTags.length > 0">
          <template #input>
            <div class="tag-selector">
              <van-tag
                v-for="(tag, index) in customTags"
                :key="index"
                closeable
                type="success"
                size="medium"
                style="margin: 4px"
                @close="removeCustomTag(index)"
              >
                {{ tag }}
              </van-tag>
            </div>
          </template>
        </van-field>
        
        <van-field name="license_img" label="营业执照">
          <template #input>
            <van-uploader
              v-model="licenseList"
              :max-count="1"
              :after-read="(file) => uploadFile(file, 'license')"
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
    
    <van-popup v-model:show="showIndustryPicker" position="bottom" round>
      <van-picker
        title="选择行业"
        :columns="industryOptions"
        @confirm="onIndustryConfirm"
        @cancel="showIndustryPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import api from '../../api'

const router = useRouter()
const loading = ref(false)
const showIndustryPicker = ref(false)
const logoList = ref([])
const licenseList = ref([])
const allTags = ref([])
const selectedTags = ref([])
const customTagInput = ref('')
const customTags = ref([])

const industryOptions = [
  '餐饮美食',
  '生活服务',
  '教育培训',
  '医疗健康',
  '美容美发',
  '休闲娱乐',
  '零售购物',
  '家政服务',
  '宠物服务',
  '新闻媒体',
  '其他'
]

const form = reactive({
  business_name: '',
  contact_name: '',
  industry: '',
  address: '',
  logo: '',
  description: '',
  sponsor_types: '',
  target_crowd: '',
  license_img: ''
})

const fetchProfile = async () => {
  try {
    const res = await api.merchant.getProfile()
    if (res.code === 200) {
      Object.assign(form, res.data)
      if (res.data.logo) {
        const logoUrl = getImageUrl(res.data.logo)
        logoList.value = [{ url: logoUrl }]
        form.logo = logoUrl
      }
      if (res.data.license_img) {
        const licenseUrl = getImageUrl(res.data.license_img)
        licenseList.value = [{ url: licenseUrl }]
        form.license_img = licenseUrl
      }
      if (res.data.tags) {
        try {
          selectedTags.value = JSON.parse(res.data.tags)
        } catch (e) {
          selectedTags.value = []
        }
      }
      if (res.data.custom_tags) {
        try {
          customTags.value = JSON.parse(res.data.custom_tags)
        } catch (e) {
          customTags.value = []
        }
      }
    }
  } catch (error) {
    console.error('获取资料失败:', error)
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

const toggleTag = (tagId) => {
  const index = selectedTags.value.indexOf(tagId)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagId)
  }
}

const addCustomTag = () => {
  const tag = customTagInput.value.trim()
  if (!tag) {
    showToast('请输入标签名称')
    return
  }
  if (customTags.value.includes(tag)) {
    showToast('该标签已存在')
    return
  }
  if (customTags.value.length >= 10) {
    showToast('最多添加10个自定义标签')
    return
  }
  customTags.value.push(tag)
  customTagInput.value = ''
}

const removeCustomTag = (index) => {
  customTags.value.splice(index, 1)
}

const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.replace('http://localhost:3000', 'http://localhost:3001')
  }
  return `http://localhost:3001${url.startsWith('/') ? '' : '/'}${url}`
}

const onIndustryConfirm = ({ selectedOptions }) => {
  form.industry = selectedOptions[0]?.text || selectedOptions[0]
  showIndustryPicker.value = false
}

const uploadFile = async (file, type) => {
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
      const fullUrl = getImageUrl(res.data.url)
      file.url = fullUrl
      if (type === 'logo') {
        form.logo = fullUrl
      } else {
        form.license_img = fullUrl
      }
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
  try {
    const submitData = {
      ...form,
      tags: JSON.stringify(selectedTags.value),
      custom_tags: JSON.stringify(customTags.value)
    }
    const res = await api.merchant.updateProfile(submitData)
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
  loadTags()
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

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  padding: 8px 0;
}
</style>
