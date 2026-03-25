const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'linmeng_jwt_secret_key_2024'

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '请先登录'
      })
    }

    const token = authHeader.substring(7)
    
    const decoded = jwt.verify(token, JWT_SECRET)
    
    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      role: decoded.role,
      type: decoded.type
    }
    
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '登录已过期，请重新登录'
      })
    }
    
    return res.status(401).json({
      code: 401,
      message: '无效的登录状态'
    })
  }
}

module.exports = authMiddleware
