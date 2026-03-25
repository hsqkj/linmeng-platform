# WXML与HTML转换方案

## 一、基本标签转换规则

| HTML标签 | WXML标签 | 说明 |
|---------|---------|------|
| `<div>` | `<view>` | 通用容器 |
| `<span>` | `<text>` | 文本容器 |
| `<a>` | `<navigator>` | 导航链接 |
| `<button>` | `<button>` | 按钮 |
| `<input>` | `<input>` | 输入框 |
| `<textarea>` | `<textarea>` | 多行文本输入 |
| `<form>` | `<form>` | 表单 |
| `<img>` | `<image>` | 图片 |
| `<video>` | `<video>` | 视频 |
| `<ul>`, `<ol>` | `<view>` | 列表容器 |
| `<li>` | `<view>` | 列表项 |
| `<table>` | `<view>` | 表格容器 |
| `<tr>` | `<view>` | 表格行 |
| `<td>`, `<th>` | `<view>` | 表格单元格 |

## 二、事件处理转换规则

| HTML事件 | WXML事件 | 说明 |
|---------|---------|------|
| `onclick` | `bindtap` | 点击事件 |
| `onmouseover` | `bindmouseenter` | 鼠标进入事件（小程序支持有限） |
| `onmouseout` | `bindmouseleave` | 鼠标离开事件（小程序支持有限） |
| `onchange` | `bindinput` 或 `bindchange` | 内容改变事件 |
| `onfocus` | `bindfocus` | 获得焦点事件 |
| `onblur` | `bindblur` | 失去焦点事件 |
| `onsubmit` | `bindsubmit` | 表单提交事件 |
| `onreset` | `bindreset` | 表单重置事件 |

## 三、样式类转换规则

1. **Tailwind CSS类名**：
   - 保留大部分Tailwind类名，转换为WXSS支持的格式
   - 需要使用Tailwind CSS for WeChat Miniprogram或手动转换为WXSS
   - 移除小程序不支持的特性（如hover:、focus:等伪类）

2. **自定义类名**：
   - 直接保留，在对应的WXSS文件中重新定义
   - 注意小程序不支持CSS嵌套和部分高级选择器

## 四、特殊元素转换规则

1. **图标**：
   - 移除Lucide图标库的CDN引入
   - 使用小程序原生图标：`<icon type="" size="" color="" />`
   - 或使用本地SVG图标组件
   - 或使用字体图标（如WeUI图标）

2. **表单元素**：
   - 小程序的`<input>`和`<textarea>`有特定的属性要求
   - 需要使用`bindinput`事件获取输入内容
   - 表单提交使用`<form bindsubmit="submitForm">`

3. **媒体元素**：
   - `<image>`标签使用`src`属性
   - 需要设置`mode`属性控制图片显示方式
   - `<video>`标签有特定的属性和事件

4. **模态框**：
   - 使用小程序的`<modal>`组件或自定义组件
   - 或使用`wx.showModal()`API

## 五、数据绑定转换规则

1. **动态内容**：
   - HTML中的动态内容：`<div class="{{className}}">`
   - WXML中的动态内容：`<view class="{{className}}">`

2. **条件渲染**：
   - HTML：通过JavaScript控制display属性
   - WXML：使用`wx:if`和`wx:elif`和`wx:else`

3. **列表渲染**：
   - HTML：通过JavaScript循环生成HTML
   - WXML：使用`wx:for`和`wx:key`

## 六、转换示例

### HTML示例
```html
<div class="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
  <div class="flex items-center">
    <button onclick="window.history.back()" class="mr-4 text-gray-600 hover:text-gray-900">
      <i data-lucide="arrow-left" class="h-6 w-6"></i>
    </button>
    <h1 class="text-xl font-bold text-gray-900">发布营销信息</h1>
  </div>
  <div class="flex items-center space-x-4">
    <button onclick="resetForm()" class="text-gray-600 hover:text-gray-900">
      <i data-lucide="refresh-cw" class="h-5 w-5"></i>
    </button>
    <button onclick="previewPost()" class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
      预览
    </button>
  </div>
</div>
```

### WXML转换示例
```wxml
<view class="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
  <view class="flex items-center">
    <button bindtap="goBack" class="mr-4 text-gray-600">
      <icon type="back" size="24" color="#6b7280"></icon>
    </button>
    <text class="text-xl font-bold text-gray-900">发布营销信息</text>
  </view>
  <view class="flex items-center space-x-4">
    <button bindtap="resetForm" class="text-gray-600">
      <icon type="refresh" size="20" color="#6b7280"></icon>
    </button>
    <button bindtap="previewPost" class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg">
      <text>预览</text>
    </button>
  </view>
</view>
```

## 七、注意事项

1. **不支持的特性**：
   - 小程序不支持iframe
   - 不支持script标签直接嵌入JavaScript
   - 不支持CSS的@import和部分高级选择器
   - 不支持部分HTML5新特性

2. **性能优化**：
   - 避免使用过多的嵌套标签
   - 合理使用wx:for和wx:if
   - 避免在模板中进行复杂的逻辑计算

3. **兼容性处理**：
   - 注意不同版本小程序的特性差异
   - 使用条件编译处理不同版本的兼容性
   - 测试在不同设备上的显示效果

## 八、转换工具推荐

1. **手动转换**：对于小型项目，手动转换更灵活可控
2. **自动化工具**：
   - wxml-compiler：将HTML转换为WXML
   - html2wxml：在线转换工具
   - 自定义脚本：根据项目特点编写转换脚本

## 九、示例转换：商户发布消息页面（部分）

### HTML代码
```html
<div class="step-indicator">
    <div class="step-item active" data-step="1">
        <div class="step-number">1</div>
        <div class="step-text">选择模板</div>
    </div>
    <div class="step-item" data-step="2">
        <div class="step-number">2</div>
        <div class="step-text">编辑内容</div>
    </div>
    <div class="step-item" data-step="3">
        <div class="step-number">3</div>
        <div class="step-text">发布设置</div>
    </div>
</div>
```

### WXML转换
```wxml
<view class="step-indicator">
    <view class="step-item active" data-step="1" bindtap="goToStep" data-stepnum="1">
        <view class="step-number">1</view>
        <view class="step-text">选择模板</view>
    </view>
    <view class="step-item" data-step="2" bindtap="goToStep" data-stepnum="2">
        <view class="step-number">2</view>
        <view class="step-text">编辑内容</view>
    </view>
    <view class="step-item" data-step="3" bindtap="goToStep" data-stepnum="3">
        <view class="step-number">3</view>
        <view class="step-text">发布设置</view>
    </view>
</view>
```

### WXSS转换
```wxss
.step-indicator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
}
.step-item {
    flex: 1;
    text-align: center;
    position: relative;
}
.step-item::after {
    content: '';
    position: absolute;
    top: 12px;
    left: 100%;
    width: 100%;
    height: 2px;
    background-color: #e5e7eb;
    z-index: 1;
}
.step-item:last-child::after {
    display: none;
}
.step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #e5e7eb;
    color: #6b7280;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 4px;
    position: relative;
    z-index: 2;
}
.step-item.active .step-number {
    background-color: #4f46e5;
    color: white;
}
.step-text {
    font-size: 0.875rem;
    color: #6b7280;
}
.step-item.active .step-text {
    color: #1f2937;
    font-weight: 500;
}
```

## 十、表单转换特殊处理

1. **表单提交**：
   - HTML：`onsubmit="submitForm"`
   - WXML：`bindsubmit="submitForm"`

2. **输入框**：
   - HTML：`oninput="handleInput"`
   - WXML：`bindinput="handleInput"`

3. **文件上传**：
   - HTML：`<input type="file" onchange="handleFileUpload">`
   - WXML：使用`wx.chooseImage()`或`wx.chooseMedia()`API

4. **单选和多选**：
   - HTML：`<input type="radio">`和`<input type="checkbox">`
   - WXML：使用`<radio-group>`和`<radio>`，`<checkbox-group>`和`<checkbox>`
