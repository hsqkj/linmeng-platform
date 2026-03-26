<template>
  <div class="sponsor-edit-page">
    <van-nav-bar title="编辑赞助信息" left-arrow @click-left="router.back()" />
    
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.title"
          name="title"
          label="标题"
          placeholder="请输入赞助信息标题"
          :rules="[{ required: true, message: '请输入标题' }]"
        />
        
        <van-field
          v-model="form.sponsor_type"
          name="sponsor_type"
          label="赞助类型"
          placeholder="请选择赞助类型"
          readonly
          clickable
          @click="showTypePicker = true"
          :rules="[{ required: true, message: '请选择赞助类型' }]"
        />
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>选择准确的赞助类型，可提高匹配度30%</span>
        </div>
        
        <van-field
          v-model="form.sponsor_detail"
          name="sponsor_detail"
          label="赞助详情"
          placeholder="请详细描述可提供的赞助内容"
          type="textarea"
          rows="4"
          :rules="[{ required: true, message: '请输入赞助详情' }]"
        />
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>详细描述赞助内容、数量、价值，有助于提高匹配度</span>
        </div>
        
        <van-field name="images" label="图片">
          <template #input>
            <van-uploader
              v-model="imageList"
              multiple
              :max-count="9"
              :after-read="afterReadImage"
              @delete="onDeleteImage"
            />
          </template>
        </van-field>
        
        <van-field name="video" label="视频">
          <template #input>
            <van-uploader
              v-model="videoList"
              :max-count="1"
              accept="video/*"
              :after-read="afterReadVideo"
              @delete="onDeleteVideo"
            />
          </template>
        </van-field>
        
        <van-field
          v-model="form.contact_name"
          name="contact_name"
          label="联系人"
          placeholder="请输入联系人姓名"
        />
        
        <van-field
          v-model="form.contact_phone"
          name="contact_phone"
          label="联系电话"
          placeholder="请输入联系电话"
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
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>选择相关标签，可提高匹配度5%</span>
        </div>
        
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
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button type="primary" block round native-type="submit" :loading="loading">
          保存修改
        </van-button>
      </div>
    </van-form>
    
    <van-action-sheet
      v-model:show="showTypePicker"
      title="选择赞助类型"
      :actions="typeActions"
      @select="onTypeSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showToast, showLoadingToast, closeToast } from 'vant'
import api from '../../api'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const showTypePicker = ref(false)
const imageList = ref([])
const videoList = ref([])
const allTags = ref([])
const selectedTags = ref([])
const customTagInput = ref('')
const customTags = ref([])

const typeActions = [
  { name: '物资类' },
  { name: '场地类' },
  { name: '服务类' },
  { name: '人力类' },
  { name: '媒体类' },
  { name: '其他' }
]

const form = reactive({
  title: '',
  sponsor_type: '',
  sponsor_detail: '',
  images: [],
  video: '',
  contact_name: '',
  contact_phone: ''
})

const onTypeSelect = (action) => {
  form.sponsor_type = action.name
  showTypePicker.value = false
}

const afterReadImage = async (file) => {
  if (Array.isArray(file)) {
    for (let f of file) {
      await uploadImage(f)
    }
  } else {
    await uploadImage(file)
  }
}

const uploadImage = async (file) => {
  file.status = 'uploading'
  file.message = '上传中...'
  
  try {
    const formData = new FormData()
    formData.append('file', file.file)
    
    const res = await axios.post('http://localhost:3000/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (res.data.code === 200) {
      file.status = 'done'
      file.message = '上传成功'
      file.url = res.data.url
      form.images.push(res.data.url)
    } else {
      file.status = 'failed'
      file.message = '上传失败'
    }
  } catch (error) {
    file.status = 'failed'
    file.message = '上传失败'
    console.error('上传图片失败:', error)
  }
}

const onDeleteImage = (file, detail) => {
  const index = detail.index
  form.images.splice(index, 1)
}

const afterReadVideo = async (file) => {
  file.status = 'uploading'
  file.message = '上传中...'
  
  try {
    const formData = new FormData()
    formData.append('file', file.file)
    
    const res = await axios.post('http://localhost:3000/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    if (res.data.code === 200) {
      file.status = 'done'
      file.message = '上传成功'
      file.url = res.data.url
      form.video = res.data.url
    } else {
      file.status = 'failed'
      file.message = '上传失败'
    }
  } catch (error) {
    file.status = 'failed'
    file.message = '上传失败'
    console.error('上传视频失败:', error)
  }
}

const onDeleteVideo = () => {
  form.video = ''
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

const loadSponsorData = async () => {
  const id = route.params.id
  if (!id) {
    showToast('缺少赞助信息ID')
    router.back()
    return
  }
  
  try {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
    })
    
    const res = await api.sponsor.getDetail(id)
    closeToast()
    
    if (res.code === 200 && res.data) {
      const data = res.data
      
      form.title = data.title || ''
      form.sponsor_type = data.sponsor_type || ''
      form.sponsor_detail = data.sponsor_detail || ''
      form.contact_name = data.contact_name || ''
      form.contact_phone = data.contact_phone || ''
      
      if (data.images) {
        try {
          const images = JSON.parse(data.images)
          form.images = images
          imageList.value = images.map(url => ({ url, status: 'done', message: '' }))
        } catch (e) {
          console.error('解析图片数据失败:', e)
        }
      }
      
      if (data.video) {
        form.video = data.video
        videoList.value = [{ url: data.video, status: 'done', message: '' }]
      }
      
      if (data.tags) {
        try {
          selectedTags.value = JSON.parse(data.tags)
        } catch (e) {
          console.error('解析标签数据失败:', e)
        }
      }
      
      if (data.custom_tags) {
        try {
          customTags.value = JSON.parse(data.custom_tags)
        } catch (e) {
          console.error('解析自定义标签数据失败:', e)
        }
      }
    } else {
      showToast('加载失败')
      router.back()
    }
  } catch (error) {
    closeToast()
    console.error('加载赞助信息失败:', error)
    showToast('加载失败')
    router.back()
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

const onSubmit = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const submitData = {
      ...form,
      images: form.images.length > 0 ? JSON.stringify(form.images) : null,
      tags: JSON.stringify(selectedTags.value),
      custom_tags: JSON.stringify(customTags.value)
    }
    
    const res = await api.sponsor.update(id, submitData)
    if (res.code === 200) {
      showSuccessToast('修改成功')
      router.back()
    } else {
      showToast(res.message || '修改失败')
    }
  } catch (error) {
    showToast(error.message || '修改失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTags()
  loadSponsorData()
})
</script>

<style scoped>
.sponsor-edit-page {
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

.field-tip {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  color: #1989fa;
  background: #ecf9ff;
  margin: 0 16px;
  border-radius: 4px;
}

.field-tip .van-icon {
  margin-right: 6px;
}
</style>
