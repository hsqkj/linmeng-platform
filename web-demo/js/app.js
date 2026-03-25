// 全局应用对象
const App = {
  // 初始化应用
  init() {
    this.loadUserData();
    this.loadMessages();
  },
  
  // 用户数据
  user: null,
  
  // 消息数据
  messages: [],
  
  // 统计数据
  statistics: {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    dailyViews: [],
    genderDistribution: { male: 60, female: 40 },
    hourlyTraffic: [12, 8, 5, 3, 10, 25, 40, 55, 60, 50, 45, 35, 30, 28, 32, 40, 50, 65, 70, 60, 45, 30, 20, 15],
    categoryRatio: { promotion: 45, event: 25, notice: 20, other: 10 }
  },
  
  // 保存用户数据到本地存储
  saveUserData(userData) {
    this.user = userData;
    localStorage.setItem('businessDistrictUser', JSON.stringify(userData));
  },
  
  // 从本地存储加载用户数据
  loadUserData() {
    const userData = localStorage.getItem('businessDistrictUser');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  },
  
  // 保存消息到本地存储
  saveMessage(message) {
    const newMessage = {
      id: Date.now(),
      ...message,
      createTime: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
      shares: 0
    };
    this.messages.unshift(newMessage);
    localStorage.setItem('businessDistrictMessages', JSON.stringify(this.messages));
    this.updateStatistics(newMessage);
    return newMessage;
  },
  
  // 从本地存储加载消息
  loadMessages() {
    const messages = localStorage.getItem('businessDistrictMessages');
    if (messages) {
      this.messages = JSON.parse(messages);
      this.calculateStatistics();
    }
  },
  
  // 更新消息统计
  updateMessageStats(messageId, type) {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      switch (type) {
        case 'view':
          message.views++;
          this.statistics.totalViews++;
          break;
        case 'like':
          message.likes++;
          this.statistics.totalLikes++;
          break;
        case 'comment':
          this.statistics.totalComments++;
          break;
        case 'share':
          message.shares++;
          this.statistics.totalShares++;
          break;
      }
      localStorage.setItem('businessDistrictMessages', JSON.stringify(this.messages));
      localStorage.setItem('businessDistrictStatistics', JSON.stringify(this.statistics));
    }
  },
  
  // 添加评论
  addComment(messageId, comment) {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      const newComment = {
        id: Date.now(),
        ...comment,
        createTime: new Date().toISOString()
      };
      message.comments.push(newComment);
      this.updateMessageStats(messageId, 'comment');
      return newComment;
    }
    return null;
  },
  
  // 计算统计数据
  calculateStatistics() {
    this.statistics.totalViews = this.messages.reduce((sum, message) => sum + message.views, 0);
    this.statistics.totalLikes = this.messages.reduce((sum, message) => sum + message.likes, 0);
    this.statistics.totalComments = this.messages.reduce((sum, message) => sum + message.comments.length, 0);
    this.statistics.totalShares = this.messages.reduce((sum, message) => sum + message.shares, 0);
    
    // 生成最近7天的浏览量数据
    this.statistics.dailyViews = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const day = date.toLocaleDateString();
      const views = Math.floor(Math.random() * 100) + 50;
      return { date: day, views };
    }).reverse();
    
    localStorage.setItem('businessDistrictStatistics', JSON.stringify(this.statistics));
  },
  
  // 更新统计数据
  updateStatistics(newMessage) {
    // 模拟浏览量增长
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.updateMessageStats(newMessage.id, 'view');
      }
    }, 2000);
    
    // 模拟点赞增长
    setTimeout(() => {
      if (Math.random() > 0.5) {
        this.updateMessageStats(newMessage.id, 'like');
      }
    }, 5000);
  },
  
  // 获取统计数据
  getStatistics() {
    return this.statistics;
  },
  
  // 获取用户消息
  getUserMessages() {
    if (!this.user) return [];
    return this.messages.filter(message => message.merchantId === this.user.id);
  },
  
  // 清除所有数据（用于测试）
  clearAllData() {
    localStorage.removeItem('businessDistrictUser');
    localStorage.removeItem('businessDistrictMessages');
    localStorage.removeItem('businessDistrictStatistics');
    this.user = null;
    this.messages = [];
    this.calculateStatistics();
  },
  
  // 生成随机ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // 格式化日期
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // 检查用户是否登录
  isLoggedIn() {
    return !!this.user;
  },
  
  // 用户登出
  logout() {
    this.user = null;
    localStorage.removeItem('businessDistrictUser');
  }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 导出App对象（如果需要）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}