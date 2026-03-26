<template>
  <div class="register-page">
    <van-nav-bar title="招商大使注册" left-arrow @click-left="router.back()" />
    
    <van-form @submit="handleRegister">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        />
        <van-field
          v-model="form.phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          maxlength="11"
          :rules="[{ required: true, message: '请输入手机号' }]"
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
          :rules="[{ required: true, message: '请输入验证码' }]"
        />
        <van-field
          v-model="form.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
        <van-field
          v-model="form.confirmPassword"
          type="password"
          name="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[{ required: true, message: '请确认密码' }]"
        />
      </van-cell-group>
      
      <div class="register-actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import api from '../api'

const router = useRouter()
const form = ref({
  name: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)
const countdown = ref(0)

const sendCode = async () => {
  if (!form.value.phone) {
    showFailToast('请输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    showFailToast('请输入正确的手机号')
    return
  }
  
  try {
    const res = await api.auth.sendSms({ phone: form.value.phone })
    if (res.code === 200) {
      showSuccessToast('验证码已发送')
      if (res.data && res.data.code) {
        form.value.code = res.data.code
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

const handleRegister = async () => {
  if (!form.value.name || !form.value.phone || !form.value.code || !form.value.password) {
    showToast('请填写必填信息')
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    showToast('两次密码输入不一致')
    return
  }
  
  if (form.value.password.length < 6) {
    showToast('密码至少6位')
    return
  }
  
  loading.value = true
  try {
    const res = await api.salesman.register({
      name: form.value.name,
      phone: form.value.phone,
      code: form.value.code,
      password: form.value.password
    })
    
    if (res.code === 200) {
      showSuccessToast('注册成功')
      router.push('/login')
    }
  } catch (error) {
    console.error('注册失败:', error)
    showToast(error.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-top: 46px;
}

.register-actions {
  margin-top: 24px;
  padding: 0 16px;
}
</style>
