const express = require('express')
const router = express.Router()
const { CommunityUser, Activity, Cooperation, Evaluate } = require('../models')
const authMiddleware = require('../middleware/auth')
const { Op } = require('sequelize')
const { verifyCode } = require('../utils/smsCodes')
const CodeGenerator = require('../utils/codeGenerator')
const MatchingAlgorithm = require('../utils/matchingAlgorithm')
const xlsx = require('xlsx')
const multer = require('multer')

const upload = multer({ dest: 'uploads/' })

router.post('/register-new', async (req, res) => {
  try {
    const { phone, sms_code, community_name, contact_name, district, street, address, latitude, longitude, total_households, elderly_ratio, youth_family_ratio, public_space_area, residential_areas, nearby_merchants, license_img } = req.body
    
    if (!phone || !sms_code) {
      return res.status(400).json({ code: 400, message: '请输入手机号和验证码' })
    }
    
    const verifyResult = verifyCode(phone, sms_code)
    if (!verifyResult.valid) {
      return res.status(400).json({ code: 400, message: verifyResult.message })
    }
    
    if (!community_name || !contact_name || !district || !street || !address) {
      return res.status(400).json({ code: 400, message: '请填写必填信息' })
    }
    
    const existUser = await CommunityUser.findOne({ where: { phone } })
    if (existUser) {
      return res.status(400).json({ code: 400, message: '该手机号已注册' })
    }
    
    const community_code = await CodeGenerator.generateCommunityCode()
    
    const user = await CommunityUser.create({
      phone,
      community_code,
      community_name,
      contact_name,
      district,
      street,
      address,
      latitude,
      longitude,
      total_households,
      elderly_ratio,
      youth_family_ratio,
      public_space_area,
      residential_areas,
      nearby_merchants,
      license_img,
      status: 0
    })

    res.json({
      code: 200,
      message: '注册成功，请等待审核',
      data: {
        id: user.id,
        community_code: user.community_code,
        phone: user.phone,
        community_name: user.community_name,
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
    
    const user = await CommunityUser.findByPk(id)
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
    
    const user = await CommunityUser.findByPk(id, {
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
    
    const user = await CommunityUser.findByPk(id)
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
    
    const totalActivities = await Activity.count({ 
      where: { community_id: id, status: { [Op.ne]: 0 } }
    })
    const recruitingActivities = await Activity.count({ 
      where: { community_id: id, status: 1 } 
    })
    const completedCooperations = await Cooperation.count({
      where: { community_id: id, status: 3 }
    })

    res.json({
      code: 200,
      data: {
        totalActivities,
        recruitingActivities,
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
    const { id } = req.user
    const { page = 1, pageSize = 10, status } = req.query
    
    const where = { community_id: id }
    if (status !== undefined) {
      where.status = status
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

router.get('/demand-template', (req, res) => {
  const templateData = [
    {
      '需求标题*': '示例：社区亲子运动会',
      '需求类型*': '活动需求',
      '开始时间': '2026-04-01 09:00',
      '结束时间': '2026-04-01 17:00',
      '活动地点': '社区广场',
      '预计人数': '100',
      '面向人群': '亲子/少儿',
      '需求赞助类型': '现金,物资,人力',
      '活动简介': '社区亲子运动会，增进邻里感情',
      '回报设置': '品牌露出,现场展位'
    },
    {
      '需求标题*': '示例：场地招商',
      '需求类型*': '场地招商',
      '场地位置': '社区活动中心',
      '场地面积': '200',
      '场地类型': '室内',
      '配套设施': '空调,投影,音响',
      '招商要求': '教育培训,文化娱乐',
      '合作回报': '租金收益分成'
    },
    {
      '需求标题*': '示例：专家顾问咨询',
      '需求类型*': '专家顾问',
      '咨询领域': '社区治理',
      '专业要求': '社会工作专业背景',
      '咨询周期': '3个月',
      '预算范围': '5000-10000元'
    }
  ]

  const ws = xlsx.utils.json_to_sheet(templateData)
  
  const colWidths = [
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
    { wch: 20 },
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 }
  ]
  ws['!cols'] = colWidths

  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, ws, '需求导入模板')

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', 'attachment; filename=demand_template.xlsx')
  res.send(buffer)
})

router.post('/import-demands', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.user
    
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请上传文件' })
    }

    const workbook = xlsx.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)

    if (data.length === 0) {
      return res.status(400).json({ code: 400, message: '文件内容为空' })
    }

    if (data.length > 100) {
      return res.status(400).json({ code: 400, message: '单次最多导入100条需求' })
    }

    const errors = []
    const validData = []

    data.forEach((row, index) => {
      const rowNum = index + 2
      const error = []

      if (!row['需求标题*'] || row['需求标题*'].trim() === '') {
        error.push('需求标题不能为空')
      }

      if (!row['需求类型*']) {
        error.push('需求类型不能为空')
      } else {
        const typeMap = {
          '活动需求': 'activity',
          '场地招商': 'space',
          '专家顾问': 'consult'
        }
        if (!typeMap[row['需求类型*']]) {
          error.push('需求类型必须是：活动需求、场地招商或专家顾问')
        }
      }

      const typeMap = {
        '活动需求': 'activity',
        '场地招商': 'space',
        '专家顾问': 'consult'
      }
      const demandType = typeMap[row['需求类型*']]

      if (demandType === 'activity') {
        if (row['开始时间']) {
          const startTime = new Date(row['开始时间'])
          if (isNaN(startTime.getTime())) {
            error.push('开始时间格式错误，应为：YYYY-MM-DD HH:mm')
          }
        }
        if (row['结束时间']) {
          const endTime = new Date(row['结束时间'])
          if (isNaN(endTime.getTime())) {
            error.push('结束时间格式错误，应为：YYYY-MM-DD HH:mm')
          }
        }
      }

      if (error.length > 0) {
        errors.push({
          row: rowNum,
          title: row['需求标题*'] || '未知',
          errors: error
        })
      } else {
        validData.push({
          row: rowNum,
          data: row,
          demandType
        })
      }
    })

    if (errors.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '数据验证失败',
        data: {
          total: data.length,
          valid: validData.length,
          invalid: errors.length,
          errors
        }
      })
    }

    const community = await CommunityUser.findByPk(id)
    const createdDemands = []

    for (const item of validData) {
      const row = item.data
      const demandType = item.demandType

      const demandCode = await CodeGenerator.generateDemandCode()

      let demandData = {
        demand_code: demandCode,
        community_id: id,
        demand_type: demandType,
        title: row['需求标题*'],
        status: 0
      }

      if (demandType === 'activity') {
        demandData = {
          ...demandData,
          start_time: row['开始时间'] ? new Date(row['开始时间']) : null,
          end_time: row['结束时间'] ? new Date(row['结束时间']) : null,
          location: row['活动地点'] || '',
          expected_count: row['预计人数'] ? parseInt(row['预计人数']) : null,
          target_crowd: row['面向人群'] || '',
          sponsor_types: row['需求赞助类型'] || '',
          description: row['活动简介'] || '',
          returns: row['回报设置'] || ''
        }
      } else if (demandType === 'space') {
        demandData = {
          ...demandData,
          space_location: row['场地位置'] || '',
          space_area: row['场地面积'] || '',
          space_type: row['场地类型'] || '',
          space_facilities: row['配套设施'] || '',
          space_requirements: row['招商要求'] || '',
          space_returns: row['合作回报'] || ''
        }
      } else if (demandType === 'consult') {
        demandData = {
          ...demandData,
          consult_field: row['咨询领域'] || '',
          consult_expertise: row['专业要求'] || '',
          consult_duration: row['咨询周期'] || '',
          consult_budget: row['预算范围'] || ''
        }
      }

      const activity = await Activity.create(demandData)
      createdDemands.push(activity)

      const merchants = await require('../models').MerchantUser.findAll({
        where: { status: 1 },
        attributes: ['id', 'sponsor_types', 'target_crowd', 'industry', 'latitude', 'longitude', 'member_level', 'star_rating', 'tags', 'custom_tags']
      })

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
        
        await require('../models').Message.bulkCreate(messages)
      }
    }

    res.json({
      code: 200,
      message: `成功导入${createdDemands.length}条需求`,
      data: {
        total: data.length,
        success: createdDemands.length,
        demands: createdDemands.map(d => ({
          id: d.id,
          demand_code: d.demand_code,
          title: d.title,
          demand_type: d.demand_type
        }))
      }
    })

  } catch (error) {
    console.error('批量导入需求错误:', error)
    res.status(500).json({ code: 500, message: '导入失败', error: error.message })
  }
})

module.exports = router
