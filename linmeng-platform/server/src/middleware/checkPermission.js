const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'linmeng_jwt_secret_key_2024'

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
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
      
      if (decoded.type !== 'admin') {
        return res.status(403).json({
          code: 403,
          message: '无权限访问'
        })
      }

      if (decoded.role === 'super_admin') {
        req.user = decoded
        return next()
      }

      if (!decoded.permissions || !Array.isArray(decoded.permissions)) {
        return res.status(403).json({
          code: 403,
          message: '无权限访问'
        })
      }

      if (!decoded.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          code: 403,
          message: '无权限访问'
        })
      }

      req.user = decoded
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
}

module.exports = checkPermission
