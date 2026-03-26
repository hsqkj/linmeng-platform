import request from './request'

export default {
  auth: {
    sendSms: (data) => request.post('/auth/send-sms', data)
  },
  
  salesman: {
    register: (data) => request.post('/salesman/register', data),
    login: (data) => request.post('/salesman/login', data),
    getProfile: () => request.get('/salesman/profile'),
    getMerchants: (params) => request.get('/salesman/merchants', { params }),
    getCommissions: (params) => request.get('/salesman/commissions', { params }),
    getStats: () => request.get('/salesman/stats')
  }
}
