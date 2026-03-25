import request from './request'

export default {
  auth: {
    login: (data) => request.post('/admin/login', data)
  },
  
  statistics: {
    get: () => request.get('/admin/statistics')
  },
  
  community: {
    getList: (params) => request.get('/admin/community/list', { params }),
    audit: (id, data) => request.put(`/admin/community/audit/${id}`, data),
    delete: (id) => request.delete(`/admin/community/${id}`)
  },
  
  merchant: {
    getList: (params) => request.get('/admin/merchant/list', { params }),
    audit: (id, data) => request.put(`/admin/merchant/audit/${id}`, data),
    getSponsorList: (id) => request.get(`/admin/merchant/sponsor/${id}`),
    delete: (id) => request.delete(`/admin/merchant/${id}`)
  },
  
  activity: {
    getList: (params) => request.get('/admin/activity/list', { params }),
    audit: (id, data) => request.put(`/admin/activity/audit/${id}`, data),
    supplement: (id, data) => request.put(`/admin/activity/supplement/${id}`, data),
    delete: (id) => request.delete(`/admin/activity/${id}`)
  },
  
  order: {
    getList: (params) => request.get('/admin/order/list', { params })
  }
}
