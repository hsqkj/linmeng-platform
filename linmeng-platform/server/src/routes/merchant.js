const express = require('express')
const router = express.Router()
const { MerchantUser, Activity, Cooperation, Evaluate, MemberPackage, Order, CommunityUser } = require('../models')
const authMiddleware = require('../middleware/auth')
const { Op } = require('sequelize')
const { verifyCode } = require('../utils/smsCodes')
const CodeGenerator = require('../utils/codeGenerator')
const MatchingAlgorithm = require('../utils/matchingAlgorithm')

router.post('/register-new', async (req, res) => {
  try {
    const { phone, sms_code, business_name, contact_name, industry, address, latitude, longitude, logo, description, sponsor_types, sponsor_detail, return_expect, target_crowd, license_img } = req.body
    
    if (!phone || !sms_code) {
      return res.status(400).json({ code: 400, message: '请输入手机号和验证码' })
    }
    
    const verifyResult = verifyCode(phone, sms_code)
    if (!verifyResult.valid) {
      return res.status(400).json({ code: 400, message: verifyResult.message })
    }
    
    if (!business_name || !contact_name || !industry || !address) {
      return res.status(400).json({ code: 400, message: '请填写必填信息' })
    }
    
    const existUser = await MerchantUser.findOne({ where: { phone } })
    if (existUser) {
      return res.status(400).json({ code: 400, message: '该手机号已注册' })
    }
    
    const merchant_code = await CodeGenerator.generateMerchantCode()
    
    const user = await MerchantUser.create({
      phone,
      merchant_code,
      business_name,
      contact_name,
      industry,
      address,
      latitude,
      longitude,
      logo,
      description,
      sponsor_types: sponsor_types ? JSON.stringify(sponsor_types) : null,
      sponsor_detail: sponsor_detail ? JSON.stringify(sponsor_detail) : null,
      return_expect: return_expect ? JSON.stringify(return_expect) : null,
      target_crowd: target_crowd ? JSON.stringify(target_crowd) : null,
      license_img,
      status: 0
    })

    res.json({
      code: 200,
      message: '注册成功，请等待审核',
      data: {
        id: user.id,
        merchant_code: user.merchant_code,
        phone: user.phone,
        business_name: user.business_name,
        status: user.status
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ code: 500, message: '注册失败', error: error.message })
  }
})

router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const updateData = req.body
    
    const user = await MerchantUser.findByPk(id)
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }

    await user.update({
      ...updateData,
      status: 0
    })

    res.json({
      code: 200,
      message: '提交成功，请等待审核',
      data: user
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ code: 500, message: '提交失败', error: error.message })
  }
})

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    
    const user = await MerchantUser.findByPk(id, {
      attributes: { exclude: ['openid'] }
    })

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }

    res.json({ code: 200, data: user })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ code: 500, message: '获取用户信息失败' })
  }
})

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const updateData = req.body
    
    const user = await MerchantUser.findByPk(id)
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }

    await user.update(updateData)

    res.json({
      code: 200,
      message: '更新成功',
      data: user
    })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    
    const totalCooperations = await Cooperation.count({ where: { merchant_id: id } })
    const completedCooperations = await Cooperation.count({
      where: { merchant_id: id, status: 3 }
    })

    res.json({
      code: 200,
      data: {
        totalCooperations,
        completedCooperations
      }
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    res.status(500).json({ code: 500, message: '获取统计数据失败' })
  }
})

router.get('/activities', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, demand_type, community_id, crowd, sort, match_min } = req.query
    const merchantId = req.user.id
    
    const merchant = await MerchantUser.findByPk(merchantId, {
      attributes: ['id', 'sponsor_types', 'target_crowd', 'industry', 'tags', 'custom_tags', 'latitude', 'longitude', 'member_level', 'star_rating']
    })
    
    const where = { status: 1 }
    
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` }
    }
    
    if (demand_type) {
      where.demand_type = demand_type
    }
    
    if (community_id) {
      where.community_id = community_id
    }
    
    if (crowd) {
      where.target_crowd = { [Op.like]: `%${crowd}%` }
    }

    let order = [['create_time', 'DESC']]
    if (sort === '1') {
      order = [['start_time', 'ASC']]
    } else if (sort === '2') {
      order = [['expected_count', 'DESC']]
    } else if (sort === '3') {
      order = [['view_count', 'DESC']]
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await Activity.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order,
      include: [{
        model: CommunityUser,
        as: 'community',
        attributes: ['id', 'community_name', 'latitude', 'longitude', 'elderly_ratio', 'youth_family_ratio', 'total_households']
      }]
    })

    const { DemandFavorite, TagLibrary } = require('../models')
    
    const favorites = await DemandFavorite.findAll({
      where: { merchant_id: merchantId },
      attributes: ['activity_id']
    })
    const favoriteIds = favorites.map(f => f.activity_id)

    const allTagIds = new Set()
    rows.forEach(item => {
      if (item.tags) {
        try {
          const tagIds = JSON.parse(item.tags)
          if (Array.isArray(tagIds)) {
            tagIds.forEach(id => allTagIds.add(id))
          }
        } catch (e) {}
      }
    })

    const tags = await TagLibrary.findAll({
      where: { id: { [Op.in]: Array.from(allTagIds) } },
      attributes: ['id', 'name']
    })
    const tagMap = {}
    tags.forEach(tag => {
      tagMap[tag.id] = tag.name
    })

    let list = rows.map(item => {
      const matchResult = MatchingAlgorithm.calculateMatchScore(merchant, item, item.community)
      let tagNames = []
      if (item.tags) {
        try {
          const tagIds = JSON.parse(item.tags)
          if (Array.isArray(tagIds)) {
            tagNames = tagIds.map(id => tagMap[id]).filter(name => name)
          }
        } catch (e) {}
      }
      return {
        ...item.toJSON(),
        community_name: item.community?.community_name,
        community_id: item.community?.id,
        match_score: matchResult.score,
        match_hearts: matchResult.hearts,
        is_favorited: favoriteIds.includes(item.id),
        tag_names: tagNames
      }
    })

    if (match_min) {
      const minScore = parseInt(match_min)
      list = list.filter(item => item.match_score >= minScore)
    }

    if (sort === '0' || sort === '4') {
      list.sort((a, b) => {
        if (b.match_score !== a.match_score) {
          return b.match_score - a.match_score
        }
        return new Date(b.create_time) - new Date(a.create_time)
      })
    }

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
    console.error('获取需求列表错误:', error)
    res.status(500).json({ code: 500, message: '获取需求列表失败' })
  }
})

router.get('/activity/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    const activity = await Activity.findByPk(id, {
      include: [{
        model: CommunityUser,
        as: 'community',
        attributes: ['id', 'community_name', 'contact_name', 'phone']
      }]
    })

    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }

    res.json({
      code: 200,
      data: {
        ...activity.toJSON(),
        community_id: activity.community_id,
        community_name: activity.community?.community_name
      }
    })
  } catch (error) {
    console.error('获取活动详情错误:', error)
    res.status(500).json({ code: 500, message: '获取活动详情失败' })
  }
})

router.post('/apply/:activityId', authMiddleware, async (req, res) => {
  try {
    const { id: merchantId } = req.user
    const { activityId } = req.params
    const { sponsor_type, sponsor_detail, images } = req.body
    
    const activity = await Activity.findByPk(activityId)
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }

    const existing = await Cooperation.findOne({
      where: { activity_id: activityId, merchant_id: merchantId }
    })
    
    if (existing) {
      return res.status(400).json({ code: 400, message: '您已报名该活动' })
    }

    const cooperation_code = await CodeGenerator.generateCooperationCode()

    const cooperation = await Cooperation.create({
      cooperation_code,
      activity_id: activityId,
      merchant_id: merchantId,
      community_id: activity.community_id,
      sponsor_type,
      sponsor_detail,
      status: 0
    })

    res.json({
      code: 200,
      message: '报名成功',
      data: cooperation
    })
  } catch (error) {
    console.error('报名错误:', error)
    res.status(500).json({ code: 500, message: '报名失败' })
  }
})

router.get('/cooperations', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const { page = 1, pageSize = 10, status } = req.query
    
    const where = { merchant_id: id }
    if (status !== undefined) {
      where.status = status
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await Cooperation.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [{
        model: Activity,
        as: 'activity',
        attributes: ['title', 'start_time', 'end_time', 'location']
      }, {
        model: CommunityUser,
        as: 'communityInfo',
        attributes: ['community_name']
      }]
    })

    const list = rows.map(item => ({
      ...item.toJSON(),
      activity_title: item.activity?.title,
      activity_time: item.activity?.start_time,
      activity_location: item.activity?.location,
      community_name: item.communityInfo?.community_name
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
    console.error('获取合作列表错误:', error)
    res.status(500).json({ code: 500, message: '获取合作列表失败' })
  }
})

router.get('/cooperation/:id', authMiddleware, async (req, res) => {
  try {
    const { id: merchantId } = req.user
    const { id } = req.params
    
    const cooperation = await Cooperation.findOne({
      where: { id, merchant_id: merchantId },
      include: [
        {
          model: Activity,
          as: 'activity',
          attributes: ['title', 'start_time', 'end_time', 'location', 'expected_count']
        },
        {
          model: CommunityUser,
          as: 'communityInfo',
          attributes: ['community_name', 'contact_name', 'phone']
        }
      ]
    })

    if (!cooperation) {
      return res.status(404).json({ code: 404, message: '合作记录不存在' })
    }

    res.json({ code: 200, data: cooperation })
  } catch (error) {
    console.error('获取合作详情错误:', error)
    res.status(500).json({ code: 500, message: '获取合作详情失败' })
  }
})

router.delete('/cooperation/:id', authMiddleware, async (req, res) => {
  try {
    const { id: merchantId } = req.user
    const { id } = req.params
    
    const cooperation = await Cooperation.findOne({
      where: { id, merchant_id: merchantId }
    })

    if (!cooperation) {
      return res.status(404).json({ code: 404, message: '合作记录不存在' })
    }

    if (cooperation.status !== 0) {
      return res.status(400).json({ code: 400, message: '只能取消待确认的报名' })
    }

    await cooperation.destroy()

    res.json({ code: 200, message: '已取消报名' })
  } catch (error) {
    console.error('取消报名错误:', error)
    res.status(500).json({ code: 500, message: '取消失败' })
  }
})

router.get('/member-packages', async (req, res) => {
  try {
    const packages = await MemberPackage.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']]
    })

    res.json({ code: 200, data: packages })
  } catch (error) {
    console.error('获取会员套餐错误:', error)
    res.status(500).json({ code: 500, message: '获取会员套餐失败' })
  }
})

router.post('/order', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const { package_id } = req.body
    
    const pkg = await MemberPackage.findByPk(package_id)
    if (!pkg) {
      return res.status(404).json({ code: 404, message: '套餐不存在' })
    }

    const order_code = await CodeGenerator.generateOrderNo()
    
    const order = await Order.create({
      business_id: id,
      order_type: 0,
      order_name: pkg.name,
      amount: pkg.price,
      order_code: order_code,
      pay_status: 0
    })

    res.json({
      code: 200,
      message: '订单创建成功',
      data: order
    })
  } catch (error) {
    console.error('创建订单错误:', error)
    res.status(500).json({ code: 500, message: '创建订单失败' })
  }
})

router.post('/order/pay-success/:orderCode', async (req, res) => {
  try {
    const { orderCode } = req.params
    
    const order = await Order.findOne({ where: { order_code: orderCode } })
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' })
    }
    
    if (order.pay_status === 1) {
      return res.json({ code: 200, message: '订单已支付' })
    }
    
    const merchant = await MerchantUser.findByPk(order.business_id)
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家不存在' })
    }
    
    const pkg = await MemberPackage.findOne({ where: { name: order.order_name } })
    if (!pkg) {
      return res.status(404).json({ code: 404, message: '套餐不存在' })
    }
    
    let memberLevel = 1
    if (pkg.name.includes('金卡')) memberLevel = 2
    else if (pkg.name.includes('钻石')) memberLevel = 3
    
    const expireDate = new Date()
    expireDate.setDate(expireDate.getDate() + pkg.duration)
    
    const quotaMap = {
      0: 0,
      1: 2,
      2: 4,
      3: 999
    }
    
    await merchant.update({
      member_level: memberLevel,
      member_expire: expireDate,
      monthly_quota: quotaMap[memberLevel] || 0,
      used_quota: 0
    })
    
    await order.update({ pay_status: 1 })
    
    res.json({
      code: 200,
      message: '支付成功，会员已开通'
    })
  } catch (error) {
    console.error('支付回调错误:', error)
    res.status(500).json({ code: 500, message: '支付回调失败' })
  }
})

router.get('/evaluates', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const { page = 1, pageSize = 10 } = req.query
    
    const offset = (page - 1) * pageSize
    const { count, rows } = await Evaluate.findAndCountAll({
      where: { business_id: id },
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [{
        model: CommunityUser,
        as: 'communityInfo',
        attributes: ['community_name']
      }, {
        model: Activity,
        as: 'activity',
        attributes: ['title']
      }]
    })

    const list = rows.map(item => ({
      ...item.toJSON(),
      community_name: item.communityInfo?.community_name,
      activity_title: item.activity?.title
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
    console.error('获取评价列表错误:', error)
    res.status(500).json({ code: 500, message: '获取评价列表失败' })
  }
})

router.get('/community/:id', authMiddleware, async (req, res) => {
  try {
    const { id: merchantId } = req.user
    const { id } = req.params
    
    const merchant = await MerchantUser.findByPk(merchantId)
    if (!merchant) {
      return res.status(404).json({ code: 404, message: '商家不存在' })
    }
    
    const isMember = merchant.member_level > 0 && 
                     merchant.member_expire && 
                     new Date(merchant.member_expire) > new Date()
    
    const community = await CommunityUser.findByPk(id)
    if (!community) {
      return res.status(404).json({ code: 404, message: '社区不存在' })
    }

    let communityData = {
      id: community.id,
      community_name: community.community_name,
      status: community.status
    }
    
    if (isMember) {
      communityData = {
        ...communityData,
        contact_name: community.contact_name,
        phone: community.phone,
        district: community.district,
        street: community.street,
        address: community.address,
        latitude: community.latitude,
        longitude: community.longitude,
        total_households: community.total_households,
        elderly_ratio: community.elderly_ratio,
        youth_family_ratio: community.youth_family_ratio,
        public_space_area: community.public_space_area,
        residential_areas: community.residential_areas,
        nearby_merchants: community.nearby_merchants
      }
    }

    res.json({ 
      code: 200, 
      data: {
        ...communityData,
        is_member: isMember
      }
    })
  } catch (error) {
    console.error('获取社区信息错误:', error)
    res.status(500).json({ code: 500, message: '获取社区信息失败' })
  }
})

router.post('/activity/:id/favorite', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const merchantId = req.user.id
    const { DemandFavorite } = require('../models')
    
    const existing = await DemandFavorite.findOne({
      where: { merchant_id: merchantId, activity_id: id }
    })
    
    if (existing) {
      await existing.destroy()
      res.json({ code: 200, message: '取消收藏成功', data: { is_favorited: false } })
    } else {
      await DemandFavorite.create({
        merchant_id: merchantId,
        activity_id: id
      })
      res.json({ code: 200, message: '收藏成功', data: { is_favorited: true } })
    }
  } catch (error) {
    console.error('收藏操作错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.post('/activity/:id/view', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    const activity = await Activity.findByPk(id)
    if (!activity) {
      return res.status(404).json({ code: 404, message: '需求不存在' })
    }
    
    await activity.increment('view_count')
    
    res.json({ code: 200, message: '关注量+1' })
  } catch (error) {
    console.error('增加关注量错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.get('/communities', authMiddleware, async (req, res) => {
  try {
    const { CommunityUser } = require('../models')
    
    const communities = await CommunityUser.findAll({
      where: { status: 1 },
      attributes: ['id', 'community_name'],
      order: [['community_name', 'ASC']]
    })
    
    res.json({ code: 200, data: communities })
  } catch (error) {
    console.error('获取社区列表错误:', error)
    res.status(500).json({ code: 500, message: '获取社区列表失败' })
  }
})

router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const merchantId = req.user.id
    const { DemandFavorite } = require('../models')
    
    const favorites = await DemandFavorite.findAll({
      where: { merchant_id: merchantId },
      include: [{
        model: Activity,
        as: 'activity',
        include: [{
          model: CommunityUser,
          as: 'community',
          attributes: ['id', 'community_name']
        }]
      }],
      order: [['create_time', 'DESC']]
    })
    
    const list = favorites.map(f => ({
      ...f.activity.toJSON(),
      community_name: f.activity.community?.community_name,
      community_id: f.activity.community?.id,
      is_favorited: true,
      favorite_time: f.create_time
    }))
    
    res.json({ code: 200, data: list })
  } catch (error) {
    console.error('获取收藏列表错误:', error)
    res.status(500).json({ code: 500, message: '获取收藏列表失败' })
  }
})

module.exports = router
