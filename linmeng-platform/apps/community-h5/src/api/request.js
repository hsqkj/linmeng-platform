import axios from 'axios'
import { showDialog } from 'vant'
import router from '../router'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('community_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 400) {
        showDialog({ message: data.message || '请求参数错误' })
      } else if (status === 401) {
        localStorage.removeItem('community_token')
        router.push('/login')
        showDialog({ message: '请重新登录' })
      } else if (status === 403) {
        showDialog({ message: data.message || '无权限访问' })
      } else if (status === 404) {
        showDialog({ message: data.message || '资源不存在' })
      } else if (status === 500) {
        showDialog({ message: '服务器错误' })
      } else {
        showDialog({ message: data.message || '请求失败' })
      }
    } else {
      showDialog({ message: '网络错误' })
    }
    return Promise.reject(error)
  }
)

export default request
