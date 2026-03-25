<template>
  <div class="login-page">
    <div class="header">
      <h1 class="title">邻盟商家端</h1>
      <p class="slogan">因为有您的爱心和善行，才能精准触达社区居民，提升信用，高效获客转化。</p>
    </div>
    
    <van-form @submit="onSubmit" class="form">
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
        <a @click="router.push('/register')">立即注册</a>
      </div>
    </van-form>
    
    <div class="footer">
      <p>登录即表示同意 <a @click="showAgreement" class="agreement-link">《用户服务协议》</a></p>
    </div>
    
    <van-popup
      v-model:show="showAgreementPopup"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <div class="agreement-content">
        <div class="agreement-header">
          <h3>用户服务协议</h3>
          <van-icon name="cross" @click="showAgreementPopup = false" />
        </div>
        <div class="agreement-body">
          <h4>一、服务条款</h4>
          <p>欢迎使用邻盟商家端平台服务。本协议是您与邻盟平台之间关于使用平台服务的法律协议。请您仔细阅读以下条款，使用本平台服务即表示您同意遵守本协议的所有条款。</p>
          
          <h4>二、服务内容</h4>
          <p>邻盟平台为商家提供社区需求展示、赞助信息发布、合作对接等服务。平台致力于连接商家与社区，促进双方合作共赢。</p>
          
          <h4>三、用户注册</h4>
          <p>1. 用户应提供真实、准确、完整的个人及企业信息。</p>
          <p>2. 用户应妥善保管账号密码，因账号密码泄露造成的损失由用户自行承担。</p>
          <p>3. 用户不得将账号转让、出借给他人使用。</p>
          
          <h4>四、用户行为规范</h4>
          <p>1. 用户应遵守国家法律法规，不得发布违法违规信息。</p>
          <p>2. 用户应诚信经营，不得发布虚假信息或进行欺诈行为。</p>
          <p>3. 用户应尊重社区及其他用户的合法权益。</p>
          
          <h4>五、隐私保护</h4>
          <p>平台重视用户隐私保护，将采取合理措施保护用户个人信息安全。未经用户同意，平台不会向第三方披露用户个人信息。</p>
          
          <h4>六、知识产权</h4>
          <p>平台的所有内容，包括但不限于文字、图片、软件、程序等，均受知识产权法律保护。未经授权，用户不得复制、传播或用于商业目的。</p>
          
          <h4>七、免责声明</h4>
          <p>1. 平台不对用户之间的纠纷承担责任。</p>
          <p>2. 因不可抗力导致的服务中断，平台不承担责任。</p>
          <p>3. 用户因违反本协议造成的损失，平台不承担责任。</p>
          
          <h4>八、协议修改</h4>
          <p>平台有权修改本协议，修改后的协议将在平台上公布。继续使用平台服务即表示您同意修改后的协议。</p>
          
          <h4>九、联系方式</h4>
          <p>如有任何问题，请联系平台客服。</p>
        </div>
      </div>
    </van-popup>
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
const showAgreementPopup = ref(false)

const showAgreement = () => {
  showAgreementPopup.value = true
}

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
      }
      showDialog({ message: '验证码已发送' })
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }
  } catch (error) {
    showDialog({ message: error.message || '发送验证码失败' })
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
      user_type: 'merchant' 
    })
    if (res.code === 200) {
      localStorage.setItem('merchant_token', res.data.token)
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
    const message = error.response?.data?.message || error.message || '登录失败'
    showDialog({ message })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  padding: 80px 20px 20px;
}

.header {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 32px;
  color: #fff;
  margin-bottom: 16px;
}

.slogan {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.form {
  background: #fff;
  border-radius: 16px;
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

.footer {
  margin-top: auto;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.agreement-link {
  color: #fff;
  text-decoration: underline;
  cursor: pointer;
}

.agreement-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.agreement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.agreement-header h3 {
  margin: 0;
  font-size: 18px;
}

.agreement-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  line-height: 1.8;
}

.agreement-body h4 {
  margin: 20px 0 10px;
  font-size: 16px;
  color: #333;
}

.agreement-body h4:first-child {
  margin-top: 0;
}

.agreement-body p {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}
</style>
