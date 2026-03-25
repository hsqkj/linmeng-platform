App({
  onLaunch() {
    // 获取系统信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo = res;
      }
    });
    
    // 模拟登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
    }
  },
  
  globalData: {
    isLogin: false,
    userInfo: null,
    systemInfo: null,
    selectedTemplate: null,
    postedMessages: []
  },
  
  // 模拟登录方法
  login(userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLogin = true;
    wx.setStorageSync('userInfo', userInfo);
  },
  
  // 模拟登出方法
  logout() {
    this.globalData.userInfo = null;
    this.globalData.isLogin = false;
    wx.removeStorageSync('userInfo');
  },
  
  // 保存发布的消息
  saveMessage(message) {
    const messages = wx.getStorageSync('messages') || [];
    message.id = Date.now();
    message.createTime = new Date().toISOString();
    messages.unshift(message);
    wx.setStorageSync('messages', messages);
    this.globalData.postedMessages = messages;
  },
  
  // 获取所有消息
  getMessages() {
    return wx.getStorageSync('messages') || [];
  }
})