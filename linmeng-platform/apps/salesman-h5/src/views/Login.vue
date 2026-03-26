<template>
  <div class="login-page">
    <div class="login-header">
      <h1>邻盟招商大使平台</h1>
      <p>推广获客，轻松赚钱</p>
    </div>
    
    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="phone"
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          type="tel"
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>
      
      <div class="login-actions">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
        <van-button round block plain type="primary" @click="router.push('/register')" style="margin-top: 12px">
          注册账号
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import api from '../api'

const router = useRouter()
const phone = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!phone.value || !password.value) {
    showToast('请输入手机号和密码')
    return
  }
  
  loading.value = true
  try {
    const res = await api.salesman.login({
      phone: phone.value,
      password: password.value
    })
    
    if (res.code === 200) {
      localStorage.setItem('salesman_token', res.data.token)
      localStorage.setItem('salesman_profile', JSON.stringify(res.data.salesman))
      showSuccessToast('登录成功')
      router.push('/home')
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  color: #fff;
}

.login-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.9;
}

.login-actions {
  margin-top: 24px;
  padding: 0 16px;
}
</style>
