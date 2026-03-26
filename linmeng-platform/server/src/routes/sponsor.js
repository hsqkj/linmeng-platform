const express = require('express')

const router = express.Router()
const { SponsorInfo, MerchantUser, SponsorComment } = require('../models')
const authMiddleware = require('../middleware/auth')
const { Op } = require('sequelize')
const CodeGenerator = require('../utils/codeGenerator')

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    
    if (type !== 'merchant') {
      return res.status(403).json({ code: 403, message: '只有商家可以发布赞助信息' })
    }
    
    const sponsorData = req.body
    
    const sponsor_code = await CodeGenerator.generateSponsorCode()
    
    const sponsorInfo = await SponsorInfo.create({
      ...sponsorData,
      sponsor_code,
      merchant_id: id,
      status: 1
    })
    
    res.json({
      code: 200,
      message: '发布成功',
      data: sponsorInfo
    })
  } catch (error) {
    console.error('发布赞助信息错误:', error)
    res.status(500).json({ code: 500, message: '发布失败', error: error.message })
  }
})

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, sponsor_type, keyword, sortBy = 'comprehensive', communityLat, communityLng } = req.query
    
    const where = { status: 1 }
    
    if (sponsor_type) {
      where.sponsor_type = sponsor_type
    }
    
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` }
    }
    
    const offset = (page - 1) * pageSize
    const { count, rows } = await SponsorInfo.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [
        {
          model: MerchantUser,
          as: 'merchant',
          attributes: ['business_name', 'logo', 'industry', 'address', 'member_level', 'star_rating', 'latitude', 'longitude']
        }
      ]
    })
    
    let sortedRows = rows
    const lat = communityLat ? parseFloat(communityLat) : null
    const lng = communityLng ? parseFloat(communityLng) : null
    
    if (sortBy === 'comprehensive' && lat && lng) {
      sortedRows = rows.map(row => {
        const merchant = row.merchant
        let distanceScore = 0
        let timeScore = 0
        let matchScore = 0
        
        if (merchant && merchant.latitude && merchant.longitude) {
          const distance = calculateDistance(
            lat, lng,
            parseFloat(merchant.latitude),
            parseFloat(merchant.longitude)
          )
          distanceScore = Math.max(0, 100 - distance * 10)
        }
        
        const daysSinceCreated = (Date.now() - new Date(row.create_time).getTime()) / (1000 * 60 * 60 * 24)
        timeScore = Math.max(0, 100 - daysSinceCreated * 5)
        
        if (merchant) {
          matchScore = (merchant.member_level || 0) * 20 + (merchant.star_rating || 5) * 10
        }
        
        const comprehensiveScore = distanceScore * 0.4 + timeScore * 0.3 + matchScore * 0.3
        
        return {
          ...row.toJSON(),
          distanceScore,
          timeScore,
          matchScore,
          comprehensiveScore
        }
      }).sort((a, b) => b.comprehensiveScore - a.comprehensiveScore)
    } else if (sortBy === 'distance' && lat && lng) {
      sortedRows = rows.map(row => {
        const merchant = row.merchant
        let distance = Infinity
        
        if (merchant && merchant.latitude && merchant.longitude) {
          distance = calculateDistance(
            lat, lng,
            parseFloat(merchant.latitude),
            parseFloat(merchant.longitude)
          )
        }
        
        return {
          ...row.toJSON(),
          distance
        }
      }).sort((a, b) => a.distance - b.distance)
    } else if (sortBy === 'time') {
      sortedRows = rows.sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
    } else if (sortBy === 'match') {
      sortedRows = rows.map(row => {
        const merchant = row.merchant
        let matchScore = 0
        
        if (merchant) {
          matchScore = (merchant.member_level || 0) * 20 + (merchant.star_rating || 5) * 10
        }
        
        return {
          ...row.toJSON(),
          matchScore
        }
      }).sort((a, b) => b.matchScore - a.matchScore)
    }
    
    res.json({
      code: 200,
      data: {
        list: sortedRows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取赞助信息列表错误:', error)
    res.status(500).json({ code: 500, message: '获取列表失败' })
  }
})

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    
    if (type !== 'merchant') {
      return res.status(403).json({ code: 403, message: '只有商家可以查看' })
    }
    
    const list = await SponsorInfo.findAll({
      where: { merchant_id: id },
      order: [['create_time', 'DESC']]
    })
    
    const listWithUnreadCount = await Promise.all(
      list.map(async (item) => {
        const unreadCount = await SponsorComment.count({
          where: {
            sponsor_id: item.id,
            is_read: false
          }
        })
        return {
          ...item.toJSON(),
          unread_comment_count: unreadCount
        }
      })
    )
    
    res.json({
      code: 200,
      data: listWithUnreadCount
    })
  } catch (error) {
    console.error('获取我的赞助信息错误:', error)
    res.status(500).json({ code: 500, message: '获取失败' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const sponsorInfo = await SponsorInfo.findByPk(id, {
      include: [
        {
          model: MerchantUser,
          as: 'merchant',
          attributes: ['business_name', 'logo', 'industry', 'address', 'contact_name', 'phone', 'member_level', 'star_rating', 'description']
        }
      ]
    })
    
    if (!sponsorInfo) {
      return res.status(404).json({ code: 404, message: '赞助信息不存在' })
    }
    
    res.json({
      code: 200,
      data: sponsorInfo
    })
  } catch (error) {
    console.error('获取赞助信息详情错误:', error)
    res.status(500).json({ code: 500, message: '获取详情失败' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id: userId, type } = req.user
    const { id } = req.params
    
    if (type !== 'merchant') {
      return res.status(403).json({ code: 403, message: '只有商家可以修改' })
    }
    
    const sponsorInfo = await SponsorInfo.findByPk(id)
    
    if (!sponsorInfo) {
      return res.status(404).json({ code: 404, message: '赞助信息不存在' })
    }
    
    if (sponsorInfo.merchant_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权修改' })
    }
    
    await sponsorInfo.update(req.body)
    
    res.json({
      code: 200,
      message: '修改成功',
      data: sponsorInfo
    })
  } catch (error) {
    console.error('修改赞助信息错误:', error)
    res.status(500).json({ code: 500, message: '修改失败' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id: userId, type } = req.user
    const { id } = req.params
    
    if (type !== 'merchant') {
      return res.status(403).json({ code: 403, message: '只有商家可以删除' })
    }
    
    const sponsorInfo = await SponsorInfo.findByPk(id)
    
    if (!sponsorInfo) {
      return res.status(404).json({ code: 404, message: '赞助信息不存在' })
    }
    
    if (sponsorInfo.merchant_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权删除' })
    }
    
    await sponsorInfo.destroy()
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除赞助信息错误:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id: userId, type } = req.user
    const { id } = req.params
    const { status } = req.body
    
    if (type !== 'merchant') {
      return res.status(403).json({ code: 403, message: '只有商家可以操作' })
    }
    
    const sponsorInfo = await SponsorInfo.findByPk(id)
    
    if (!sponsorInfo) {
      return res.status(404).json({ code: 404, message: '赞助信息不存在' })
    }
    
    if (sponsorInfo.merchant_id !== userId) {
      return res.status(403).json({ code: 403, message: '无权操作' })
    }
    
    await sponsorInfo.update({ status })
    
    res.json({
      code: 200,
      message: status === 1 ? '已上架' : '已下架'
    })
  } catch (error) {
    console.error('修改状态错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.get('/stats/merchant', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    
    if (type !== 'merchant') {
      return res.status(403).json({ code: 403, message: '只有商家可以查看' })
    }
    
    const list = await SponsorInfo.findAll({
      where: { merchant_id: id },
      attributes: ['view_count', 'consult_count']
    })
    
    const stats = {
      total: list.length,
      totalViews: list.reduce((sum, item) => sum + (item.view_count || 0), 0),
      totalConsults: list.reduce((sum, item) => sum + (item.consult_count || 0), 0)
    }
    
    res.json({
      code: 200,
      data: stats
    })
  } catch (error) {
    console.error('获取赞助统计错误:', error)
    res.status(500).json({ code: 500, message: '获取统计失败' })
  }
})

router.put('/:id/view', async (req, res) => {
  try {
    const { id } = req.params
    
    const sponsorInfo = await SponsorInfo.findByPk(id)
    
    if (!sponsorInfo) {
      return res.status(404).json({ code: 404, message: '赞助信息不存在' })
    }
    
    await sponsorInfo.increment('view_count')
    
    res.json({
      code: 200,
      message: '阅读量+1'
    })
  } catch (error) {
    console.error('增加阅读量错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.put('/:id/consult', async (req, res) => {
  try {
    const { id } = req.params
    
    const sponsorInfo = await SponsorInfo.findByPk(id)
    
    if (!sponsorInfo) {
      return res.status(404).json({ code: 404, message: '赞助信息不存在' })
    }
    
    await sponsorInfo.increment('consult_count')
    
    res.json({
      code: 200,
      message: '咨询量+1'
    })
  } catch (error) {
    console.error('增加咨询量错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

module.exports = router
