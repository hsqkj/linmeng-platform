# 微信小程序组件化改造方案

## 概述

为了提高代码复用性、可维护性和开发效率，将原始web应用中的通用UI元素和功能模块转化为微信小程序组件。

## 组件分类

### 1. 基础UI组件
- StepIndicator：步骤指示器
- Card：通用卡片容器
- Button：自定义按钮
- Input：自定义输入框
- SearchBar：搜索栏组件

### 2. 业务组件
- NewsCard：消息卡片组件
- StatCard：统计卡片组件
- TemplateCard：模板卡片组件
- AppointmentModal：预约弹窗组件
- CommentSection：评论区组件

## 组件详细设计

### 1. StepIndicator（步骤指示器）

**使用场景**：商户注册、消息发布等多步骤流程

**组件结构**：
```
components/
└── StepIndicator/
    ├── StepIndicator.js
    ├── StepIndicator.json
    ├── StepIndicator.wxml
    └── StepIndicator.wxss
```

**属性**：
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| currentStep | Number | 1 | 当前步骤 |
| steps | Array | [] | 步骤列表，每项包含title属性 |

**事件**：
| 事件名 | 参数 | 说明 |
|--------|------|------|
| stepChange | step | 步骤切换时触发 |

**WXML结构**：
```xml
<view class="step-indicator">
  <block wx:for="{{steps}}" wx:key="index">
    <view class="step-item {{index + 1 <= currentStep ? 'active' : ''}}" bindtap="onStepTap" data-step="{{index + 1}}">
      <view class="step-number">{{index + 1}}</view>
      <view class="step-text">{{item.title}}</view>
    </view>
  </block>
</view>
```

**JS实现**：
```javascript
Component({
  properties: {
    currentStep: {
      type: Number,
      value: 1
    },
    steps: {
      type: Array,
      value: []
    }
  },
  methods: {
    onStepTap(e) {
      const step = e.currentTarget.dataset.step;
      this.triggerEvent('stepChange', { step });
    }
  }
});
```

**使用示例**：
```xml
<step-indicator 
  currentStep="{{currentStep}}" 
  steps="{{steps}}" 
  bind:stepChange="onStepChange"
/>
```

```javascript
Page({
  data: {
    currentStep: 1,
    steps: [
      { title: '选择模板' },
      { title: '编辑内容' },
      { title: '发布设置' }
    ]
  },
  onStepChange(e) {
    this.setData({ currentStep: e.detail.step });
  }
});
```

### 2. NewsCard（消息卡片组件）

**使用场景**：居民端消息列表展示

**组件结构**：
```
components/
└── NewsCard/
    ├── NewsCard.js
    ├── NewsCard.json
    ├── NewsCard.wxml
    └── NewsCard.wxss
```

**属性**：
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| post | Object | {} | 消息数据对象 |
| isExpanded | Boolean | false | 是否展开评论区 |

**事件**：
| 事件名 | 参数 | 说明 |
|--------|------|------|
| like | postId | 点赞时触发 |
| comment | postId | 评论时触发 |
| share | postId | 分享时触发 |
| appointment | postId | 预约时触发 |

**使用示例**：
```xml
<news-card 
  post="{{item}}" 
  isExpanded="{{expandedPostId === item.id}}"
  bind:like="onLikePost"
  bind:comment="onCommentPost"
  bind:share="onSharePost"
  bind:appointment="onAppointment"
/>
```

### 3. StatCard（统计卡片组件）

**使用场景**：商户端数据统计页面

**属性**：
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title | String | '' | 统计项名称 |
| value | String | '' | 统计数值 |
| change | Number | 0 | 变化百分比 |
| icon | String | '' | 图标名称 |
| color | String | '#4f46e5' | 主题色 |

**使用示例**：
```xml
<stat-card 
  title="总浏览量" 
  value="12,345" 
  change="15.2" 
  icon="eye" 
  color="#4f46e5"
/>
```

### 4. TemplateCard（模板卡片组件）

**使用场景**：商户端发布消息时选择模板

**属性**：
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| template | Object | {} | 模板数据 |
| isActive | Boolean | false | 是否选中 |

**事件**：
| 事件名 | 参数 | 说明 |
|--------|------|------|
| select | template | 选择模板时触发 |

**使用示例**：
```xml
<template-card 
  template="{{template}}" 
  isActive="{{selectedTemplate === template.id}}"
  bind:select="onTemplateSelect"
/>
```

### 5. AppointmentModal（预约弹窗组件）

**使用场景**：居民端预约服务

**属性**：
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| visible | Boolean | false | 是否显示 |
| postId | String | '' | 关联的消息ID |
| storeName | String | '' | 商家名称 |

**事件**：
| 事件名 | 参数 | 说明 |
|--------|------|------|
| close | - | 关闭弹窗时触发 |
| submit | formData | 提交预约时触发 |

**使用示例**：
```xml
<appointment-modal 
  visible="{{showAppointmentModal}}" 
  postId="{{selectedPostId}}"
  storeName="{{selectedStoreName}}"
  bind:close="onCloseModal"
  bind:submit="onSubmitAppointment"
/>
```

## 组件注册与使用

### 1. 全局注册

在`app.json`中注册全局组件：
```json
{
  "usingComponents": {
    "step-indicator": "components/StepIndicator/StepIndicator",
    "stat-card": "components/StatCard/StatCard",
    "button": "components/Button/Button"
  }
}
```

### 2. 页面注册

在页面的`json`文件中注册页面级组件：
```json
{
  "usingComponents": {
    "news-card": "../../components/NewsCard/NewsCard",
    "appointment-modal": "../../components/AppointmentModal/AppointmentModal"
  }
}
```

## 数据传递与状态管理

### 1. 父子组件通信

**父组件向子组件传递数据**：
```xml
<news-card post="{{item}}" />
```

**子组件向父组件传递事件**：
```javascript
// 子组件
this.triggerEvent('like', { postId: this.data.post.id });

// 父组件
onLikePost(e) {
  const postId = e.detail.postId;
  // 处理点赞逻辑
}
```

### 2. 组件内部状态管理

使用组件的`data`属性管理内部状态：
```javascript
Component({
  data: {
    isExpanded: false,
    showShareOptions: false
  },
  methods: {
    toggleComments() {
      this.setData({ isExpanded: !this.data.isExpanded });
    },
    toggleShare() {
      this.setData({ showShareOptions: !this.data.showShareOptions });
    }
  }
});
```

## 样式设计原则

### 1. 统一设计语言

- 颜色：使用主色调`#4f46e5`（靛蓝）和辅助色`#8b5cf6`（紫色）
- 圆角：统一使用`8rpx`作为基础圆角，卡片使用`16rpx`
- 阴影：使用`0 4rpx 12rpx rgba(0, 0, 0, 0.05)`作为基础阴影

### 2. 响应式设计

使用`rpx`单位实现响应式布局：
```css
.stat-card {
  width: calc(50% - 20rpx);
  padding: 32rpx;
}

@media (max-width: 768px) {
  .stat-card {
    width: 100%;
  }
}
```

### 3. 组件样式隔离

使用组件的`options`属性实现样式隔离：
```javascript
Component({
  options: {
    styleIsolation: 'isolated'
  }
});
```

## 性能优化

### 1. 组件懒加载

对于不常用或较大的组件，使用条件渲染实现懒加载：
```xml
<view wx:if="{{showModal}}">
  <appointment-modal />
</view>
```

### 2. 避免频繁重渲染

- 使用`this.setData()`时，只更新必要的数据
- 避免在循环中使用`this.setData()`
- 使用`virtual-list`处理长列表

### 3. 图片优化

- 使用适当尺寸的图片
- 开启图片懒加载
- 使用WebP格式图片

## 代码示例

### 步骤指示器组件完整实现

**StepIndicator.wxml**：
```xml
<view class="step-indicator">
  <view class="step-item" wx:for="{{steps}}" wx:key="index">
    <view class="step-wrapper" bindtap="onStepTap" data-step="{{index + 1}}">
      <view class="step-number {{index + 1 <= currentStep ? 'active' : ''}}">
        {{index + 1}}
      </view>
      <view class="step-text {{index + 1 <= currentStep ? 'active' : ''}}">
        {{item.title}}
      </view>
    </view>
    <view class="step-line {{index + 1 < currentStep ? 'active' : ''}}" wx:if="{{index < steps.length - 1}}"></view>
  </view>
</view>
```

**StepIndicator.wxss**：
```css
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.step-item {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #e5e7eb;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  font-weight: 600;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.step-number.active {
  background-color: #4f46e5;
  color: white;
}

.step-text {
  font-size: 24rpx;
  color: #6b7280;
  transition: all 0.3s ease;
}

.step-text.active {
  color: #1f2937;
  font-weight: 500;
}

.step-line {
  flex-grow: 1;
  height: 2px;
  background-color: #e5e7eb;
  position: absolute;
  top: 24rpx;
  left: 50%;
  z-index: 1;
  transition: all 0.3s ease;
}

.step-line.active {
  background-color: #4f46e5;
}
```

**StepIndicator.js**：
```javascript
Component({
  options: {
    styleIsolation: 'isolated'
  },
  properties: {
    currentStep: {
      type: Number,
      value: 1
    },
    steps: {
      type: Array,
      value: [
        { title: '第一步' },
        { title: '第二步' },
        { title: '第三步' }
      ]
    }
  },
  methods: {
    onStepTap(e) {
      const step = e.currentTarget.dataset.step;
      if (step <= this.data.steps.length) {
        this.triggerEvent('stepChange', { step });
      }
    }
  }
});
```

**StepIndicator.json**：
```json
{
  "component": true,
  "usingComponents": {}
}
```

## 组件测试与维护

### 1. 测试策略

- 单元测试：使用微信小程序测试框架测试组件功能
- 集成测试：测试组件与页面的交互
- 视觉测试：确保组件在不同设备上的显示效果一致

### 2. 维护规范

- 组件命名：使用PascalCase命名组件
- 代码注释：为组件添加详细的JSDoc注释
- 版本管理：定期更新组件版本，记录变更日志
- 文档更新：及时更新组件文档，保持与代码一致

## 总结

通过组件化改造，可以将原始web应用中的通用功能模块化，提高代码复用性和开发效率。同时，组件化也有助于保持UI的一致性，提升用户体验。在微信小程序环境中，合理使用组件可以有效减少代码冗余，提高应用性能。