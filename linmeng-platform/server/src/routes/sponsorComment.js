const express = require('express')

const router = express.Router()
const { SponsorComment, SponsorInfo, CommunityUser, MerchantUser, Message } = require('../models')
const { Op } = require('sequelize')
const authMiddleware = require('../middleware/auth')
const CodeGenerator = require('../utils/codeGenerator')

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const { sponsor_id, content, parent_id, reply_to_id } = req.body
    
    if (!sponsor_id || !content) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' })
    }
    
    const sponsor = await SponsorInfo.findByPk(sponsor_id)
    if (!sponsor) {
      return res.status(404).json({ code: 404, message: '赞助信息不存在' })
    }
    
    const comment_code = await CodeGenerator.generateCommentCode()
    
    const comment = await SponsorComment.create({
      comment_code,
      sponsor_id,
      community_id: id,
      content,
      parent_id: parent_id || null,
      reply_to_id: reply_to_id || null,
      is_read: false
    })
    
    const commentWithUser = await SponsorComment.findByPk(comment.id, {
      include: [
        {
          model: CommunityUser,
          as: 'community',
          attributes: ['community_name', 'contact_name']
        },
        {
          model: MerchantUser,
          as: 'merchant',
          attributes: ['business_name']
        }
      ]
    })
    
    const community = await CommunityUser.findByPk(id)
    await Message.create({
      user_id: sponsor.merchant_id,
      user_type: 1,
      sender_type: 1,
      sender_id: id,
      msg_type: 1,
      content: `社区「${community?.community_name || ''}」对您的赞助「${sponsor.title}」留言：${content}`,
      activity_id: sponsor.id,
      read_status: 0
    })
    
    res.json({
      code: 200,
      message: '留言成功',
      data: commentWithUser
    })
  } catch (error) {
    console.error('创建留言错误:', error)
    res.status(500).json({ code: 500, message: '留言失败', error: error.message })
  }
})

router.get('/list/:sponsor_id', async (req, res) => {
  try {
    const { sponsor_id } = req.params
    const { page = 1, pageSize = 20 } = req.query
    
    const offset = (page - 1) * pageSize
    const { count, rows } = await SponsorComment.findAndCountAll({
      where: { 
        sponsor_id,
        parent_id: null
      },
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [
        {
          model: CommunityUser,
          as: 'community',
          attributes: ['community_name', 'contact_name']
        },
        {
          model: MerchantUser,
          as: 'merchant',
          attributes: ['business_name']
        },
        {
          model: SponsorComment,
          as: 'replies',
          include: [
            {
              model: CommunityUser,
              as: 'community',
              attributes: ['community_name', 'contact_name']
            },
            {
              model: MerchantUser,
              as: 'merchant',
              attributes: ['business_name']
            }
          ]
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
    console.error('获取留言列表错误:', error)
    res.status(500).json({ code: 500, message: '获取列表失败' })
  }
})

router.get('/merchant/unread', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    
    const count = await SponsorComment.count({
      where: {
        merchant_id: id,
        is_read: false
      }
    })
    
    res.json({
      code: 200,
      data: { unreadCount: count }
    })
  } catch (error) {
    console.error('获取未读留言数错误:', error)
    res.status(500).json({ code: 500, message: '获取失败' })
  }
})

router.get('/merchant/list', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const { page = 1, pageSize = 20, is_read, sponsor_id } = req.query
    
    const sponsorWhere = { merchant_id: id }
    
    const where = { 
      parent_id: null
    }
    if (is_read !== undefined) {
      where.is_read = is_read === 'true'
    }
    if (sponsor_id) {
      where.sponsor_id = sponsor_id
    }
    
    const offset = (page - 1) * pageSize
    const { count, rows } = await SponsorComment.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['create_time', 'DESC']],
      include: [
        {
          model: SponsorInfo,
          as: 'sponsor',
          attributes: ['title', 'sponsor_type'],
          where: sponsorWhere,
          required: true
        },
        {
          model: CommunityUser,
          as: 'community',
          attributes: ['community_name', 'contact_name', 'phone']
        },
        {
          model: SponsorComment,
          as: 'replies',
          include: [
            {
              model: CommunityUser,
              as: 'community',
              attributes: ['community_name', 'contact_name']
            },
            {
              model: MerchantUser,
              as: 'merchant',
              attributes: ['business_name']
            }
          ]
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
    console.error('获取商家留言列表错误:', error)
    res.status(500).json({ code: 500, message: '获取列表失败' })
  }
})

router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    await SponsorComment.update(
      { is_read: true },
      { where: { id } }
    )
    
    res.json({
      code: 200,
      message: '已标记为已读'
    })
  } catch (error) {
    console.error('标记已读错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.post('/reply', authMiddleware, async (req, res) => {
  try {
    const { id } = req.user
    const { sponsor_id, content, parent_id, reply_to_id } = req.body
    
    if (!sponsor_id || !content || !parent_id) {
      return res.status(400).json({ code: 400, message: '缺少必要参数' })
    }
    
    const sponsor = await SponsorInfo.findByPk(sponsor_id)
    if (!sponsor) {
      return res.status(404).json({ code: 404, message: '赞助信息不存在' })
    }
    
    const parentComment = await SponsorComment.findByPk(parent_id)
    if (!parentComment) {
      return res.status(404).json({ code: 404, message: '原留言不存在' })
    }
    
    const comment_code = await CodeGenerator.generateCommentCode()
    
    const comment = await SponsorComment.create({
      comment_code,
      sponsor_id,
      community_id: parentComment.community_id,
      merchant_id: id,
      content,
      parent_id,
      reply_to_id: reply_to_id || parent_id,
      is_read: false
    })
    
    const commentWithUser = await SponsorComment.findByPk(comment.id, {
      include: [
        {
          model: CommunityUser,
          as: 'community',
          attributes: ['community_name', 'contact_name']
        },
        {
          model: MerchantUser,
          as: 'merchant',
          attributes: ['business_name']
        }
      ]
    })
    
    const merchant = await MerchantUser.findByPk(id)
    await Message.create({
      user_id: parentComment.community_id,
      user_type: 0,
      sender_type: 2,
      sender_id: id,
      msg_type: 1,
      content: `商家「${merchant?.business_name || ''}」回复了您在赞助「${sponsor.title}」下的留言：${content}`,
      activity_id: sponsor.id,
      read_status: 0
    })
    
    res.json({
      code: 200,
      message: '回复成功',
      data: commentWithUser
    })
  } catch (error) {
    console.error('回复留言错误:', error)
    res.status(500).json({ code: 500, message: '回复失败', error: error.message })
  }
})

module.exports = router
