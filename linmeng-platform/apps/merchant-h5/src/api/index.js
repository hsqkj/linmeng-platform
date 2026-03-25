import request from './request'

export default {
  auth: {
    login: (data) => request.post('/auth/login', data),
    getProfile: () => request.get('/auth/profile'),
    wechatLogin: (data) => request.post('/auth/wechat-login', data),
    sendSms: (data) => request.post('/auth/send-sms', data)
  },
  
  merchant: {
    register: (data) => request.post('/merchant/register', data),
    registerNew: (data) => request.post('/merchant/register-new', data),
    getProfile: () => request.get('/merchant/profile'),
    updateProfile: (data) => request.put('/merchant/profile', data),
    getActivities: (params) => request.get('/merchant/activities', { params }),
    getActivityDetail: (id) => request.get(`/merchant/activity/${id}`),
    applyActivity: (activityId, data) => request.post(`/merchant/apply/${activityId}`, data),
    getCooperations: (params) => request.get('/merchant/cooperations', { params }),
    getCooperationDetail: (id) => request.get(`/merchant/cooperation/${id}`),
    cancelCooperation: (id) => request.delete(`/merchant/cooperation/${id}`),
    getStats: () => request.get('/merchant/stats'),
    getMemberPackages: () => request.get('/merchant/member-packages'),
    createOrder: (data) => request.post('/merchant/order', data),
    getOrders: () => request.get('/merchant/orders'),
    getEvaluates: () => request.get('/merchant/evaluates'),
    getCommunityInfo: (id) => request.get(`/merchant/community/${id}`),
    toggleFavorite: (id) => request.post(`/merchant/activity/${id}/favorite`),
    incrementView: (id) => request.post(`/merchant/activity/${id}/view`),
    getCommunities: () => request.get('/merchant/communities'),
    getFavorites: () => request.get('/merchant/favorites')
  },
  
  activity: {
    getStats: () => request.get('/activity/stats')
  },
  
  message: {
    getList: (params) => request.get('/message/list', { params }),
    getUnreadCount: () => request.get('/message/unread-count'),
    read: (id) => request.put(`/message/${id}/read`),
    readAll: () => request.put('/message/read-all')
  },
  
  sponsor: {
    create: (data) => request.post('/sponsor/create', data),
    getMy: () => request.get('/sponsor/my'),
    getDetail: (id) => request.get(`/sponsor/${id}`),
    update: (id, data) => request.put(`/sponsor/${id}`, data),
    delete: (id) => request.delete(`/sponsor/${id}`),
    updateStatus: (id, data) => request.put(`/sponsor/${id}/status`, data),
    getStats: () => request.get('/sponsor/stats/merchant'),
    getList: (params) => request.get('/sponsor/list', { params })
  },
  
  tag: {
    getAll: (params) => request.get('/tag/all', { params })
  }
}
