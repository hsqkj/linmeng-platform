<template>
  <div class="register-page">
    <van-nav-bar title="商家用户注册" left-arrow @click-left="router.back()" />
    
    <div class="form">
      <van-cell-group inset>
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
          required
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary" 
              :disabled="countdown > 0" 
              @click.prevent="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>
        
        <van-field
          v-model="form.code"
          name="code"
          label="验证码"
          placeholder="请输入验证码"
          type="digit"
          maxlength="6"
          required
        />
        
        <van-field
          v-model="form.business_name"
          name="business_name"
          label="商家名称"
          placeholder="请输入商家名称"
          required
        />
        
        <van-field
          v-model="form.contact_name"
          name="contact_name"
          label="联系人姓名"
          placeholder="请输入联系人姓名"
          required
        />
        
        <van-field
          v-model="form.industry"
          is-link
          readonly
          name="industry"
          label="所属行业"
          placeholder="请选择所属行业"
          required
          clickable
          @click="showIndustryPicker = true"
        />
        
        <van-field
          v-model="form.address"
          name="address"
          label="商家地址"
          placeholder="请输入商家地址"
          required
        >
          <template #button>
            <van-button 
              size="small" 
              type="default" 
              icon="location-o"
              @click.prevent="getLocation"
            >
              定位
            </van-button>
          </template>
        </van-field>
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>详细地址用于计算与社区的距离，影响匹配度</span>
        </div>
        
        <div v-if="form.latitude && form.longitude" class="location-info">
          <van-icon name="location" color="#1989fa" />
          <span>已定位: {{ form.latitude.toFixed(6) }}, {{ form.longitude.toFixed(6) }}</span>
        </div>
        
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
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>详细描述商家业务范围、服务特色，有助于提高匹配度</span>
        </div>
        
        <van-field name="target_crowd" label="目标人群" required>
          <template #input>
            <van-checkbox-group v-model="form.target_crowd" direction="horizontal">
              <van-checkbox name="亲子/少儿">亲子/少儿</van-checkbox>
              <van-checkbox name="中老年">中老年</van-checkbox>
              <van-checkbox name="青年白领">青年白领</van-checkbox>
              <van-checkbox name="宝妈">宝妈</van-checkbox>
              <van-checkbox name="全社区居民">全社区居民</van-checkbox>
            </van-checkbox-group>
          </template>
        </van-field>
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>选择准确的目标人群，可提高匹配度25%</span>
        </div>
        
        <van-field name="sponsor_types" label="可提供赞助" required>
          <template #input>
            <van-checkbox-group v-model="form.sponsor_types" direction="horizontal">
              <van-checkbox name="现金赞助">现金赞助</van-checkbox>
              <van-checkbox name="物资赞助">物资赞助</van-checkbox>
              <van-checkbox name="人力支持">人力支持</van-checkbox>
              <van-checkbox name="场地提供">场地提供</van-checkbox>
            </van-checkbox-group>
          </template>
        </van-field>
        
        <div class="field-tip">
          <van-icon name="info-o" color="#1989fa" />
          <span>选择准确的赞助类型，可提高匹配度30%</span>
        </div>
        
        <van-field
          v-if="form.sponsor_types.includes('现金赞助')"
          v-model="form.sponsor_detail['现金赞助']"
          rows="2"
          autosize
          label="现金赞助详情"
          type="textarea"
          placeholder="请填写所需赞助金额区间、资金用途"
        />
        
        <van-field
          v-if="form.sponsor_types.includes('物资赞助')"
          v-model="form.sponsor_detail['物资赞助']"
          rows="2"
          autosize
          label="物资赞助详情"
          type="textarea"
          placeholder="请填写物资名称、规格、数量、交付时间要求"
        />
        
        <van-field
          v-if="form.sponsor_types.includes('人力支持')"
          v-model="form.sponsor_detail['人力支持']"
          rows="2"
          autosize
          label="人力支持详情"
          type="textarea"
          placeholder="请填写所需人力数量、专业要求、服务时长"
        />
        
        <van-field
          v-if="form.sponsor_types.includes('场地提供')"
          v-model="form.sponsor_detail['场地提供']"
          rows="2"
          autosize
          label="场地提供详情"
          type="textarea"
          placeholder="请填写场地面积、场地要求、使用时段"
        />
        
        <van-field name="return_expect" label="期望回报" required>
          <template #input>
            <div>
              <van-checkbox-group v-model="form.return_expect" direction="horizontal" :max="3">
                <van-checkbox name="现场横幅宣传">现场横幅宣传</van-checkbox>
                <van-checkbox name="居民/业主群推广">居民/业主群推广</van-checkbox>
                <van-checkbox name="现场展位">现场展位</van-checkbox>
                <van-checkbox name="荣誉证书">荣誉证书</van-checkbox>
                <van-checkbox name="现场口播介绍">现场口播介绍</van-checkbox>
                <van-checkbox name="口头感谢">口头感谢</van-checkbox>
              </van-checkbox-group>
              <div class="field-tip">最多选择3项</div>
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
        <van-button type="primary" block round :loading="loading" @click="handleSubmit">
          提交注册
        </van-button>
      </div>
      
      <div class="login-link">
        <span>已有账号？</span>
        <a @click="router.push('/login')">立即登录</a>
      </div>
    </div>
    
    <van-action-sheet 
      v-model:show="showIndustryPicker" 
      title="选择所属行业"
      :actions="industryActions"
      @select="onIndustrySelect"
      cancel-text="取消"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showLoadingToast, closeToast } from 'vant'
import api from '../api'

const router = useRouter()
const loading = ref(false)
const showIndustryPicker = ref(false)
const logoList = ref([])
const licenseList = ref([])
const countdown = ref(0)

const industryList = [
  '教育培训',
  '医院诊所',
  '药店',
  '餐饮小吃',
  '生鲜水果',
  '美业',
  '保健养生',
  '体育健身',
  '银行保险',
  '电信服务',
  '商超零售',
  '快递物流',
  '五金建材',
  '家居装修',
  '家纺布艺',
  '电子电器',
  '家政服务',
  '房产中介',
  '汽车服务',
  '旅游服务',
  '鲜花礼品',
  '电影演出',
  '娱乐休闲',
  '服装服饰',
  '酒店宾馆',
  '茶艺咖啡',
  '宠物服务',
  '眼镜',
  '新闻媒体',
  '其他'
]

const industryActions = computed(() => 
  industryList.map(item => ({ name: item }))
)

const form = reactive({
  phone: '',
  code: '',
  business_name: '',
  contact_name: '',
  industry: '',
  address: '',
  latitude: null,
  longitude: null,
  logo: '',
  description: '',
  sponsor_types: [],
  sponsor_detail: {
    '现金赞助': '',
    '物资赞助': '',
    '人力支持': '',
    '场地提供': ''
  },
  return_expect: [],
  target_crowd: [],
  license_img: ''
})

const sendCode = async () => {
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
    showFailToast('请输入正确的手机号')
    return
  }
  
  try {
    const res = await api.auth.sendSms({ phone: form.phone })
    if (res.code === 200) {
      showSuccessToast('验证码已发送')
      if (res.data && res.data.code) {
        form.code = res.data.code
      }
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      showFailToast(res.message || '发送失败')
    }
  } catch (error) {
    showFailToast(error.response?.data?.message || '发送失败')
  }
}

const onIndustrySelect = (action) => {
  form.industry = action.name
  showIndustryPicker.value = false
}

const getLocation = () => {
  if (!navigator.geolocation) {
    showFailToast('您的浏览器不支持定位功能')
    return
  }
  
  const isHttps = location.protocol === 'https:'
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  
  if (!isHttps && !isLocalhost) {
    showFailToast('定位功能需要HTTPS环境，请手动输入地址')
    return
  }
  
  showLoadingToast({
    message: '正在获取位置...',
    forbidClick: false,
    duration: 0
  })
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      closeToast()
      form.latitude = position.coords.latitude
      form.longitude = position.coords.longitude
      showSuccessToast('定位成功')
    },
    (error) => {
      closeToast()
      let message = '定位失败'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = '您拒绝了定位请求，请在浏览器设置中允许定位权限'
          break
        case error.POSITION_UNAVAILABLE:
          message = '位置信息不可用，请检查GPS是否开启'
          break
        case error.TIMEOUT:
          message = '定位请求超时，请重试'
          break
      }
      showFailToast(message)
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  )
}

const uploadFile = async (file, type) => {
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

const handleSubmit = async () => {
  if (!form.phone) {
    showFailToast('请输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    showFailToast('手机号格式错误')
    return
  }
  
  if (!form.code) {
    showFailToast('请输入验证码')
    return
  }
  
  if (!form.business_name) {
    showFailToast('请输入商家名称')
    return
  }
  
  if (!form.contact_name) {
    showFailToast('请输入联系人姓名')
    return
  }
  
  if (!form.industry) {
    showFailToast('请选择所属行业')
    return
  }
  
  if (!form.address) {
    showFailToast('请输入商家地址')
    return
  }
  
  if (form.target_crowd.length === 0) {
    showFailToast('请选择目标人群')
    return
  }
  
  if (form.sponsor_types.length === 0) {
    showFailToast('请选择可提供的赞助类型')
    return
  }
  
  if (form.return_expect.length === 0) {
    showFailToast('请选择期望回报')
    return
  }
  
  loading.value = true
  
  try {
    const sponsorDetailObj = {}
    form.sponsor_types.forEach(type => {
      if (form.sponsor_detail[type]) {
        sponsorDetailObj[type] = form.sponsor_detail[type]
      }
    })
    
    const submitData = {
      phone: form.phone,
      sms_code: form.code,
      business_name: form.business_name,
      contact_name: form.contact_name,
      industry: form.industry,
      address: form.address,
      latitude: form.latitude,
      longitude: form.longitude,
      logo: form.logo,
      description: form.description,
      sponsor_types: form.sponsor_types,
      sponsor_detail: sponsorDetailObj,
      return_expect: form.return_expect,
      target_crowd: form.target_crowd,
      license_img: form.license_img
    }
    
    const res = await api.merchant.registerNew(submitData)
    
    if (res.code === 200) {
      showSuccessToast('注册成功')
      router.push('/register/result')
    } else {
      showFailToast(res.message || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
    showFailToast(error.response?.data?.message || error.message || '注册失败')
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
