const express = require('express')
const router = express.Router()
const { Cooperation, Activity, CommunityUser, MerchantUser, Message, Evaluate } = require('../models')
const authMiddleware = require('../middleware/auth')
const { Op } = require('sequelize')

const calculateMatchScore = (activity, merchant) => {
  let score = 0
  let maxScore = 100
  
  const activitySponsorTypes = activity.sponsor_types ? JSON.parse(activity.sponsor_types) : []
  const merchantSponsorTypes = merchant.sponsor_types ? JSON.parse(merchant.sponsor_types) : []
  const activityTargetCrowd = activity.target_crowd ? JSON.parse(activity.target_crowd) : []
  const merchantTargetCrowd = merchant.target_crowd ? JSON.parse(merchant.target_crowd) : []
  const activityReturns = activity.returns ? JSON.parse(activity.returns) : []
  const merchantReturnExpect = merchant.return_expect ? JSON.parse(merchant.return_expect) : []
  
  if (activitySponsorTypes.length > 0 && merchantSponsorTypes.length > 0) {
    const sponsorMatch = activitySponsorTypes.filter(type => merchantSponsorTypes.includes(type)).length
    const sponsorScore = (sponsorMatch / activitySponsorTypes.length) * 30
    score += sponsorScore
  } else {
    score += 15
  }
  
  if (activityTargetCrowd.length > 0 && merchantTargetCrowd.length > 0) {
    const crowdMatch = activityTargetCrowd.filter(crowd => merchantTargetCrowd.includes(crowd)).length
    const crowdScore = (crowdMatch / activityTargetCrowd.length) * 25
    score += crowdScore
  } else {
    score += 12
  }
  
  if (activityReturns.length > 0 && merchantReturnExpect.length > 0) {
    const returnMatch = activityReturns.filter(ret => merchantReturnExpect.includes(ret)).length
    const returnScore = (returnMatch / activityReturns.length) * 20
    score += returnScore
  } else {
    score += 10
  }
  
  if (merchant.member_level > 0) {
    score += Math.min(merchant.member_level * 5, 15)
  }
  
  if (merchant.star_rating) {
    score += (merchant.star_rating / 5) * 10
  } else {
    score += 5
  }
  
  return Math.min(Math.round(score), maxScore)
}

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    const { page = 1, pageSize = 10, status, activity_id } = req.query
    
    const where = {}
    if (type === 'community') {
      where.community_id = id
    } else {
      where.merchant_id = id
    }
    
    if (status !== undefined) {
      where.status = status
    }
    
    if (activity_id) {
      where.activity_id = activity_id
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await Cooperation.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [
        {
          model: Activity,
          as: 'activity',
          attributes: ['title', 'start_time', 'end_time', 'location', 'expected_count', 'sponsor_types', 'target_crowd', 'returns']
        },
        {
          model: CommunityUser,
          as: 'communityInfo',
          attributes: ['community_name', 'contact_name', 'phone']
        },
        {
          model: MerchantUser,
          as: 'merchant',
          attributes: ['business_name', 'industry', 'logo', 'contact_name', 'phone', 'description', 'address', 'target_crowd', 'sponsor_types', 'return_expect', 'member_level', 'star_rating']
        }
      ]
    })

    const listWithScore = rows.map(item => {
      const matchScore = calculateMatchScore(item.activity, item.merchant)
      return {
        ...item.toJSON(),
        match_score: matchScore
      }
    })

    res.json({
      code: 200,
      data: {
        list: listWithScore,
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

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    const cooperation = await Cooperation.findByPk(id, {
      include: [
        {
          model: Activity,
          as: 'activity'
        },
        {
          model: CommunityUser,
          as: 'communityInfo',
          attributes: ['community_name', 'contact_name', 'phone']
        },
        {
          model: MerchantUser,
          as: 'merchant',
          attributes: ['business_name', 'industry', 'logo', 'contact_name', 'phone', 'description']
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

router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const { id: userId, type } = req.user
    const { id } = req.params
    
    if (type !== 'community') {
      return res.status(403).json({ code: 403, message: '只有社区用户可以接受合作' })
    }

    const cooperation = await Cooperation.findByPk(id)
    if (!cooperation) {
      return res.status(404).json({ code: 404, message: '合作记录不存在' })
    }

    if (cooperation.community_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权限操作' })
    }

    await cooperation.update({ status: 1 })

    await Message.create({
      user_id: cooperation.merchant_id,
      user_type: 1,
      msg_type: 0,
      content: `您报名的活动合作申请已被社区接受，请及时联系社区负责人确认合作细节。`,
      read_status: 0
    })

    res.json({
      code: 200,
      message: '已接受合作申请',
      data: cooperation
    })
  } catch (error) {
    console.error('接受合作错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { id: userId, type } = req.user
    const { id } = req.params
    const { reason } = req.body
    
    if (type !== 'community') {
      return res.status(403).json({ code: 403, message: '只有社区用户可以拒绝合作' })
    }

    const cooperation = await Cooperation.findByPk(id)
    if (!cooperation) {
      return res.status(404).json({ code: 404, message: '合作记录不存在' })
    }

    if (cooperation.community_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权限操作' })
    }

    await cooperation.update({ status: 2, reject_reason: reason })

    const activity = await Activity.findByPk(cooperation.activity_id)
    
    await Message.create({
      user_id: cooperation.merchant_id,
      user_type: 1,
      msg_type: 0,
      content: `您报名的活动「${activity?.title || ''}」合作申请已被拒绝。原因：${reason || '无'}`,
      read_status: 0
    })

    res.json({
      code: 200,
      message: '已拒绝合作申请',
      data: cooperation
    })
  } catch (error) {
    console.error('拒绝合作错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id: userId, type } = req.user
    const { id } = req.params
    
    if (type !== 'community') {
      return res.status(403).json({ code: 403, message: '只有社区用户可以确认完成' })
    }

    const cooperation = await Cooperation.findByPk(id)
    if (!cooperation) {
      return res.status(404).json({ code: 404, message: '合作记录不存在' })
    }

    if (cooperation.community_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权限操作' })
    }

    await cooperation.update({ status: 3 })

    await Message.create({
      user_id: cooperation.merchant_id,
      user_type: 1,
      msg_type: 0,
      content: `您的合作已确认完成，感谢您的支持！`,
      read_status: 0
    })

    res.json({
      code: 200,
      message: '已确认合作完成',
      data: cooperation
    })
  } catch (error) {
    console.error('确认完成错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.post('/:id/evaluate', authMiddleware, async (req, res) => {
  try {
    const { id: userId, type } = req.user
    const { id } = req.params
    const { rating, content, tags } = req.body
    
    if (type !== 'community') {
      return res.status(403).json({ code: 403, message: '只有社区用户可以评价' })
    }

    const cooperation = await Cooperation.findByPk(id)
    if (!cooperation) {
      return res.status(404).json({ code: 404, message: '合作记录不存在' })
    }

    if (cooperation.community_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权限操作' })
    }

    if (cooperation.status !== 3) {
      return res.status(400).json({ code: 400, message: '只有已完成的合作才能评价' })
    }

    const existing = await Evaluate.findOne({
      where: { cooperation_id: id }
    })
    
    if (existing) {
      return res.status(400).json({ code: 400, message: '该合作已评价' })
    }

    const evaluate = await Evaluate.create({
      cooperation_id: id,
      activity_id: cooperation.activity_id,
      community_id: userId,
      business_id: cooperation.merchant_id,
      rating,
      content,
      tags: tags ? JSON.stringify(tags) : null
    })

    res.json({
      code: 200,
      message: '评价成功',
      data: evaluate
    })
  } catch (error) {
    console.error('评价错误:', error)
    res.status(500).json({ code: 500, message: '评价失败' })
  }
})

module.exports = router
