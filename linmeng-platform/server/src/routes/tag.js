const express = require('express')
const router = express.Router()
const { TagLibrary } = require('../models')
const authMiddleware = require('../middleware/auth')
const checkPermission = require('../middleware/checkPermission')
const { Op } = require('sequelize')

router.get('/list', authMiddleware, checkPermission('tag'), async (req, res) => {
  try {
    const { page = 1, pageSize = 20, category, type, keyword } = req.query
    
    const where = {}
    
    if (category) {
      where.category = category
    }
    
    if (type) {
      where.type = type
    }
    
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` }
    }

    const offset = (page - 1) * pageSize
    const { count, rows } = await TagLibrary.findAndCountAll({
      where,
      offset,
      limit: parseInt(pageSize),
      order: [['sort_order', 'ASC'], ['create_time', 'DESC']]
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
    console.error('获取标签列表错误:', error)
    res.status(500).json({ code: 500, message: '获取标签列表失败' })
  }
})

router.get('/all', async (req, res) => {
  try {
    const { category, type } = req.query
    
    const where = { status: 1 }
    
    if (category) {
      where.category = category
    }
    
    if (type) {
      where.type = type
    }

    const tags = await TagLibrary.findAll({
      where,
      order: [['sort_order', 'ASC'], ['create_time', 'DESC']],
      attributes: ['id', 'name', 'category', 'type']
    })

    res.json({ code: 200, data: tags })
  } catch (error) {
    console.error('获取所有标签错误:', error)
    res.status(500).json({ code: 500, message: '获取标签失败' })
  }
})

router.post('/create', authMiddleware, checkPermission('tag'), async (req, res) => {
  try {
    const { name, category, type, sort_order } = req.body
    
    if (!name || !category) {
      return res.status(400).json({ code: 400, message: '标签名称和分类不能为空' })
    }

    const existing = await TagLibrary.findOne({
      where: { name, category }
    })

    if (existing) {
      return res.status(400).json({ code: 400, message: '该标签已存在' })
    }

    const tag = await TagLibrary.create({
      name,
      category,
      type: type || null,
      sort_order: sort_order || 0,
      status: 1
    })

    res.json({
      code: 200,
      message: '创建成功',
      data: tag
    })
  } catch (error) {
    console.error('创建标签错误:', error)
    res.status(500).json({ code: 500, message: '创建失败' })
  }
})

router.put('/:id', authMiddleware, checkPermission('tag'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, category, type, sort_order, status } = req.body
    
    const tag = await TagLibrary.findByPk(id)
    if (!tag) {
      return res.status(404).json({ code: 404, message: '标签不存在' })
    }

    if (name && name !== tag.name) {
      const existing = await TagLibrary.findOne({
        where: { name, category: category || tag.category }
      })
      if (existing) {
        return res.status(400).json({ code: 400, message: '该标签名称已存在' })
      }
    }

    await tag.update({
      name: name || tag.name,
      category: category || tag.category,
      type: type !== undefined ? type : tag.type,
      sort_order: sort_order !== undefined ? sort_order : tag.sort_order,
      status: status !== undefined ? status : tag.status
    })

    res.json({
      code: 200,
      message: '更新成功',
      data: tag
    })
  } catch (error) {
    console.error('更新标签错误:', error)
    res.status(500).json({ code: 500, message: '更新失败' })
  }
})

router.delete('/:id', authMiddleware, checkPermission('tag'), async (req, res) => {
  try {
    const { id } = req.params
    
    const tag = await TagLibrary.findByPk(id)
    if (!tag) {
      return res.status(404).json({ code: 404, message: '标签不存在' })
    }

    await tag.destroy()

    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error('删除标签错误:', error)
    res.status(500).json({ code: 500, message: '删除失败' })
  }
})

module.exports = router
