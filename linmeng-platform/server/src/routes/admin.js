const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { CommunityUser, MerchantUser, Activity, Cooperation, Order, AdminUser } = require('../models')
const { Op } = require('sequelize')
const authMiddleware = require('../middleware/auth')

const JWT_SECRET = process.env.JWT_SECRET || 'linmeng_jwt_secret_key_2024'

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    
    if (!phone || !password) {
      return res.status(400).json({ code: 400, message: '请输入手机号和密码' })
    }

    const admin = await AdminUser.findOne({ where: { phone } })
    
    if (!admin) {
      return res.status(401).json({ code: 401, message: '手机号或密码错误' })
    }

    if (admin.status !== 1) {
      return res.status(401).json({ code: 401, message: '账户已被禁用' })
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ code: 401, message: '手机号或密码错误' })
    }

    await admin.update({ last_login_time: new Date() })

    const token = jwt.sign(
      { id: admin.id, phone: admin.phone, role: admin.role, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: admin.id,
          phone: admin.phone,
          real_name: admin.real_name,
          role: admin.role,
          permissions: admin.permissions
        }
      }
    })
  } catch (error) {
    console.error('管理员登录错误:', error)
    res.status(500).json({ code: 500, message: '登录失败' })
  }
})

router.get('/statistics', authMiddleware, async (req, res) => {
  try {
    const totalCommunities = await CommunityUser.count()
    const totalMerchants = await MerchantUser.count()
    const totalActivities = await Activity.count()
    const completedCooperations = await Cooperation.count({ where: { status: 3 } })
    
    const pendingCommunities = await CommunityUser.count({ where: { status: 0 } })
    const pendingMerchants = await MerchantUser.count({ where: { status: 0 } })
    const pendingActivities = await Activity.count({ where: { status: 0 } })

    const now = new Date()
    const recruitingActivities = await Activity.count({
      where: {
        status: 1,
        end_time: {
          [Op.gt]: now
        }
      }
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayActivities = await Activity.count({
      where: {
        create_time: {
          [Op.gte]: today
        }
      }
    })
    
    const todayCooperations = await Cooperation.count({
      where: {
        create_time: {
          [Op.gte]: today
        }
      }
    })

    const totalOrders = await Order.count()
    const totalRevenue = await Order.sum('amount', { where: { pay_status: 1 } }) || 0

    res.json({
      code: 200,
      data: {
        totalCommunities,
        totalMerchants,
        totalActivities,
        completedCooperations,
        pendingCommunities,
        pendingMerchants,
        pendingActivities,
        recruitingActivities,
        todayActivities,
        todayCooperations,
        totalOrders,
        totalRevenue
      }
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    res.status(500).json({ code: 500, message: '获取统计数据失败' })
  }
})

router.get('/community/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query
    
    const where = {}
    
    if (keyword) {
      where[Op.or] = [
        { community_name: { [Op.like]: `%${keyword}%` } },
        { contact_name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ]
    }
    
    if (status !== undefined && status !== '') {
      where.status = parseInt(status)
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await CommunityUser.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      attributes: { exclude: ['openid'] }
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
    console.error('获取社区列表错误:', error)
    res.status(500).json({ code: 500, message: '获取社区列表失败' })
  }
})

router.put('/community/audit/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body
    
    const community = await CommunityUser.findByPk(id)
    if (!community) {
      return res.status(404).json({ code: 404, message: '社区不存在' })
    }

    await community.update({ status })

    res.json({
      code: 200,
      message: status === 1 ? '审核通过' : '审核驳回',
      data: community
    })
  } catch (error) {
    console.error('审核社区错误:', error)
    res.status(500).json({ code: 500, message: '审核失败' })
  }
})

router.delete('/community/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.user
    
    if (role !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '无权限删除，仅超级管理员可执行此操作' })
    }

    const community = await CommunityUser.findByPk(id)
    if (!community) {
      return res.status(404).json({ code: 404, message: '社区不存在' })
    }

    await community.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除社区错误:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

router.get('/merchant/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, member_level } = req.query
    
    const where = {}
    
    if (keyword) {
      where[Op.or] = [
        { business_name: { [Op.like]: `%${keyword}%` } },
        { contact_name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ]
    }
    
    if (status !== undefined && status !== '') {
      where.status = parseInt(status)
    }
    
    if (member_level !== undefined && member_level !== '') {
      where.member_level = parseInt(member_level)
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await MerchantUser.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      attributes: { exclude: ['openid'] }
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
    console.error('获取商家列表错误:', error)
    res.status(500).json({ code: 500, message: '获取商家列表失败' })
  }
})

router.put('/merchant/audit/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body
    
    const merchant = await MerchantUser.findByPk(id)
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家不存在' })
    }

    await merchant.update({ status })

    res.json({
      code: 200,
      message: status === 1 ? '审核通过' : '审核驳回',
      data: merchant
    })
  } catch (error) {
    console.error('审核商家错误:', error)
    res.status(500).json({ code: 500, message: '审核失败' })
  }
})

router.delete('/merchant/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.user
    
    if (role !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '无权限删除，仅超级管理员可执行此操作' })
    }

    const merchant = await MerchantUser.findByPk(id)
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家不存在' })
    }

    await merchant.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除商家错误:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

router.put('/merchant/update/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { member_level, member_expire_time, star_rating } = req.body
    
    const merchant = await MerchantUser.findByPk(id)
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家不存在' })
    }

    const updateData = {}
    if (member_level !== undefined) {
      updateData.member_level = member_level
      
      const quotaMap = {
        0: 0,
        1: 2,
        2: 4,
        3: 999
      }
      updateData.monthly_quota = quotaMap[member_level] || 0
      updateData.used_quota = 0
    }
    if (member_expire_time !== undefined) updateData.member_expire_time = member_expire_time
    if (star_rating !== undefined) updateData.star_rating = star_rating

    await merchant.update(updateData)

    res.json({
      code: 200,
      message: '更新成功',
      data: merchant
    })
  } catch (error) {
    console.error('更新商家错误:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

router.get('/merchant/sponsor/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    const cooperations = await Cooperation.findAll({
      where: { merchant_id: id },
      include: [{
        model: Activity,
        as: 'activity',
        attributes: ['id', 'title', 'demand_type', 'status']
      }],
      order: [['create_time', 'DESC']]
    })

    res.json({
      code: 200,
      data: cooperations
    })
  } catch (error) {
    console.error('获取商家赞助列表错误:', error)
    res.status(500).json({ code: 500, message: '获取列表失败' })
  }
})

router.get('/activity/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query
    
    const where = {}
    
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` }
    }
    
    if (status !== undefined && status !== '') {
      where.status = parseInt(status)
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await Activity.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [{
        model: CommunityUser,
        as: 'community',
        attributes: ['community_name']
      }]
    })

    const list = rows.map(item => ({
      ...item.toJSON(),
      community_name: item.community?.community_name
    }))

    res.json({
      code: 200,
      data: {
        list,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取活动列表错误:', error)
    res.status(500).json({ code: 500, message: '获取活动列表失败' })
  }
})

router.put('/activity/audit/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body
    
    const activity = await Activity.findByPk(id)
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }

    await activity.update({ status })

    res.json({
      code: 200,
      message: status === 1 ? '审核通过' : '审核驳回',
      data: activity
    })
  } catch (error) {
    console.error('审核活动错误:', error)
    res.status(500).json({ code: 500, message: '审核失败' })
  }
})

router.put('/activity/update/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const activity = await Activity.findByPk(id)
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }

    updateData.update_time = new Date()
    await activity.update(updateData)

    res.json({
      code: 200,
      message: '更新成功',
      data: activity
    })
  } catch (error) {
    console.error('更新活动错误:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

router.put('/activity/supplement/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const activity = await Activity.findByPk(id)
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }

    updateData.update_time = new Date()
    await activity.update(updateData)

    res.json({
      code: 200,
      message: '补充成功',
      data: activity
    })
  } catch (error) {
    console.error('补充活动错误:', error)
    res.status(500).json({ code: 500, message: '补充失败' })
  }
})

router.delete('/activity/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.user
    
    if (role !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '无权限删除，仅超级管理员可执行此操作' })
    }

    const activity = await Activity.findByPk(id)
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }

    await activity.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除活动错误:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

router.get('/order/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, pay_status, order_type } = req.query
    
    const where = {}
    
    if (keyword) {
      where.order_code = { [Op.like]: `%${keyword}%` }
    }
    
    if (pay_status !== undefined && pay_status !== '') {
      where.pay_status = parseInt(pay_status)
    }
    
    if (order_type !== undefined && order_type !== '') {
      where.order_type = parseInt(order_type)
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await Order.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [{
        model: MerchantUser,
        as: 'business',
        attributes: ['business_name', 'phone']
      }]
    })

    const list = rows.map(item => ({
      ...item.toJSON(),
      business_name: item.business?.business_name,
      business_phone: item.business?.phone
    }))

    res.json({
      code: 200,
      data: {
        list,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取订单列表错误:', error)
    res.status(500).json({ code: 500, message: '获取订单列表失败' })
  }
})

router.get('/admin/list', authMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user
    
    if (role !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }

    const { page = 1, pageSize = 10, keyword, role: roleFilter, status } = req.query
    
    const where = {}
    
    if (keyword) {
      where[Op.or] = [
        { real_name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ]
    }
    
    if (roleFilter) {
      where.role = roleFilter
    }
    
    if (status !== undefined && status !== '') {
      where.status = parseInt(status)
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await AdminUser.findAndCountAll({
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
    console.error('获取管理员列表错误:', error)
    res.status(500).json({ code: 500, message: '获取管理员列表失败' })
  }
})

router.post('/admin/create', authMiddleware, async (req, res) => {
  try {
    const { role: creatorRole } = req.user
    
    if (creatorRole !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }

    const { phone, password, real_name, role, permissions } = req.body
    
    if (!phone || !password || !real_name) {
      return res.status(400).json({ code: 400, message: '请填写必填信息' })
    }

    const existAdmin = await AdminUser.findOne({ where: { phone } })
    if (existAdmin) {
      return res.status(400).json({ code: 400, message: '该手机号已存在' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await AdminUser.create({
      phone,
      password: hashedPassword,
      real_name,
      role: role || 'normal_admin',
      permissions: permissions || [],
      status: 1
    })

    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: admin.id,
        phone: admin.phone,
        real_name: admin.real_name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('创建管理员错误:', error)
    res.status(500).json({ code: 500, message: '创建失败' })
  }
})

router.put('/admin/update/:id', authMiddleware, async (req, res) => {
  try {
    const { role: updaterRole } = req.user
    
    if (updaterRole !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }

    const { id } = req.params
    const { real_name, role, permissions, status, password } = req.body
    
    const admin = await AdminUser.findByPk(id)
    if (!admin) {
      return res.status(404).json({ code: 404, message: '管理员不存在' })
    }

    const updateData = {}
    if (real_name) updateData.real_name = real_name
    if (role) updateData.role = role
    if (permissions) updateData.permissions = permissions
    if (status !== undefined) updateData.status = status
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await admin.update(updateData)

    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: admin.id,
        phone: admin.phone,
        real_name: admin.real_name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('更新管理员错误:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

router.delete('/admin/delete/:id', authMiddleware, async (req, res) => {
  try {
    const { role: deleterRole, id: currentId } = req.user
    
    if (deleterRole !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }

    const { id } = req.params
    
    if (parseInt(id) === currentId) {
      return res.status(400).json({ code: 400, message: '不能删除自己' })
    }

    const admin = await AdminUser.findByPk(id)
    if (!admin) {
      return res.status(404).json({ code: 404, message: '管理员不存在' })
    }

    if (admin.role === 'super_admin') {
      const superAdminCount = await AdminUser.count({ where: { role: 'super_admin' } })
      if (superAdminCount <= 1) {
        return res.status(400).json({ code: 400, message: '不能删除最后一个超级管理员' })
      }
    }

    await admin.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除管理员错误:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

router.put('/admin/reset-password/:id', authMiddleware, async (req, res) => {
  try {
    const { role: resetterRole } = req.user
    
    if (resetterRole !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '无权限访问' })
    }

    const { id } = req.params
    const { password } = req.body
    
    if (!password) {
      return res.status(400).json({ code: 400, message: '请输入新密码' })
    }

    const admin = await AdminUser.findByPk(id)
    if (!admin) {
      return res.status(404).json({ code: 404, message: '管理员不存在' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await admin.update({ password: hashedPassword })

    res.json({
      code: 200,
      message: '密码重置成功'
    })
  } catch (error) {
    console.error('重置密码错误:', error)
    res.status(500).json({ code: 500, message: '重置失败' })
  }
})

router.get('/cooperation/list/:activityId', authMiddleware, async (req, res) => {
  try {
    const { activityId } = req.params
    
    const cooperations = await Cooperation.findAll({
      where: { activity_id: activityId },
      include: [{
        model: MerchantUser,
        as: 'merchant',
        attributes: ['id', 'business_name', 'logo']
      }],
      order: [['create_time', 'DESC']]
    })

    res.json({
      code: 200,
      data: cooperations
    })
  } catch (error) {
    console.error('获取合作列表错误:', error)
    res.status(500).json({ code: 500, message: '获取列表失败' })
  }
})

router.put('/cooperation/audit/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status, reject_reason } = req.body
    
    const cooperation = await Cooperation.findByPk(id)
    if (!cooperation) {
      return res.status(404).json({ code: 404, message: '合作记录不存在' })
    }

    await cooperation.update({
      status,
      reject_reason,
      confirm_time: new Date()
    })

    res.json({
      code: 200,
      message: status === 1 ? '已通过' : '已拒绝',
      data: cooperation
    })
  } catch (error) {
    console.error('审核合作错误:', error)
    res.status(500).json({ code: 500, message: '审核失败' })
  }
})

router.get('/sponsor/list', authMiddleware, async (req, res) => {
  try {
    const SponsorInfo = require('../models/SponsorInfo')
    const { page = 1, pageSize = 10, keyword } = req.query
    
    const where = {}
    
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` }
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await SponsorInfo.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [{
        model: MerchantUser,
        as: 'merchant',
        attributes: ['business_name']
      }]
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
    console.error('获取赞助列表错误:', error)
    res.status(500).json({ code: 500, message: '获取列表失败' })
  }
})

router.delete('/sponsor/delete/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.user
    
    if (role !== 'super_admin') {
      return res.status(403).json({ code: 403, message: '无权限删除，仅超级管理员可执行此操作' })
    }

    const SponsorInfo = require('../models/SponsorInfo')
    const sponsor = await SponsorInfo.findByPk(id)
    if (!sponsor) {
      return res.status(404).json({ code: 404, message: '赞助信息不存在' })
    }

    await sponsor.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除赞助错误:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

module.exports = router
