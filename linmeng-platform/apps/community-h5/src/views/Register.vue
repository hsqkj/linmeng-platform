<template>
  <div class="register-page">
    <van-nav-bar title="社区用户注册" left-arrow @click-left="router.back()" />
    
    <van-form @submit="onSubmit" class="form">
      <van-cell-group inset>
        <van-field
          v-model="areaText"
          is-link
          readonly
          name="area"
          label="所在区域"
          placeholder="请选择区/街道/社区"
          required
          @click="showAreaPicker = true"
          :rules="[{ required: true, message: '请选择所在区域' }]"
        />
        
        <van-field
          v-model="form.contact_name"
          name="contact_name"
          label="负责人姓名"
          placeholder="请输入负责人姓名"
          required
          :rules="[{ required: true, message: '请输入负责人姓名' }]"
        />
        
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
          required
          :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]"
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary" 
              :disabled="countdown > 0" 
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>
        
        <van-field
          v-model="form.sms_code"
          name="sms_code"
          label="验证码"
          placeholder="请输入验证码"
          type="digit"
          maxlength="6"
          required
          :rules="[{ required: true, message: '请输入验证码' }]"
        />
        
        <van-field
          v-model="form.address"
          name="address"
          label="详细地址"
          placeholder="请输入详细地址"
          required
          :rules="[{ required: true, message: '请输入详细地址' }]"
        >
          <template #button>
            <van-button 
              size="small" 
              type="default" 
              icon="location-o"
              @click="getLocation"
            >
              定位
            </van-button>
          </template>
        </van-field>
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>详细地址用于计算与商家的距离，影响匹配度</span>
        </div>
        
        <div v-if="form.latitude && form.longitude" class="location-info">
          <van-icon name="location" color="#1989fa" />
          <span>已定位: {{ form.latitude.toFixed(6) }}, {{ form.longitude.toFixed(6) }}</span>
        </div>
        
        <van-field
          v-model="form.total_households"
          type="number"
          name="total_households"
          label="居民总户数"
          placeholder="请输入居民总户数"
        />
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>总户数影响社区特征匹配，建议准确填写</span>
        </div>
        
        <van-field
          v-model="form.elderly_ratio"
          type="number"
          name="elderly_ratio"
          label="老年人占比(%)"
          placeholder="如: 30"
        />
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>老年比例影响中老年活动匹配，建议准确填写</span>
        </div>
        
        <van-field
          v-model="form.youth_family_ratio"
          type="number"
          name="youth_family_ratio"
          label="青少年家庭占比(%)"
          placeholder="如: 25"
        />
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>青少年家庭比例影响亲子活动匹配，建议准确填写</span>
        </div>
        
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
          提交注册
        </van-button>
      </div>
      
      <div class="login-link">
        <span>已有账号？</span>
        <a @click="router.push('/login')">立即登录</a>
      </div>
    </van-form>
    
    <van-popup v-model:show="showAreaPicker" position="bottom" round>
      <van-cascader
        v-model="form.areaCode"
        title="选择区域"
        :options="areaOptions"
        :field-names="fieldNames"
        @close="showAreaPicker = false"
        @finish="onAreaFinish"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog } from 'vant'
import api from '../api'

const router = useRouter()
const loading = ref(false)
const licenseList = ref([])
const countdown = ref(0)
const showAreaPicker = ref(false)

const fieldNames = {
  text: 'name',
  value: 'code',
  children: 'children'
}

const areaOptions = ref([
  {
    name: '东湖新技术开发区',
    code: '420100',
    children: [
      {
        name: '关东街道',
        code: '420101',
        children: [
          { name: '长山社区', code: '420101001' },
          { name: '关东社区', code: '420101002' },
          { name: '创业社区', code: '420101003' },
          { name: '当代社区', code: '420101004' },
          { name: '保利时代社区', code: '420101005' }
        ]
      }
    ]
  }
])

const form = reactive({
  phone: '',
  sms_code: '',
  community_name: '',
  contact_name: '',
  district: '',
  street: '',
  address: '',
  latitude: null,
  longitude: null,
  total_households: '',
  elderly_ratio: '',
  youth_family_ratio: '',
  public_space_area: '',
  residential_areas: '',
  nearby_merchants: '',
  license_img: '',
  areaCode: ''
})

const areaText = computed(() => {
  if (form.district && form.street && form.community_name) {
    return `${form.district} / ${form.street} / ${form.community_name}`
  }
  return ''
})

const sendCode = async () => {
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
    showDialog({ message: '请输入正确的手机号' })
    return
  }
  
  try {
    const res = await api.auth.sendSms({ phone: form.phone })
    if (res.code === 200) {
      showDialog({ message: '验证码已发送' })
      if (res.data && res.data.code) {
        form.sms_code = res.data.code
      }
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }
  } catch (error) {
    showDialog({ message: error.response?.data?.message || '发送失败' })
  }
}

const onAreaFinish = ({ selectedOptions }) => {
  showAreaPicker.value = false
  if (selectedOptions.length === 3) {
    form.district = selectedOptions[0].name
    form.street = selectedOptions[1].name
    form.community_name = selectedOptions[2].name
  }
}

const getLocation = () => {
  if (!navigator.geolocation) {
    showDialog({ message: '您的浏览器不支持定位功能' })
    return
  }
  
  showDialog({ message: '正在获取位置...' })
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.latitude = position.coords.latitude
      form.longitude = position.coords.longitude
      showDialog({ message: '定位成功' })
    },
    (error) => {
      let message = '定位失败'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = '您拒绝了定位请求'
          break
        case error.POSITION_UNAVAILABLE:
          message = '位置信息不可用'
          break
        case error.TIMEOUT:
          message = '定位请求超时'
          break
      }
      showDialog({ message })
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const afterRead = async (file) => {
  file.status = 'uploading'
  file.message = '上传中...'
  
  const formData = new FormData()
  formData.append('file', file.file)
  
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    }).then(r => r.json())
    
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
  } catch {
    file.status = 'failed'
    file.message = '上传失败'
  }
}

const onSubmit = async () => {
  if (!form.district || !form.street || !form.community_name) {
    showDialog({ message: '请选择所在区域' })
    return
  }
  
  loading.value = true
  try {
    const res = await api.community.registerNew({
      phone: form.phone,
      sms_code: form.sms_code,
      community_name: form.community_name,
      contact_name: form.contact_name,
      district: form.district,
      street: form.street,
      address: form.address,
      latitude: form.latitude,
      longitude: form.longitude,
      total_households: form.total_households,
      elderly_ratio: form.elderly_ratio,
      youth_family_ratio: form.youth_family_ratio,
      public_space_area: form.public_space_area,
      residential_areas: form.residential_areas,
      nearby_merchants: form.nearby_merchants,
      license_img: form.license_img
    })
    if (res.code === 200) {
      showDialog({ message: '注册成功，请等待审核' }).then(() => {
        router.push('/login')
      })
    }
  } catch (error) {
    showDialog({ message: error.response?.data?.message || '注册失败' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20px;
}

.form {
  margin-top: 12px;
}

.submit-btn {
  margin: 20px 16px;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #1989fa;
  cursor: pointer;
}

.location-info {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  color: #666;
  background: #f7f8fa;
}

.location-info .van-icon {
  margin-right: 4px;
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
