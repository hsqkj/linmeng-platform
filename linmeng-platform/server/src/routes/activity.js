const express = require('express')
const router = express.Router()
const { Activity, CommunityUser, Cooperation, MerchantUser, Message } = require('../models')
const authMiddleware = require('../middleware/auth')
const { Op } = require('sequelize')
const CodeGenerator = require('../utils/codeGenerator')
const MatchingAlgorithm = require('../utils/matchingAlgorithm')

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const activityData = req.body
    
    if (activityData.need_detail && typeof activityData.need_detail === 'object') {
      activityData.need_detail = JSON.stringify(activityData.need_detail)
    }

    const demand_code = await CodeGenerator.generateDemandCode()

    const activity = await Activity.create({
      ...activityData,
      demand_code,
      community_id: id,
      status: 0
    })

    const merchants = await MerchantUser.findAll({
      where: { status: 1 },
      attributes: ['id', 'sponsor_types', 'target_crowd', 'industry', 'latitude', 'longitude', 'member_level', 'star_rating', 'tags', 'custom_tags']
    })

    const community = await CommunityUser.findByPk(id)

    const matchResults = MatchingAlgorithm.matchAndSort(merchants, activity, community)

    const highMatchMerchants = MatchingAlgorithm.filterHighMatch(matchResults, 70)

    if (highMatchMerchants.length > 0) {
      const messages = highMatchMerchants.map(({ merchant, score }) => ({
        merchant_id: merchant.id,
        title: '新需求推荐',
        content: `匹配度${score}%！${community.community_name}发布了新需求"${activity.title}"，与您的业务高度匹配，快去看看吧！`,
        type: 'demand_recommend',
        related_id: activity.id,
        is_read: 0
      }))
      
      await Message.bulkCreate(messages)
    }

    res.json({
      code: 200,
      message: '活动创建成功，请等待审核',
      data: activity
    })
  } catch (error) {
    console.error('创建活动错误:', error)
    res.status(500).json({ code: 500, message: '创建活动失败', error: error.message })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const activityCount = await Activity.count()
    
    const recruitingCount = await Activity.count({
      where: { status: 1 }
    })
    
    const completedCount = await Cooperation.count({
      where: { status: 3 }
    })
    
    const merchantCount = await MerchantUser.count({ where: { status: 1 } })
    
    res.json({
      code: 200,
      data: {
        activityCount,
        recruitingCount,
        completedCount,
        merchantCount,
        sponsoredActivityCount: completedCount
      }
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    res.status(500).json({ code: 500, message: '获取统计数据失败' })
  }
})

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const { page = 1, pageSize = 10, status, keyword } = req.query
    
    const where = { community_id: id }
    
    if (status !== undefined) {
      where.status = parseInt(status)
    }
    
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` }
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await Activity.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']]
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
    console.error('获取活动列表错误:', error)
    res.status(500).json({ code: 500, message: '获取活动列表失败' })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    const activity = await Activity.findByPk(id, {
      include: [{
        model: Cooperation,
        as: 'cooperations',
        include: [{
          model: MerchantUser,
          as: 'merchant',
          attributes: ['business_name', 'industry', 'logo']
        }]
      }]
    })

    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }

    res.json({ code: 200, data: activity })
  } catch (error) {
    console.error('获取活动详情错误:', error)
    res.status(500).json({ code: 500, message: '获取活动详情失败' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id: userId } = req.user
    const { id } = req.params
    const updateData = req.body
    
    const activity = await Activity.findByPk(id)
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }

    if (activity.community_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权限修改此活动' })
    }

    await activity.update(updateData)

    res.json({
      code: 200,
      message: '更新成功',
      data: activity
    })
  } catch (error) {
    console.error('更新活动错误:', error)
    res.status(500).json({ code: 500, message: '更新活动失败' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id: userId } = req.user
    const { id } = req.params
    
    const activity = await Activity.findByPk(id)
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }

    if (activity.community_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权限删除此活动' })
    }

    await activity.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除活动错误:', error)
    res.status(500).json({ code: 500, message: '删除活动失败' })
  }
})

router.get('/:id/cooperations', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, pageSize = 10, status } = req.query
    
    const where = { activity_id: id }
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
        model: MerchantUser,
        as: 'merchant',
        attributes: ['business_name', 'industry', 'logo', 'contact_name', 'phone']
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
    console.error('获取合作申请列表错误:', error)
    res.status(500).json({ code: 500, message: '获取合作申请列表失败' })
  }
})

module.exports = router
