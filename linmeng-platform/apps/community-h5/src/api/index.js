import request from './request'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

export default {
  baseURL,
  
  auth: {
    login: (data) => request.post('/auth/login', data),
    getProfile: () => request.get('/auth/profile'),
    wechatLogin: (data) => request.post('/auth/wechat-login', data),
    sendSms: (data) => request.post('/auth/send-sms', data)
  },
  
  community: {
    register: (data) => request.post('/community/register', data),
    registerNew: (data) => request.post('/community/register-new', data),
    getProfile: () => request.get('/community/profile'),
    updateProfile: (data) => request.put('/community/profile', data),
    getActivities: (params) => request.get('/community/activities', { params }),
    getStats: () => request.get('/community/stats'),
    getStatistics: () => request.get('/community/stats'),
    importDemands: (formData) => request.post('/community/import-demands', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  activity: {
    create: (data) => request.post('/activity/create', data),
    getMyList: (params) => request.get('/activity/list', { params }),
    getDetail: (id) => request.get(`/activity/${id}`),
    update: (id, data) => request.put(`/activity/${id}`, data),
    complete: (id, data) => request.post(`/activity/${id}/complete`, data),
    getApplicants: (activityId) => request.get(`/activity/${activityId}/applicants`),
    getStats: () => request.get('/activity/stats')
  },
  
  cooperation: {
    getList: (params) => request.get('/cooperation/list', { params }),
    getDetail: (id) => request.get(`/cooperation/${id}`),
    confirm: (id) => request.put(`/cooperation/${id}/accept`),
    reject: (id, data) => request.put(`/cooperation/${id}/reject`, data),
    getMerchant: (id) => request.get(`/cooperation/${id}/merchant`)
  },
  
  evaluate: {
    create: (data) => request.post('/evaluate/create', data),
    getList: (params) => request.get('/evaluate/list', { params })
  },
  
  message: {
    getList: (params) => request.get('/message/list', { params }),
    getUnreadCount: () => request.get('/message/unread-count'),
    read: (id) => request.put(`/message/${id}/read`),
    readAll: () => request.put('/message/read-all'),
    send: (data) => request.post('/message/send', data)
  },
  
  sponsor: {
    getList: (params) => request.get('/sponsor/list', { params }),
    getDetail: (id) => request.get(`/sponsor/${id}`),
    incrementView: (id) => request.put(`/sponsor/${id}/view`),
    incrementConsult: (id) => request.put(`/sponsor/${id}/consult`)
  },
  
  tag: {
    getAll: (params) => request.get('/tag/all', { params })
  }
}
