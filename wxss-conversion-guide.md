# WXSS与Tailwind CSS转换方案

## 一、Tailwind CSS基本类转换规则

| Tailwind类 | WXSS等价样式 | 说明 |
|-----------|-------------|------|
| `w-full` | `width: 100%;` | 宽度100% |
| `h-full` | `height: 100%;` | 高度100% |
| `h-24` | `height: 6rem;` | 固定高度 |
| `p-4` | `padding: 1rem;` | 内边距 |
| `pt-5` | `padding-top: 1.25rem;` | 上内边距 |
| `pb-6` | `padding-bottom: 1.5rem;` | 下内边距 |
| `px-4` | `padding-left: 1rem; padding-right: 1rem;` | 左右内边距 |
| `py-3` | `padding-top: 0.75rem; padding-bottom: 0.75rem;` | 上下内边距 |
| `m-4` | `margin: 1rem;` | 外边距 |
| `mb-3` | `margin-bottom: 0.75rem;` | 下外边距 |
| `mb-6` | `margin-bottom: 1.5rem;` | 下外边距 |
| `flex` | `display: flex;` | 弹性布局 |
| `flex-col` | `flex-direction: column;` | 垂直弹性布局 |
| `items-center` | `align-items: center;` | 垂直居中 |
| `justify-center` | `justify-content: center;` | 水平居中 |
| `justify-between` | `justify-content: space-between;` | 两端对齐 |
| `grid` | `display: grid;` | 网格布局 |
| `grid-cols-2` | `grid-template-columns: repeat(2, minmax(0, 1fr));` | 2列网格 |
| `gap-4` | `gap: 1rem;` | 网格间距 |
| `rounded-lg` | `border-radius: 0.5rem;` | 圆角 |
| `rounded-xl` | `border-radius: 0.75rem;` | 大圆角 |
| `rounded-full` | `border-radius: 9999px;` | 圆形 |
| `border` | `border: 1px solid #e5e7eb;` | 边框 |
| `border-2` | `border-width: 2px;` | 2px边框 |
| `border-gray-300` | `border-color: #d1d5db;` | 灰色边框 |
| `bg-white` | `background-color: #ffffff;` | 白色背景 |
| `bg-gray-50` | `background-color: #f9fafb;` | 浅灰色背景 |
| `text-gray-600` | `color: #4b5563;` | 灰色文本 |
| `text-gray-700` | `color: #374151;` | 深灰色文本 |
| `text-gray-900` | `color: #111827;` | 黑色文本 |
| `text-white` | `color: #ffffff;` | 白色文本 |
| `font-semibold` | `font-weight: 600;` | 半粗体 |
| `font-medium` | `font-weight: 500;` | 中粗体 |
| `text-sm` | `font-size: 0.875rem; line-height: 1.25rem;` | 小字体 |
| `text-base` | `font-size: 1rem; line-height: 1.5rem;` | 基础字体 |
| `text-lg` | `font-size: 1.125rem; line-height: 1.75rem;` | 大字体 |
| `text-xl` | `font-size: 1.25rem; line-height: 1.75rem;` | 特大字体 |
| `shadow-md` | `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);` | 中等阴影 |
| `shadow-sm` | `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);` | 小阴影 |
| `transition-colors` | `transition: color 0.2s, background-color 0.2s, border-color 0.2s, text-decoration-color 0.2s, fill 0.2s, stroke 0.2s;` | 颜色过渡 |

## 二、渐变效果转换规则

| Tailwind渐变类 | WXSS等价样式 | 说明 |
|---------------|-------------|------|
| `bg-gradient-to-r from-orange-400 to-red-500` | `background: linear-gradient(90deg, #f97316 0%, #ef4444 100%);` | 从左到右的橙色到红色渐变 |
| `bg-gradient-to-r from-blue-400 to-indigo-500` | `background: linear-gradient(90deg, #60a5fa 0%, #6366f1 100%);` | 从左到右的蓝色到靛蓝色渐变 |
| `bg-gradient-to-br from-indigo-50 to-purple-50` | `background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%);` | 从左上到右下的靛蓝色到紫色渐变 |

## 三、响应式设计转换规则

| Tailwind响应式类 | WXSS等价样式 | 说明 |
|----------------|-------------|------|
| `md:flex` | `@media (min-width: 768px) { display: flex; }` | 中等屏幕以上使用flex布局 |
| `lg:col-span-2` | `@media (min-width: 1024px) { grid-column: span 2; }` | 大屏幕以上占据2列 |
| `md:flex-row` | `@media (min-width: 768px) { flex-direction: row; }` | 中等屏幕以上使用水平flex布局 |

## 四、交互效果转换规则

| Tailwind交互类 | WXSS等价样式 | 说明 |
|---------------|-------------|------|
| `hover:border-indigo-400` | `.class:hover { border-color: #818cf8; }` | 鼠标悬停时边框变色 |
| `hover:bg-gray-100` | `.class:hover { background-color: #f3f4f6; }` | 鼠标悬停时背景变色 |
| `focus:outline-none` | `.class:focus { outline: 0; }` | 获得焦点时无边框 |
| `focus:ring-2 focus:ring-indigo-500` | `.class:focus { box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5); }` | 获得焦点时的环效果 |
| `cursor-pointer` | `cursor: pointer;` | 指针光标 |

## 五、自定义CSS转换规则

1. **保留原有自定义CSS**：
   - 将HTML中`<style>`标签内的自定义CSS复制到对应的WXSS文件中
   - 调整不兼容的CSS属性（如`cursor: pointer`在小程序中是兼容的）

2. **特殊选择器转换**：
   - 将`.step-item.active`转换为`.step-item.active`（保持不变）
   - 将`.template-card:hover`转换为`.template-card:hover`（保持不变）
   - 将`::after`伪元素转换为`::after`（保持不变）

3. **变量使用**：
   - 小程序支持CSS变量，可以将常用颜色定义为变量
   - 例如：`--primary-color: #4f46e5;`

## 六、转换工具与方法

1. **手动转换**：
   - 适合小型项目或需要精确控制的场景
   - 逐个将Tailwind类转换为对应的WXSS样式

2. **自动化工具**：
   - **Tailwind CSS for WeChat Miniprogram**：专门为小程序优化的Tailwind版本
   - **WXSS Compiler**：将Tailwind CSS编译为WXSS
   - **自定义脚本**：根据项目特点编写转换脚本

3. **混合方案**：
   - 使用Tailwind CSS编译出基础样式
   - 手动调整不兼容的部分
   - 保留自定义CSS

## 七、转换示例

### HTML中的Tailwind代码
```html
<div class="template-card grid grid-cols-2 gap-4">
    <div class="h-24 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg mb-3 flex items-center justify-center">
        <i data-lucide="percent" class="h-12 w-12 text-white"></i>
    </div>
    <h3 class="font-semibold text-gray-900">促销活动</h3>
    <p class="text-sm text-gray-600">全场低至5折</p>
</div>
```

### WXML转换后
```wxml
<view class="template-card grid grid-cols-2 gap-4">
    <view class="h-24 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg mb-3 flex items-center justify-center">
        <icon class="h-12 w-12 text-white" type="success" size="48"></icon>
    </view>
    <text class="font-semibold text-gray-900">促销活动</text>
    <text class="text-sm text-gray-600">全场低至5折</text>
</view>
```

### WXSS转换后
```wxss
/* Tailwind类转换 */
.grid {
    display: grid;
}
.grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
.gap-4 {
    gap: 1rem;
}
.h-24 {
    height: 6rem;
}
.bg-gradient-to-r.from-orange-400.to-red-500 {
    background: linear-gradient(90deg, #f97316 0%, #ef4444 100%);
}
.rounded-lg {
    border-radius: 0.5rem;
}
.mb-3 {
    margin-bottom: 0.75rem;
}
.flex {
    display: flex;
}
.items-center {
    align-items: center;
}
.justify-center {
    justify-content: center;
}
.h-12 {
    height: 3rem;
}
.w-12 {
    width: 3rem;
}
.text-white {
    color: #ffffff;
}
.font-semibold {
    font-weight: 600;
}
.text-gray-900 {
    color: #111827;
}
.text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
}
.text-gray-600 {
    color: #4b5563;
}

/* 自定义样式 */
.template-card {
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}
.template-card:hover {
    border-color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.1), 0 10px 10px -5px rgba(79, 70, 229, 0.04);
}
.template-card.active {
    border-color: #4f46e5;
    background-color: #f0f9ff;
}
```

## 八、注意事项

1. **不支持的特性**：
   - 小程序不支持`content-visibility`属性
   - 不支持`will-change`属性
   - 不支持部分CSS动画和过渡效果

2. **性能优化**：
   - 避免使用过多的CSS类名
   - 合并重复的样式规则
   - 减少使用`!important`

3. **兼容性处理**：
   - 注意不同版本小程序的CSS支持差异
   - 测试在不同设备上的显示效果

4. **文件结构**：
   - 每个页面对应一个WXSS文件
   - 全局样式放在app.wxss中
   - 组件样式放在组件的WXSS文件中

## 九、渐变效果转换示例

### HTML中的渐变代码
```html
<div class="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
    <!-- 内容 -->
</div>
```

### WXSS转换后
```wxss
.bg-gradient-to-br.from-indigo-50.to-purple-50 {
    background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%);
}
.min-h-screen {
    min-height: 100vh;
}
```

## 十、表单样式转换示例

### HTML中的表单代码
```html
<input type="text" id="post-title" name="post-title" required class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="请输入吸引人的标题">
```

### WXSS转换后
```wxss
.w-full {
    width: 100%;
}
.px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
}
.py-3 {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
}
.border {
    border: 1px solid #e5e7eb;
}
.border-gray-300 {
    border-color: #d1d5db;
}
.rounded-lg {
    border-radius: 0.5rem;
}
.shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.focus\:outline-none:focus {
    outline: 0;
}
.focus\:ring-2:focus {
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}
.focus\:ring-indigo-500:focus {
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}
.focus\:border-indigo-500:focus {
    border-color: #6366f1;
}
```

## 十一、推荐工具

1. **Tailwind CSS for WeChat Miniprogram**：
   - 项目地址：https://github.com/sonofmagic/weapp-tailwindcss
   - 支持大部分Tailwind CSS特性
   - 自动转换为小程序兼容的WXSS

2. **WXSS转换工具**：
   - 在线转换：https://wxss-converter.com/
   - 本地转换：使用Node.js编写转换脚本

3. **样式提取工具**：
   - PurgeCSS：提取使用的CSS类
   - PostCSS：处理CSS转换
