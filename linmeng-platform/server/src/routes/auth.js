const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { CommunityUser, MerchantUser, AdminUser } = require('../models')
const authMiddleware = require('../middleware/auth')
const { generateCode, verifyCode } = require('../utils/smsCodes')

const JWT_SECRET = process.env.JWT_SECRET || 'linmeng_jwt_secret_key_2024'

router.post('/send-sms', async (req, res) => {
  try {
    const { phone } = req.body
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 400, message: '请输入正确的手机号' })
    }
    
    const code = generateCode(phone)
    
    console.log(`[短信验证码] 手机号: ${phone}, 验证码: ${code}`)
    
    res.json({
      code: 200,
      message: '验证码已发送',
      data: {
        code
      }
    })
  } catch (error) {
    console.error('发送验证码错误:', error)
    res.status(500).json({ code: 500, message: '发送验证码失败' })
  }
})

router.post('/verify-sms', async (req, res) => {
  try {
    const { phone, code } = req.body
    
    const result = verifyCode(phone, code)
    if (!result.valid) {
      return res.status(400).json({ code: 400, message: result.message })
    }
    
    res.json({
      code: 200,
      message: '验证成功'
    })
  } catch (error) {
    console.error('验证码验证错误:', error)
    res.status(500).json({ code: 500, message: '验证失败' })
  }
})

router.post('/login', async (req, res) => {
  console.log('[登录请求]', req.body)
  try {
    const { phone, sms_code, user_type, username, password } = req.body
    
    console.log('[登录参数]', { phone, sms_code, user_type, username, password })
    
    if (username && password) {
      const admin = await AdminUser.findOne({ where: { username } })
      if (!admin) {
        return res.status(400).json({ code: 400, message: '用户名或密码错误' })
      }
      
      const isValid = await bcrypt.compare(password, admin.password)
      if (!isValid) {
        return res.status(400).json({ code: 400, message: '用户名或密码错误' })
      }
      
      if (admin.status !== 1) {
        return res.status(400).json({ code: 400, message: '账号已被禁用' })
      }
      
      const token = jwt.sign({ id: admin.id, type: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
      
      return res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            id: admin.id,
            username: admin.username,
            real_name: admin.real_name,
            type: 'admin'
          }
        }
      })
    }
    
    if (!phone || !sms_code) {
      return res.status(400).json({ code: 400, message: '请输入手机号和验证码' })
    }

    console.log('验证验证码...')
    const verifyResult = verifyCode(phone, sms_code)
    console.log('验证结果:', verifyResult)
    if (!verifyResult.valid) {
      return res.status(400).json({ code: 400, message: verifyResult.message })
    }

    let user = null
    let token = null
    
    console.log('查询用户...', user_type)
    if (user_type === 'community') {
      user = await CommunityUser.findOne({ where: { phone } })
      console.log('查询到的用户:', user ? user.id : 'not found')
      if (!user) {
        return res.status(400).json({ code: 400, message: '账号不存在' })
      }
      token = jwt.sign({ id: user.id, type: 'community' }, JWT_SECRET, { expiresIn: '7d' })
    } else if (user_type === 'merchant') {
      user = await MerchantUser.findOne({ where: { phone } })
      console.log('查询到的用户:', user ? user.id : 'not found')
      if (!user) {
        return res.status(400).json({ code: 400, message: '账号不存在' })
      }
      token = jwt.sign({ id: user.id, type: 'merchant' }, JWT_SECRET, { expiresIn: '7d' })
    } else {
      return res.status(400).json({ code: 400, message: '无效的用户类型' })
    }

    console.log('生成token:', token ? 'success' : 'failed')
    const responseData = {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          status: user.status,
          is_new: !user.community_name && !user.business_name
        }
      }
    }
    console.log('返回响应:', responseData)
    res.json(responseData)
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ code: 500, message: '登录失败', error: error.message })
  }
})

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    
    let user = null
    if (type === 'community') {
      user = await CommunityUser.findByPk(id, {
        attributes: { exclude: ['openid'] }
      })
    } else if (type === 'merchant') {
      user = await MerchantUser.findByPk(id, {
        attributes: { exclude: ['openid'] }
      })
    }

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }

    res.json({ code: 200, data: user })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ code: 500, message: '获取用户信息失败' })
  }
})

router.post('/wechat-login', async (req, res) => {
  try {
    const { code, user_type } = req.body
    
    res.json({
      code: 200,
      message: '微信登录功能开发中'
    })
  } catch (error) {
    console.error('微信登录错误:', error)
    res.status(500).json({ code: 500, message: '微信登录失败' })
  }
})

module.exports = router
