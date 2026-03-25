import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const isLoggedIn = ref(!!token.value)

  const login = async (phone) => {
    try {
      const res = await api.auth.login({ phone, user_type: 'community' })
      if (res.code === 200) {
        token.value = res.data.token
        userInfo.value = res.data.user
        isLoggedIn.value = true
        localStorage.setItem('token', res.data.token)
        return res
      }
      throw new Error(res.message)
    } catch (error) {
      throw error
    }
  }

  const getProfile = async () => {
    try {
      const res = await api.auth.getProfile()
      if (res.code === 200) {
        userInfo.value = res.data
        return res.data
      }
      throw new Error(res.message)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    isLoggedIn.value = false
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    getProfile,
    logout
  }
})
