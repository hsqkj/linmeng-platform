# 微信小程序测试与调试策略

## 概述

本文档提供微信小程序开发过程中的测试与调试策略，确保代码质量和用户体验。

## 开发环境准备

### 1. 微信开发者工具

- **版本要求**：最新稳定版
- **配置项**：
  - 开启调试模式
  - 选择合适的基础库版本（建议使用最新的稳定版）
  - 配置项目信息（AppID、名称、目录等）

### 2. 调试基础设置

在项目根目录的 `project.config.json` 中配置调试选项：

```json
{
  "description": "项目配置文件",
  "packOptions": {},
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": true,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "showES6CompileOption": false,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showSettingPanel": true
  },
  "compileType": "miniprogram",
  "libVersion": "2.24.2",
  "appid": "your-app-id",
  "projectname": "business-district-news",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "isGameTourist": false,
  "simulatorType": "wechat",
  "simulatorPluginLibVersion": {},
  "condition": {}  
}
```

## 调试方法

### 1. 控制台调试

使用 `console.log()` 输出调试信息：

```javascript
// 在组件或页面的JS文件中
Page({
  onLoad() {
    console.log('页面加载完成');
    console.log('当前页面参数:', this.options);
  },
  onLikePost(e) {
    console.log('点赞事件:', e.detail);
  }
});
```

### 2. 断点调试

在微信开发者工具中设置断点：

1. 打开需要调试的JS文件
2. 点击行号左侧设置断点
3. 运行小程序触发断点
4. 可以查看变量值、调用栈等信息

### 3. 网络请求调试

在微信开发者工具的「Network」面板中查看网络请求：

```javascript
// 使用wx.request发送请求
wx.request({
  url: 'https://api.example.com/posts',
  method: 'GET',
  success(res) {
    console.log('请求成功:', res.data);
  },
  fail(err) {
    console.error('请求失败:', err);
  }
});
```

### 4. 数据存储调试

在微信开发者工具的「Storage」面板中查看本地存储数据：

```javascript
// 使用wx.setStorageSync存储数据
wx.setStorageSync('userInfo', {
  name: '张三',
  phone: '13800138000'
});

// 使用wx.getStorageSync获取数据
const userInfo = wx.getStorageSync('userInfo');
console.log('本地存储的用户信息:', userInfo);
```

### 5. 组件调试

在组件的JS文件中添加调试信息：

```javascript
Component({
  properties: {
    post: Object
  },
  attached() {
    console.log('组件挂载完成:', this.properties.post);
  },
  methods: {
    onLike() {
      console.log('点赞方法被调用');
      this.triggerEvent('like', { postId: this.properties.post.id });
    }
  }
});
```

## 测试策略

### 1. 单元测试

使用微信小程序测试框架进行单元测试：

```javascript
// test/step-indicator-test.js
const { expect } = require('chai');
const StepIndicator = require('../components/StepIndicator/StepIndicator');

describe('StepIndicator Component', () => {
  it('should render correct steps', () => {
    const steps = [{ title: '第一步' }, { title: '第二步' }, { title: '第三步' }];
    const component = new StepIndicator({
      properties: {
        steps,
        currentStep: 2
      }
    });
    expect(component.data.steps.length).to.equal(3);
    expect(component.data.currentStep).to.equal(2);
  });
});
```

### 2. 集成测试

测试组件与页面的交互：

```javascript
// test/post-page-test.js
const { expect } = require('chai');
const PostPage = require('../pages/merchant/post-message/post-message');

describe('Post Message Page', () => {
  it('should switch template correctly', () => {
    const page = new PostPage();
    const template = { id: 1, name: '促销模板', type: 'promotion' };
    
    page.onTemplateSelect({ detail: template });
    expect(page.data.selectedTemplate).to.equal(template.id);
  });
});
```

### 3. 功能测试

手动测试主要功能流程：

#### 商户端功能测试

1. **注册流程**
   - 填写注册信息
   - 上传营业执照
   - 提交审核
   - 验证注册成功提示

2. **消息发布流程**
   - 选择模板
   - 编辑内容
   - 设置发布信息
   - 提交发布
   - 验证发布成功提示

3. **数据统计功能**
   - 查看浏览量、点赞数、评论数
   - 查看趋势图、饼图、柱状图
   - 验证数据显示正确性

#### 居民端功能测试

1. **消息列表**
   - 查看消息列表
   - 下拉刷新
   - 上拉加载更多
   - 验证消息显示正确性

2. **消息详情**
   - 查看消息详情
   - 点赞功能
   - 评论功能
   - 分享功能
   - 预约功能

3. **个人中心**
   - 查看个人信息
   - 修改个人设置
   - 查看预约记录

### 4. 性能测试

使用微信开发者工具的「Performance」面板进行性能测试：

1. **首屏加载时间**：确保在3秒内完成
2. **页面切换时间**：确保在500毫秒内完成
3. **资源加载**：图片、脚本等资源的加载时间
4. **内存占用**：确保内存使用合理

### 5. 兼容性测试

在不同设备和基础库版本上测试：

1. **设备覆盖**：
   - iOS设备（iPhone 6及以上）
   - Android设备（主流品牌和型号）
   - 不同屏幕尺寸

2. **基础库版本**：
   - 最新稳定版
   - 前两个主要版本

3. **微信版本**：
   - 最新稳定版
   - 前两个主要版本

## 常见问题与解决方案

### 1. 页面跳转失败

**问题**：使用 `wx.navigateTo` 跳转页面失败

**解决方案**：
- 检查页面路径是否正确
- 检查是否超过了页面栈限制（最多10层）
- 使用 `wx.switchTab` 跳转到tabBar页面

### 2. 数据传递失败

**问题**：父子组件数据传递失败

**解决方案**：
- 检查属性名称是否一致
- 检查数据类型是否正确
- 使用 `this.triggerEvent` 触发事件时检查参数是否正确

### 3. 样式显示异常

**问题**：WXSS样式显示异常

**解决方案**：
- 检查选择器是否正确
- 检查样式属性是否支持（参考微信小程序官方文档）
- 检查样式隔离设置

### 4. 网络请求失败

**问题**：使用 `wx.request` 请求失败

**解决方案**：
- 检查网络是否正常
- 检查URL是否正确
- 检查请求参数是否正确
- 检查是否配置了合法域名

### 5. 本地存储失败

**问题**：使用 `wx.setStorageSync` 存储失败

**解决方案**：
- 检查存储数据大小是否超过限制（单个key不超过1MB，总大小不超过10MB）
- 检查数据格式是否正确

## 代码规范

### 1. 文件命名规范

- 组件文件：使用PascalCase命名（如 `StepIndicator.wxml`）
- 页面文件：使用kebab-case命名（如 `post-message.js`）
- 工具函数文件：使用camelCase命名（如 `requestUtil.js`）

### 2. 代码格式规范

- 使用ES6语法
- 缩进使用2个空格
- 每行不超过100个字符
- 函数名使用camelCase命名
- 常量使用UPPER_CASE命名

### 3. 注释规范

- 页面和组件的JS文件顶部添加功能说明
- 复杂逻辑添加注释
- 函数参数和返回值添加注释

## 版本控制

使用Git进行版本控制，遵循以下规范：

### 1. 分支管理

- `master`：主分支，用于发布生产版本
- `develop`：开发分支，用于集成开发
- `feature/xxx`：功能分支，用于开发新功能
- `bugfix/xxx`：修复分支，用于修复bug

### 2. 提交规范

提交信息格式：

```
<类型>: <描述>

<详细说明>（可选）
```

类型包括：
- `feat`：新功能
- `fix`：修复bug
- `docs`：文档更新
- `style`：代码格式调整
- `refactor`：代码重构
- `test`：测试代码
- `chore`：构建或配置文件更新

## 总结

通过合理的测试与调试策略，可以确保微信小程序的质量和用户体验。在开发过程中，应结合使用控制台调试、断点调试、网络请求调试等方法，同时进行单元测试、集成测试、功能测试、性能测试和兼容性测试，以确保代码的正确性和稳定性。