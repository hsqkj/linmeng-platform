const smsCodes = new Map()

const generateCode = (phone) => {
  const code = Math.random().toString().slice(-6)
  smsCodes.set(phone, {
    code,
    expire: Date.now() + 5 * 60 * 1000
  })
  return code
}

const verifyCode = (phone, code) => {
  const stored = smsCodes.get(phone)
  if (!stored) {
    return { valid: false, message: '验证码已过期，请重新获取' }
  }
  
  if (stored.code !== code) {
    return { valid: false, message: '验证码错误' }
  }
  
  if (Date.now() > stored.expire) {
    smsCodes.delete(phone)
    return { valid: false, message: '验证码已过期，请重新获取' }
  }
  
  smsCodes.delete(phone)
  return { valid: true }
}

module.exports = {
  generateCode,
  verifyCode
}
