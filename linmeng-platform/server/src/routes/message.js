const express = require('express')
const router = express.Router()
const { Message } = require('../models')
const authMiddleware = require('../middleware/auth')
const { Op } = require('sequelize')

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    const { page = 1, pageSize = 10, msg_type } = req.query
    
    const userType = type === 'community' ? 0 : 1
    
    const where = {
      user_id: id,
      user_type: userType
    }
    
    if (msg_type !== undefined) {
      where.msg_type = msg_type
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await Message.findAndCountAll({
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
    console.error('获取消息列表错误:', error)
    res.status(500).json({ code: 500, message: '获取消息列表失败' })
  }
})

router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    
    const userType = type === 'community' ? 0 : 1
    
    const count = await Message.count({
      where: {
        user_id: id,
        user_type: userType,
        read_status: 0
      }
    })

    res.json({
      code: 200,
      data: { count }
    })
  } catch (error) {
    console.error('获取未读消息数错误:', error)
    res.status(500).json({ code: 500, message: '获取未读消息数失败' })
  }
})

router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    const { id: msgId } = req.params
    
    const userType = type === 'community' ? 0 : 1
    
    const message = await Message.findOne({
      where: {
        id: msgId,
        user_id: id,
        user_type: userType
      }
    })

    if (!message) {
      return res.status(404).json({ code: 404, message: '消息不存在' })
    }

    await message.update({ read_status: 1 })

    res.json({
      code: 200,
      message: '已标记为已读'
    })
  } catch (error) {
    console.error('标记已读错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    
    const userType = type === 'community' ? 0 : 1
    
    await Message.update(
      { read_status: 1 },
      {
        where: {
          user_id: id,
          user_type: userType,
          read_status: 0
        }
      }
    )

    res.json({
      code: 200,
      message: '已全部标记为已读'
    })
  } catch (error) {
    console.error('全部已读错误:', error)
    res.status(500).json({ code: 500, message: '操作失败' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id, type } = req.user
    const { id: msgId } = req.params
    
    const userType = type === 'community' ? 0 : 1
    
    const message = await Message.findOne({
      where: {
        id: msgId,
        user_id: id,
        user_type: userType
      }
    })

    if (!message) {
      return res.status(404).json({ code: 404, message: '消息不存在' })
    }

    await message.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除消息错误:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

module.exports = router
