# 微信小程序项目结构与页面映射方案

## 一、项目结构设计

```
wechat-miniprogram/
├── app.js                 # 应用入口文件
├── app.json               # 全局配置文件
├── app.wxss               # 全局样式文件
├── pages/                 # 页面文件夹
│   ├── index/            # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── merchant/          # 商户端
│   │   ├── register/      # 商户注册
│   │   │   ├── register.js
│   │   │   ├── register.json
│   │   │   ├── register.wxml
│   │   │   └── register.wxss
│   │   ├── post-message/  # 发布消息
│   │   │   ├── post-message.js
│   │   │   ├── post-message.json
│   │   │   ├── post-message.wxml
│   │   │   └── post-message.wxss
│   │   ├── view-messages/ # 查看消息
│   │   │   ├── view-messages.js
│   │   │   ├── view-messages.json
│   │   │   ├── view-messages.wxml
│   │   │   └── view-messages.wxss
│   │   └── statistics/    # 数据统计
│   │       ├── statistics.js
│   │       ├── statistics.json
│   │       ├── statistics.wxml
│   │       └── statistics.wxss
│   └── resident/          # 居民端
│       └── view-messages/ # 查看消息
│           ├── view-messages.js
│           ├── view-messages.json
│           ├── view-messages.wxml
│           └── view-messages.wxss
├── components/            # 自定义组件
│   ├── step-indicator/    # 步骤指示器
│   │   ├── step-indicator.js
│   │   ├── step-indicator.json
│   │   ├── step-indicator.wxml
│   │   └── step-indicator.wxss
│   ├── message-card/      # 消息卡片
│   │   ├── message-card.js
│   │   ├── message-card.json
│   │   ├── message-card.wxml
│   │   └── message-card.wxss
│   └── stat-card/         # 统计卡片
│       ├── stat-card.js
│       ├── stat-card.json
│       ├── stat-card.wxml
│       └── stat-card.wxss
├── utils/                 # 工具函数
│   ├── request.js         # 网络请求封装
│   ├── chart.js           # 图表工具
│   └── date.js            # 日期处理
└── assets/                # 静态资源
    ├── images/            # 图片资源
    └── icons/             # 图标资源
```

## 二、页面映射方案

### 1. 商户端页面映射

| 当前HTML页面 | 微信小程序页面 | 功能说明 |
|-------------|---------------|---------|
| merchant/register/index.html | pages/merchant/register/register | 商户注册页面，实现3步注册流程 |
| merchant/post-message/index.html | pages/merchant/post-message/post-message | 发布消息页面，实现3步模板化发布 |
| merchant/view-messages/index.html | pages/merchant/view-messages/view-messages | 消息管理页面，查看和回复用户消息 |
| merchant/statistics/index.html | pages/merchant/statistics/statistics | 数据统计页面，展示浏览量、转化率等指标 |

### 2. 居民端页面映射

| 当前HTML页面 | 微信小程序页面 | 功能说明 |
|-------------|---------------|---------|
| resident/view-messages/index.html | pages/resident/view-messages/view-messages | 消息浏览页面，查看商户消息并互动 |

## 三、组件化设计

1. **step-indicator**：步骤指示器组件，用于注册和发布消息的3步流程
2. **message-card**：消息卡片组件，用于展示消息内容，在商户端和居民端共享
3. **stat-card**：统计卡片组件，用于数据统计页面的指标展示

## 四、路由设计

```json
{
  "pages": [
    "pages/index/index",
    "pages/merchant/register/register",
    "pages/merchant/post-message/post-message",
    "pages/merchant/view-messages/view-messages",
    "pages/merchant/statistics/statistics",
    "pages/resident/view-messages/view-messages"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#3b82f6",
    "navigationBarTitleText": "商圈快讯",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "color": "#9ca3af",
    "selectedColor": "#3b82f6",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "assets/icons/home.png",
        "selectedIconPath": "assets/icons/home-active.png"
      },
      {
        "pagePath": "pages/merchant/post-message/post-message",
        "text": "发布",
        "iconPath": "assets/icons/post.png",
        "selectedIconPath": "assets/icons/post-active.png"
      },
      {
        "pagePath": "pages/resident/view-messages/view-messages",
        "text": "消息",
        "iconPath": "assets/icons/message.png",
        "selectedIconPath": "assets/icons/message-active.png"
      }
    ]
  }
}
```

## 五、资源管理

1. **CSS框架**：使用WeUI或Tailwind CSS for WeChat Miniprogram
2. **图表库**：使用wx-charts替代Chart.js，或引入ECharts for Weixin
3. **图标库**：使用微信小程序原生图标或本地引入SVG图标
4. **字体**：使用微信小程序支持的字体，或通过字体图标替代

## 六、数据管理

1. **本地存储**：使用wx.setStorageSync和wx.getStorageSync管理用户信息和缓存数据
2. **网络请求**：使用wx.request替代fetch或XMLHttpRequest
3. **数据绑定**：使用小程序的双数据绑定机制替代DOM操作

## 七、权限管理

1. **用户授权**：使用wx.getSetting和wx.authorize获取必要权限
2. **登录验证**：使用wx.login获取登录凭证，与后端进行身份验证
3. **角色区分**：通过用户信息判断是商户还是居民，显示不同的功能菜单
