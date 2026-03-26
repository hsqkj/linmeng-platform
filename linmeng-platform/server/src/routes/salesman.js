const express = require('express')
const router = express.Router()
const { Salesman, MerchantUser, Commission } = require('../models')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/auth')
const checkPermission = require('../middleware/checkPermission')
const CodeGenerator = require('../utils/codeGenerator')
const { verifyCode } = require('../utils/smsCodes')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

router.post('/register', async (req, res) => {
  try {
    const { name, phone, code, password, commission_rate } = req.body
    
    if (!name || !phone || !code || !password) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' })
    }
    
    const verifyResult = verifyCode(phone, code)
    if (!verifyResult.valid) {
      return res.status(400).json({ code: 400, message: verifyResult.message })
    }
    
    const existing = await Salesman.findOne({ where: { phone } })
    if (existing) {
      return res.status(400).json({ code: 400, message: '该手机号已注册' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const salesman_code = await CodeGenerator.generateCode('SALESMAN', 'salesmen', 'salesman_code')
    const channel_code = await CodeGenerator.generateCode('CHANNEL', 'salesmen', 'channel_code')
    const channel_link = `${process.env.MERCHANT_REGISTER_URL || 'http://localhost:5174/register'}?channel_code=${channel_code}`
    
    const salesman = await Salesman.create({
      salesman_code,
      name,
      phone,
      password: hashedPassword,
      channel_code,
      channel_link,
      commission_rate: commission_rate || 10.00,
      status: 1
    })
    
    res.json({
      code: 200,
      message: '注册成功',
      data: {
        id: salesman.id,
        salesman_code: salesman.salesman_code,
        name: salesman.name,
        phone: salesman.phone,
        channel_code: salesman.channel_code,
        channel_link: salesman.channel_link,
        commission_rate: salesman.commission_rate
      }
    })
  } catch (error) {
    console.error('业务员注册错误:', error)
    res.status(500).json({ code: 500, message: '注册失败', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    
    if (!phone || !password) {
      return res.status(400).json({ code: 400, message: '缺少手机号或密码' })
    }
    
    const salesman = await Salesman.findOne({ where: { phone } })
    if (!salesman) {
      return res.status(404).json({ code: 404, message: '该手机号未注册' })
    }
    
    if (salesman.status === 0) {
      return res.status(403).json({ code: 403, message: '账号已被禁用' })
    }
    
    const isMatch = await bcrypt.compare(password, salesman.password)
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: '密码错误' })
    }
    
    const token = jwt.sign(
      { id: salesman.id, role: 'salesman', phone: salesman.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        salesman: {
          id: salesman.id,
          salesman_code: salesman.salesman_code,
          name: salesman.name,
          phone: salesman.phone,
          channel_code: salesman.channel_code,
          channel_link: salesman.channel_link,
          commission_rate: salesman.commission_rate,
          total_commission: salesman.total_commission
        }
      }
    })
  } catch (error) {
    console.error('业务员登录错误:', error)
    res.status(500).json({ code: 500, message: '登录失败' })
  }
})

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'salesman') {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }
    
    const { id } = req.user
    const salesman = await Salesman.findByPk(id, {
      attributes: { exclude: ['password'] }
    })
    
    if (!salesman) {
      return res.status(404).json({ code: 404, message: '业务员不存在' })
    }
    
    res.json({
      code: 200,
      data: salesman
    })
  } catch (error) {
    console.error('获取业务员信息错误:', error)
    res.status(500).json({ code: 500, message: '获取失败' })
  }
})

router.get('/merchants', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'salesman') {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }
    
    const { id } = req.user
    const { page = 1, pageSize = 20 } = req.query
    
    const offset = (page - 1) * pageSize
    const { count, rows } = await MerchantUser.findAndCountAll({
      where: { salesman_id: id },
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      attributes: ['id', 'merchant_code', 'business_name', 'phone', 'industry', 'member_level', 'create_time']
    })
    
    res.json({
      code: 200,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取渠道商户列表错误:', error)
    res.status(500).json({ code: 500, message: '获取失败' })
  }
})

router.get('/commissions', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'salesman') {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }
    
    const { id } = req.user
    const { page = 1, pageSize = 20, status } = req.query
    
    const where = { salesman_id: id }
    if (status !== undefined) {
      where.status = parseInt(status)
    }
    
    const offset = (page - 1) * pageSize
    const { count, rows } = await Commission.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [
        {
          model: MerchantUser,
          as: 'merchant',
          attributes: ['business_name', 'phone']
        }
      ]
    })
    
    res.json({
      code: 200,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取提成记录错误:', error)
    res.status(500).json({ code: 500, message: '获取失败' })
  }
})

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'salesman') {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }
    
    const { id } = req.user
    
    const merchantCount = await MerchantUser.count({
      where: { salesman_id: id }
    })
    
    const totalCommission = await Commission.sum('commission_amount', {
      where: { salesman_id: id, status: 1 }
    }) || 0
    
    const pendingCommission = await Commission.sum('commission_amount', {
      where: { salesman_id: id, status: 0 }
    }) || 0
    
    res.json({
      code: 200,
      data: {
        merchantCount,
        totalCommission,
        pendingCommission
      }
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    res.status(500).json({ code: 500, message: '获取失败' })
  }
})

router.get('/list', checkPermission('salesman_manage'), async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword, status } = req.query
    
    const where = {}
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ]
    }
    if (status !== undefined) {
      where.status = parseInt(status)
    }
    
    const offset = (page - 1) * pageSize
    const { count, rows } = await Salesman.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      attributes: { exclude: ['password'] }
    })
    
    res.json({
      code: 200,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取业务员列表错误:', error)
    res.status(500).json({ code: 500, message: '获取失败' })
  }
})

router.put('/:id/status', checkPermission('salesman_manage'), async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    await Salesman.update({ status }, { where: { id } })
    
    res.json({
      code: 200,
      message: '状态更新成功'
    })
  } catch (error) {
    console.error('更新业务员状态错误:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

router.put('/:id/commission-rate', checkPermission('salesman_manage'), async (req, res) => {
  try {
    const { id } = req.params
    const { commission_rate } = req.body
    
    await Salesman.update({ commission_rate }, { where: { id } })
    
    res.json({
      code: 200,
      message: '提成比例更新成功'
    })
  } catch (error) {
    console.error('更新提成比例错误:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

router.get('/channel/:channel_code', async (req, res) => {
  try {
    const { channel_code } = req.params
    
    const salesman = await Salesman.findOne({
      where: { channel_code, status: 1 },
      attributes: ['id', 'name', 'channel_code']
    })
    
    if (!salesman) {
      return res.status(404).json({ code: 404, message: '渠道码无效' })
    }
    
    res.json({
      code: 200,
      data: salesman
    })
  } catch (error) {
    console.error('验证渠道码错误:', error)
    res.status(500).json({ code: 500, message: '验证失败' })
  }
})

module.exports = router
