# 邻盟营销助手 - API接口文档

## 文档信息
- **版本**: v1.0.0
- **创建时间**: 2026-03-09
- **接口协议**: RESTful API
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 基础信息

### 基础URL
```
开发环境: http://localhost:8000/api/v1
测试环境: http://test-api.neighbor-alliance.com/api/v1
生产环境: https://api.neighbor-alliance.com/api/v1
```

### 请求头
```http
Content-Type: application/json
Authorization: Bearer {token}
X-Request-ID: {uuid}
```

### 响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1710000000000
}
```

### 状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 接口列表

### 1. 认证模块

#### 1.1 商家注册
- **接口**: `POST /auth/merchant/register`
- **描述**: 商家注册账号
- **请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456",
  "verifyCode": "123456",
  "shopName": "鲜果时光",
  "industry": "生鲜",
  "address": "幸福社区底商A栋101",
  "businessHours": "08:00-22:00",
  "description": "专注社区生鲜配送"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "merchantId": 10001,
    "name": "鲜果时光",
    "phone": "13800138000"
  }
}
```

#### 1.2 商家登录
- **接口**: `POST /auth/merchant/login`
- **描述**: 商家账号登录
- **请求参数**:
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "merchant": {
      "id": 10001,
      "name": "鲜果时光",
      "phone": "13800138000",
      "avatar": "https://...",
      "industry": "生鲜",
      "address": "幸福社区底商A栋101"
    }
  }
}
```

#### 1.3 商家退出登录
- **接口**: `POST /auth/merchant/logout`
- **描述**: 退出当前登录
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

#### 1.4 发送验证码
- **接口**: `POST /auth/send-verify-code`
- **描述**: 发送手机验证码
- **请求参数**:
```json
{
  "phone": "13800138000",
  "type": "register"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "expireSeconds": 300
  }
}
```

#### 1.5 刷新Token
- **接口**: `POST /auth/refresh-token`
- **描述**: 刷新访问令牌
- **请求头**: `Authorization: Bearer {refreshToken}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expireAt": 1710003600000
  }
}
```

---

### 2. 商家模块

#### 2.1 获取商家信息
- **接口**: `GET /merchant/profile`
- **描述**: 获取当前登录商家信息
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 10001,
    "name": "鲜果时光",
    "phone": "13800138000",
    "avatar": "https://...",
    "industry": "生鲜",
    "address": "幸福社区底商A栋101",
    "businessHours": "08:00-22:00",
    "description": "专注社区生鲜配送",
    "rating": 4.8,
    "ratingCount": 128,
    "createTime": "2026-03-09T10:00:00Z"
  }
}
```

#### 2.2 更新商家信息
- **接口**: `PUT /merchant/profile`
- **描述**: 更新商家信息
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "name": "鲜果时光",
  "avatar": "https://...",
  "industry": "生鲜",
  "address": "幸福社区底商A栋101",
  "businessHours": "08:00-22:00",
  "description": "专注社区生鲜配送"
}
```

#### 2.3 修改密码
- **接口**: `PUT /merchant/password`
- **描述**: 修改登录密码
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

#### 2.4 获取商家列表
- **接口**: `GET /merchants`
- **描述**: 获取商家列表（用户端）
- **请求参数**:
  - `industry`: 行业筛选（可选）
  - `keyword`: 关键词搜索（可选）
  - `page`: 页码，默认1
  - `pageSize`: 每页数量，默认20
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10001,
        "name": "鲜果时光",
        "avatar": "https://...",
        "industry": "生鲜",
        "address": "幸福社区底商A栋101",
        "rating": 4.8,
        "distance": 0.5
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 2.5 获取商家详情
- **接口**: `GET /merchants/{merchantId}`
- **描述**: 获取商家详细信息
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 10001,
    "name": "鲜果时光",
    "phone": "13800138000",
    "avatar": "https://...",
    "industry": "生鲜",
    "address": "幸福社区底商A栋101",
    "businessHours": "08:00-22:00",
    "description": "专注社区生鲜配送",
    "rating": 4.8,
    "ratingCount": 128,
    "services": ["水果", "蔬菜", "配送"],
    "images": ["https://...", "https://..."]
  }
}
```

---

### 3. 营销模板模块

#### 3.1 获取模板列表
- **接口**: `GET /templates`
- **描述**: 获取所有营销模板
- **请求参数**:
  - `category`: 分类筛选（可选）
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "code": "new-store",
      "name": "新店开业",
      "category": "promotion",
      "icon": "store",
      "titleTemplate": "【新店开业】欢迎到店，开业大礼等您来",
      "contentTemplate": "🎉 好消息！本店新开业啦！...",
      "description": "适用于新店开业宣传"
    }
  ]
}
```

#### 3.2 获取模板详情
- **接口**: `GET /templates/{templateId}`
- **描述**: 获取指定模板详情

---

### 4. 活动模块

#### 4.1 创建活动
- **接口**: `POST /activities`
- **描述**: 创建新的营销活动
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "templateId": 1,
  "title": "【新店开业】欢迎到店，开业大礼等您来",
  "content": "🎉 好消息！本店新开业啦！...",
  "media": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "channels": ["community", "moments"]
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "activityId": 10001,
    "status": "draft"
  }
}
```

#### 4.2 发布活动
- **接口**: `POST /activities/{activityId}/publish`
- **描述**: 发布活动
- **请求头**: `Authorization: Bearer {token}`

#### 4.3 获取活动列表
- **接口**: `GET /activities`
- **描述**: 获取活动列表
- **请求参数**:
  - `merchantId`: 商家ID（可选）
  - `status`: 状态筛选（可选）
  - `page`: 页码
  - `pageSize`: 每页数量
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10001,
        "merchantId": 10001,
        "merchantName": "鲜果时光",
        "merchantAvatar": "https://...",
        "title": "【新店开业】欢迎到店...",
        "content": "🎉 好消息！...",
        "media": ["https://..."],
        "status": 1,
        "viewCount": 128,
        "likeCount": 32,
        "shareCount": 8,
        "createTime": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 4.4 获取活动详情
- **接口**: `GET /activities/{activityId}`
- **描述**: 获取活动详细信息
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 10001,
    "merchantId": 10001,
    "merchantName": "鲜果时光",
    "merchantAvatar": "https://...",
    "merchantPhone": "13800138000",
    "merchantAddress": "幸福社区底商A栋101",
    "title": "【新店开业】欢迎到店...",
    "content": "🎉 好消息！...",
    "media": ["https://..."],
    "status": 1,
    "viewCount": 128,
    "likeCount": 32,
    "shareCount": 8,
    "commentCount": 5,
    "isLiked": false,
    "isCollected": false,
    "createTime": "2026-03-09T10:00:00Z"
  }
}
```

#### 4.5 更新活动
- **接口**: `PUT /activities/{activityId}`
- **描述**: 更新活动信息
- **请求头**: `Authorization: Bearer {token}`

#### 4.6 删除活动
- **接口**: `DELETE /activities/{activityId}`
- **描述**: 删除活动
- **请求头**: `Authorization: Bearer {token}`

#### 4.7 点赞活动
- **接口**: `POST /activities/{activityId}/like`
- **描述**: 点赞/取消点赞活动
- **请求头**: `Authorization: Bearer {token}`

#### 4.8 分享活动
- **接口**: `POST /activities/{activityId}/share`
- **描述**: 分享活动
- **请求头**: `Authorization: Bearer {token}`

---

### 5. 草稿模块

#### 5.1 保存草稿
- **接口**: `POST /drafts`
- **描述**: 保存草稿
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "templateId": 1,
  "title": "草稿标题",
  "content": "草稿内容...",
  "media": ["https://..."],
  "channels": ["community"]
}
```

#### 5.2 获取草稿列表
- **接口**: `GET /drafts`
- **描述**: 获取草稿列表
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 10001,
      "templateId": 1,
      "templateName": "新店开业",
      "title": "草稿标题",
      "content": "草稿内容...",
      "mediaCount": 2,
      "updateTime": "2026-03-09T10:00:00Z"
    }
  ]
}
```

#### 5.3 获取草稿详情
- **接口**: `GET /drafts/{draftId}`
- **描述**: 获取草稿详情
- **请求头**: `Authorization: Bearer {token}`

#### 5.4 更新草稿
- **接口**: `PUT /drafts/{draftId}`
- **描述**: 更新草稿
- **请求头**: `Authorization: Bearer {token}`

#### 5.5 删除草稿
- **接口**: `DELETE /drafts/{draftId}`
- **描述**: 删除草稿
- **请求头**: `Authorization: Bearer {token}`

---

### 6. 订单模块

#### 6.1 创建订单
- **接口**: `POST /orders`
- **描述**: 创建订单
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "activityId": 10001,
  "serviceName": "新鲜水果套餐",
  "price": 99.00,
  "quantity": 1,
  "remark": "请尽快配送",
  "contactName": "张三",
  "contactPhone": "13800138000",
  "contactAddress": "幸福小区3号楼101",
  "appointmentTime": "2026-03-10T14:00:00Z"
}
```

#### 6.2 获取订单列表
- **接口**: `GET /orders`
- **描述**: 获取订单列表
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  - `status`: 状态筛选（可选）
  - `type`: user/merchant（可选，默认为user）
  - `page`: 页码
  - `pageSize`: 每页数量
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10001,
        "orderNo": "ORD202603090001",
        "merchantId": 10001,
        "merchantName": "鲜果时光",
        "merchantAvatar": "https://...",
        "serviceName": "新鲜水果套餐",
        "price": 99.00,
        "quantity": 1,
        "totalAmount": 99.00,
        "status": 0,
        "remark": "请尽快配送",
        "contactName": "张三",
        "contactPhone": "13800138000",
        "contactAddress": "幸福小区3号楼101",
        "appointmentTime": "2026-03-10T14:00:00Z",
        "createTime": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 6.3 获取订单详情
- **接口**: `GET /orders/{orderId}`
- **描述**: 获取订单详情
- **请求头**: `Authorization: Bearer {token}`

#### 6.4 更新订单状态
- **接口**: `PUT /orders/{orderId}/status`
- **描述**: 更新订单状态
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "status": 1
}
```

#### 6.5 取消订单
- **接口**: `POST /orders/{orderId}/cancel`
- **描述**: 取消订单
- **请求头**: `Authorization: Bearer {token}`

---

### 7. 收藏模块

#### 7.1 添加收藏
- **接口**: `POST /collections`
- **描述**: 收藏活动
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "activityId": 10001
}
```

#### 7.2 取消收藏
- **接口**: `DELETE /collections/{activityId}`
- **描述**: 取消收藏
- **请求头**: `Authorization: Bearer {token}`

#### 7.3 获取收藏列表
- **接口**: `GET /collections`
- **描述**: 获取收藏列表
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  - `page`: 页码
  - `pageSize`: 每页数量
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10001,
        "activityId": 10001,
        "title": "【新店开业】欢迎到店...",
        "merchantName": "鲜果时光",
        "merchantAvatar": "https://...",
        "createTime": "2026-03-09T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 7.4 检查是否已收藏
- **接口**: `GET /collections/{activityId}/check`
- **描述**: 检查活动是否已收藏
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "isCollected": true
  }
}
```

---

### 8. 咨询模块

#### 8.1 创建咨询
- **接口**: `POST /consultations`
- **描述**: 创建咨询
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "merchantId": 10001,
  "activityId": 10001,
  "content": "请问这个套餐包含哪些水果？"
}
```

#### 8.2 获取咨询列表
- **接口**: `GET /consultations`
- **描述**: 获取咨询列表
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  - `type`: user/merchant（可选，默认为user）
  - `status`: 状态筛选（可选）
  - `page`: 页码
  - `pageSize`: 每页数量

#### 8.3 回复咨询
- **接口**: `POST /consultations/{consultationId}/reply`
- **描述**: 回复咨询（商家）
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "content": "您好，这个套餐包含苹果、香蕉、橙子等..."
}
```

---

### 9. 数据统计模块

#### 9.1 获取商家统计
- **接口**: `GET /statistics/merchant`
- **描述**: 获取商家统计数据
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  - `startDate`: 开始日期
  - `endDate`: 结束日期
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "overview": {
      "totalViews": 1280,
      "totalLikes": 256,
      "totalShares": 64,
      "totalComments": 32,
      "totalOrders": 16,
      "totalAmount": 1580.00
    },
    "trend": [
      {
        "date": "2026-03-01",
        "views": 100,
        "likes": 20,
        "orders": 2
      }
    ],
    "activities": [
      {
        "activityId": 10001,
        "title": "【新店开业】...",
        "views": 500,
        "likes": 100,
        "orders": 8
      }
    ]
  }
}
```

#### 9.2 获取活动统计
- **接口**: `GET /statistics/activities/{activityId}`
- **描述**: 获取活动统计数据
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
  - `startDate`: 开始日期
  - `endDate`: 结束日期

---

### 10. AI模块

#### 10.1 内容优化
- **接口**: `POST /ai/optimize`
- **描述**: AI优化营销内容
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "content": "本店新开业，欢迎光临",
  "options": {
    "fluency": true,
    "marketing": true,
    "community": true,
    "compliance": true
  }
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "original": "本店新开业，欢迎光临",
    "optimized": "🎉 好消息！本店新开业啦！期待您的光临，开业期间优惠多多！",
    "optimizations": [
      {
        "type": "fluency",
        "name": "语句通顺度",
        "score": 85,
        "improved": "..."
      },
      {
        "type": "marketing",
        "name": "营销吸引力",
        "score": 90,
        "improved": "..."
      }
    ]
  }
}
```

#### 10.2 生成标题
- **接口**: `POST /ai/generate-title`
- **描述**: AI生成营销标题
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "content": "本店新开业，主营新鲜水果",
  "count": 3
}
```

---

### 11. 文件模块

#### 11.1 上传文件
- **接口**: `POST /files/upload`
- **描述**: 上传文件
- **请求头**: 
  - `Authorization: Bearer {token}`
  - `Content-Type: multipart/form-data`
- **请求参数**:
  - `file`: 文件
  - `type`: 文件类型（image/video）
- **响应数据**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/images/xxx.jpg",
    "name": "image.jpg",
    "size": 1024000
  }
}
```

---

## 附录

### A. 错误码对照表

| 错误码 | 说明 |
|--------|------|
| 10001 | 参数错误 |
| 10002 | 未授权 |
| 10003 | 禁止访问 |
| 10004 | 资源不存在 |
| 20001 | 手机号已注册 |
| 20002 | 手机号未注册 |
| 20003 | 密码错误 |
| 20004 | 验证码错误 |
| 20005 | 验证码已过期 |
| 30001 | 活动不存在 |
| 30002 | 活动已下架 |
| 40001 | 订单不存在 |
| 40002 | 订单状态错误 |

### B. 状态码对照表

#### 活动状态
| 状态码 | 说明 |
|--------|------|
| 0 | 草稿 |
| 1 | 已发布 |
| 2 | 已下架 |

#### 订单状态
| 状态码 | 说明 |
|--------|------|
| 0 | 待处理 |
| 1 | 已确认 |
| 2 | 已完成 |
| 3 | 已取消 |

#### 咨询状态
| 状态码 | 说明 |
|--------|------|
| 0 | 待回复 |
| 1 | 已回复 |

### C. 行业分类

- 生鲜
- 餐饮
- 零售
- 美容
- 家政
- 教育
- 医疗
- 其他

---

**文档结束**
