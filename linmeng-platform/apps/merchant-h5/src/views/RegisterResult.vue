<template>
  <div class="register-result">
    <div class="result-content">
      <van-icon name="passed" size="80" color="#07c160" />
      <h2>注册申请已提交</h2>
      <p class="desc">您的注册申请已成功提交，我们将在1-3个工作日内完成审核。</p>
      <p class="desc">审核通过后，您即可登录查看社区活动并参与合作。</p>
      <p class="tip">感谢您的支持！</p>
      
      <div class="btn-group">
        <van-button type="primary" block round @click="goLogin">
          返回登录
        </van-button>
      </div>
      
      <div class="contact-info">
        <p>如有疑问，请联系客服</p>
        <p>电话：400-123-4567</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-result {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.result-content {
  text-align: center;
  background: #fff;
  border-radius: 12px;
  padding: 40px 20px;
  max-width: 400px;
  width: 100%;
}

.result-content h2 {
  margin: 20px 0 10px;
  font-size: 22px;
  color: #333;
}

.result-content .desc {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 5px 0;
}

.result-content .tip {
  font-size: 14px;
  color: #1989fa;
  margin-top: 15px;
}

.btn-group {
  margin-top: 30px;
}

.contact-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.contact-info p {
  font-size: 12px;
  color: #999;
  margin: 5px 0;
}
</style>
