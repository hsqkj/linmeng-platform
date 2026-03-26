<template>
  <div class="login-page">
    <div class="header">
      <h1 class="title">邻盟</h1>
      <p class="slogan">社区活动缺资源？社区空间缺运营？社区服务缺专家？【邻盟智能助手】免费智能匹配商家赞助、物资、人力、场地、技术、专家、媒体宣传等优质爱心资源。</p>
    </div>
    
    <div class="login-form">
      <van-form @submit="onSubmit">
        <van-field
          v-model="phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
          :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]"
        />
        <van-field
          v-model="smsCode"
          name="smsCode"
          label="验证码"
          placeholder="请输入验证码"
          maxlength="6"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary" 
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
            </van-button>
          </template>
        </van-field>
        <div class="submit-btn">
          <van-button type="primary" block round native-type="submit" :loading="loading">
            登录
          </van-button>
        </div>
        <div class="register-link">
          <span>还没有账号？</span>
          <a @click="goToRegister">立即注册</a>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog } from 'vant'
import api from '../api'

const router = useRouter()

const phone = ref('')
const smsCode = ref('')
const loading = ref(false)
const countdown = ref(0)

const handleSendCode = async () => {
  if (!phone.value) {
    showDialog({ message: '请输入手机号' })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showDialog({ message: '手机号格式错误' })
    return
  }
  
  try {
    const res = await api.auth.sendSms({ phone: phone.value })
    if (res.code === 200) {
      if (res.data && res.data.code) {
        smsCode.value = res.data.code
        showDialog({ message: `验证码已发送：${res.data.code}` })
      } else {
        showDialog({ message: '验证码已发送' })
      }
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      showDialog({ message: res.message || '发送失败' })
    }
  } catch (error) {
    showDialog({ message: error.response?.data?.message || error.message || '发送验证码失败' })
  }
}

const onSubmit = async () => {
  if (!phone.value) {
    showDialog({ message: '请输入手机号' })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    showDialog({ message: '手机号格式错误' })
    return
  }
  
  if (!smsCode.value) {
    showDialog({ message: '请输入验证码' })
    return
  }
  
  loading.value = true
  try {
    const res = await api.auth.login({ 
      phone: phone.value, 
      sms_code: smsCode.value,
      user_type: 'community' 
    })
    if (res.code === 200) {
      localStorage.setItem('community_token', res.data.token)
      if (res.data.user) {
        localStorage.setItem('community_profile', JSON.stringify(res.data.user))
      }
      if (res.data.user.status === 0) {
        showDialog({ message: '账号待审核，请等待管理员审核' })
      } else {
        showDialog({ message: '登录成功' })
        router.push('/home')
      }
    } else {
      showDialog({ message: res.message || '登录失败' })
    }
  } catch (error) {
    console.error('Login error:', error)
    const message = error.response?.data?.message || error.message || '登录失败'
    showDialog({ message })
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.header {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 36px;
  color: #fff;
  margin-bottom: 16px;
}

.slogan {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  text-align: center;
}

.login-form {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.submit-btn {
  margin-top: 24px;
}

.register-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #1989fa;
  cursor: pointer;
}
</style>
