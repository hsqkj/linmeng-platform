# JavaScript逻辑与API转换方案

## 一、基本转换规则

| Web API | 微信小程序API | 说明 |
|---------|-------------|------|
| `fetch()` | `wx.request()` | 网络请求 |
| `localStorage.setItem()` | `wx.setStorageSync()` | 本地存储 |
| `localStorage.getItem()` | `wx.getStorageSync()` | 本地存储读取 |
| `localStorage.removeItem()` | `wx.removeStorageSync()` | 本地存储删除 |
| `localStorage.clear()` | `wx.clearStorageSync()` | 清除本地存储 |
| `window.location.href` | `wx.navigateTo()` 或 `wx.switchTab()` | 页面跳转 |
| `window.history.back()` | `wx.navigateBack()` | 返回上一页 |
| `document.getElementById()` | 数据绑定或 `this.selectComponent()` | DOM操作 |
| `alert()` | `wx.showToast()` 或 `wx.showModal()` | 消息提示 |
| `confirm()` | `wx.showModal()` | 确认对话框 |
| `console.log()` | `console.log()` | 日志输出 |
| `Date()` | `new Date()` | 日期处理 |
| `Math` | `Math` | 数学运算 |

## 二、网络请求转换

### Web端代码示例
```javascript
// HTML中的JavaScript
fetch('https://api.example.com/merchants', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(merchantData)
}) .then(response => response.json())
.then(data => {
    console.log('Success:', data);
    alert('注册成功！');
    window.location.href = 'login.html';
})
.catch((error) => {
    console.error('Error:', error);
    alert('注册失败，请重试！');
});
```

### 小程序端转换示例
```javascript
// 微信小程序中的JavaScript
wx.request({
    url: 'https://api.example.com/merchants',
    method: 'POST',
    header: {
        'Content-Type': 'application/json',
    },
    data: merchantData,
    success(res) {
        console.log('Success:', res.data);
        wx.showToast({
            title: '注册成功！',
            icon: 'success'
        });
        wx.navigateTo({
            url: '/pages/merchant/login/login'
        });
    },
    fail(err) {
        console.error('Error:', err);
        wx.showToast({
            title: '注册失败，请重试！',
            icon: 'none'
        });
    }
});
```

## 三、本地存储转换

### Web端代码示例
```javascript
// HTML中的JavaScript
localStorage.setItem('merchantId', merchantId);
localStorage.setItem('token', token);

const merchantId = localStorage.getItem('merchantId');
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}
```

### 小程序端转换示例
```javascript
// 微信小程序中的JavaScript
wx.setStorageSync('merchantId', merchantId);
wx.setStorageSync('token', token);

const merchantId = wx.getStorageSync('merchantId');
const token = wx.getStorageSync('token');

if (!token) {
    wx.navigateTo({
        url: '/pages/merchant/login/login'
    });
}
```

## 四、页面跳转转换

### Web端代码示例
```javascript
// HTML中的JavaScript
// 普通跳转
window.location.href = 'post-message.html';

// 返回上一页
document.getElementById('backBtn').onclick = function() {
    window.history.back();
};
```

### 小程序端转换示例
```javascript
// 微信小程序中的JavaScript
// 普通跳转（保留当前页面）
wx.navigateTo({
    url: '/pages/merchant/post-message/post-message'
});

// 跳转到tabBar页面（关闭其他所有非tabBar页面）
wx.switchTab({
    url: '/pages/merchant/statistics/statistics'
});

// 返回上一页
this.goBack = function() {
    wx.navigateBack();
};
```

## 五、事件处理转换

### Web端代码示例
```html
<!-- HTML中的事件处理 -->
<button onclick="submitForm()">提交</button>
<input type="text" oninput="handleInput(event)">
```

```javascript
// HTML中的JavaScript
function submitForm() {
    // 表单提交逻辑
}

function handleInput(event) {
    const value = event.target.value;
    // 输入处理逻辑
}
```

### 小程序端转换示例
```wxml
<!-- 微信小程序中的事件处理 -->
<button bindtap="submitForm">提交</button>
<input type="text" bindinput="handleInput">
```

```javascript
// 微信小程序中的JavaScript
Page({
    submitForm: function() {
        // 表单提交逻辑
    },
    
    handleInput: function(event) {
        const value = event.detail.value;
        // 输入处理逻辑
    }
});
```

## 六、数据绑定转换

### Web端代码示例
```html
<!-- HTML中的数据绑定 -->
<div id="merchantName"></div>
```

```javascript
// HTML中的JavaScript
const merchantName = document.getElementById('merchantName');
merchantName.textContent = '商户名称';
```

### 小程序端转换示例
```wxml
<!-- 微信小程序中的数据绑定 -->
<view>{{merchantName}}</view>
```

```javascript
// 微信小程序中的JavaScript
Page({
    data: {
        merchantName: ''
    },
    
    onLoad: function() {
        this.setData({
            merchantName: '商户名称'
        });
    }
});
```

## 七、表单处理转换

### Web端代码示例
```html
<!-- HTML表单 -->
<form id="registerForm" onsubmit="handleSubmit(event)">
    <input type="text" name="merchantName" placeholder="商户名称">
    <input type="text" name="contactPerson" placeholder="联系人">
    <button type="submit">提交</button>
</form>
```

```javascript
// HTML中的JavaScript
function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const merchantData = Object.fromEntries(formData);
    // 处理表单数据
}
```

### 小程序端转换示例
```wxml
<!-- 微信小程序表单 -->
<form bindsubmit="handleSubmit">
    <input type="text" name="merchantName" placeholder="商户名称">
    <input type="text" name="contactPerson" placeholder="联系人">
    <button form-type="submit">提交</button>
</form>
```

```javascript
// 微信小程序中的JavaScript
Page({
    handleSubmit: function(event) {
        const merchantData = event.detail.value;
        // 处理表单数据
    }
});
```

## 八、定时器转换

### Web端代码示例
```javascript
// HTML中的JavaScript
const timer = setInterval(function() {
    // 定时执行逻辑
}, 1000);

clearInterval(timer);
```

### 小程序端转换示例
```javascript
// 微信小程序中的JavaScript
const timer = setInterval(function() {
    // 定时执行逻辑
}, 1000);

clearInterval(timer);
```

## 九、文件上传转换

### Web端代码示例
```html
<!-- HTML中的文件上传 -->
<input type="file" id="imageUpload" accept="image/*" onchange="handleFileUpload(event)">
```

```javascript
// HTML中的JavaScript
function handleFileUpload(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    fetch('https://api.example.com/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Upload success:', data);
    });
}
```

### 小程序端转换示例
```wxml
<!-- 微信小程序中的文件上传 -->
<button bindtap="chooseImage">选择图片</button>
<image src="{{imageUrl}}" mode="aspectFill" style="width: 100%; height: 200px;"></image>
```

```javascript
// 微信小程序中的JavaScript
Page({
    data: {
        imageUrl: ''
    },
    
    chooseImage: function() {
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempFilePath = res.tempFilePaths[0];
                this.setData({
                    imageUrl: tempFilePath
                });
                this.uploadImage(tempFilePath);
            }
        });
    },
    
    uploadImage: function(filePath) {
        wx.uploadFile({
            url: 'https://api.example.com/upload',
            filePath: filePath,
            name: 'image',
            formData: {
                'user': 'test'
            },
            success: (res) => {
                const data = JSON.parse(res.data);
                console.log('Upload success:', data);
            }
        });
    }
});
```

## 十、页面生命周期转换

### Web端代码示例
```javascript
// HTML中的JavaScript
window.onload = function() {
    // 页面加载完成后执行
    initPage();
};

window.onbeforeunload = function() {
    // 页面卸载前执行
    saveData();
};
```

### 小程序端转换示例
```javascript
// 微信小程序中的JavaScript
Page({
    onLoad: function(options) {
        // 页面加载时执行
        this.initPage();
    },
    
    onShow: function() {
        // 页面显示时执行
    },
    
    onReady: function() {
        // 页面初次渲染完成时执行
    },
    
    onHide: function() {
        // 页面隐藏时执行
    },
    
    onUnload: function() {
        // 页面卸载时执行
        this.saveData();
    },
    
    initPage: function() {
        // 初始化页面逻辑
    },
    
    saveData: function() {
        // 保存数据逻辑
    }
});
```

## 十一、模块化转换

### Web端代码示例
```javascript
// HTML中的JavaScript
// utils.js
function formatDate(date) {
    // 日期格式化逻辑
}

// 在其他文件中使用
<script src="utils.js"></script>
<script>
    const formattedDate = formatDate(new Date());
</script>
```

### 小程序端转换示例
```javascript
// 微信小程序中的JavaScript
// utils/date.js
function formatDate(date) {
    // 日期格式化逻辑
}

module.exports = {
    formatDate: formatDate
};

// 在页面中使用
const dateUtil = require('../../utils/date.js');

Page({
    onLoad: function() {
        const formattedDate = dateUtil.formatDate(new Date());
    }
});
```

## 十二、登录与授权转换

### Web端代码示例
```javascript
// HTML中的JavaScript
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch('https://api.example.com/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard.html';
        } else {
            alert('登录失败');
        }
    });
}
```

### 小程序端转换示例
```javascript
// 微信小程序中的JavaScript
Page({
    data: {
        username: '',
        password: ''
    },
    
    handleInput: function(e) {
        const { name, value } = e.detail;
        this.setData({
            [name]: value
        });
    },
    
    login: function() {
        const { username, password } = this.data;
        
        wx.request({
            url: 'https://api.example.com/login',
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            data: { username, password },
            success: (res) => {
                if (res.data.token) {
                    wx.setStorageSync('token', res.data.token);
                    wx.switchTab({
                        url: '/pages/merchant/dashboard/dashboard'
                    });
                } else {
                    wx.showToast({
                        title: '登录失败',
                        icon: 'none'
                    });
                }
            }
        });
    }
});
```

## 十三、注意事项

1. **异步操作**：小程序的API大多是异步的，需要使用回调函数处理结果
2. **权限管理**：小程序需要获取用户授权才能使用某些API，如获取用户信息、地理位置等
3. **跨域问题**：小程序默认支持跨域请求，但需要在微信开发者工具中配置
4. **安全限制**：小程序有严格的安全限制，如不允许直接访问DOM、不支持某些JavaScript特性
5. **性能优化**：小程序有包大小限制，需要合理管理代码和资源
6. **版本兼容性**：不同版本的小程序支持的API可能不同，需要进行兼容性处理

## 十四、转换工具推荐

1. **JavaScript转换工具**：
   - babel-plugin-transform-weapp
   - 自定义转换脚本

2. **代码检查工具**：
   - 微信开发者工具内置的代码检查
   - ESLint for WeChat Mini Program

3. **调试工具**：
   - 微信开发者工具
   - vConsole

## 十五、示例转换：商户注册页面逻辑

### Web端代码示例（部分）
```javascript
// merchant/register/index.html 中的JavaScript
function validateForm() {
    const form = document.getElementById('registerForm');
    const merchantName = document.getElementById('merchantName').value;
    const contactPerson = document.getElementById('contactPerson').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!merchantName.trim()) {
        alert('请输入商户名称');
        return false;
    }
    
    if (!contactPerson.trim()) {
        alert('请输入联系人');
        return false;
    }
    
    if (!phone.trim()) {
        alert('请输入手机号');
        return false;
    }
    
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        alert('请输入有效的手机号');
        return false;
    }
    
    if (!password.trim()) {
        alert('请输入密码');
        return false;
    }
    
    if (password.length < 6) {
        alert('密码长度不能少于6位');
        return false;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return false;
    }
    
    return true;
}

function registerMerchant() {
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(document.getElementById('registerForm'));
    const merchantData = Object.fromEntries(formData);
    
    fetch('https://api.example.com/merchants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(merchantData)
    }) .then(response => response.json())
.then(data => {
    console.log('Success:', data);
    alert('注册成功！');
    window.location.href = 'login.html';
})
.catch((error) => {
    console.error('Error:', error);
    alert('注册失败，请重试！');
});
}

function goBack() {
    window.history.back();
}
```

### 小程序端转换示例
```javascript
// pages/merchant/register/register.js
Page({
    data: {
        form: {
            merchantName: '',
            contactPerson: '',
            phone: '',
            password: '',
            confirmPassword: ''
        },
        error: ''
    },
    
    handleInput: function(e) {
        const { name, value } = e.detail;
        this.setData({
            [`form.${name}`]: value,
            error: ''
        });
    },
    
    validateForm: function() {
        const { merchantName, contactPerson, phone, password, confirmPassword } = this.data.form;
        
        if (!merchantName.trim()) {
            this.setData({ error: '请输入商户名称' });
            return false;
        }
        
        if (!contactPerson.trim()) {
            this.setData({ error: '请输入联系人' });
            return false;
        }
        
        if (!phone.trim()) {
            this.setData({ error: '请输入手机号' });
            return false;
        }
        
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            this.setData({ error: '请输入有效的手机号' });
            return false;
        }
        
        if (!password.trim()) {
            this.setData({ error: '请输入密码' });
            return false;
        }
        
        if (password.length < 6) {
            this.setData({ error: '密码长度不能少于6位' });
            return false;
        }
        
        if (password !== confirmPassword) {
            this.setData({ error: '两次输入的密码不一致' });
            return false;
        }
        
        return true;
    },
    
    registerMerchant: function() {
        if (!this.validateForm()) {
            wx.showToast({
                title: this.data.error,
                icon: 'none'
            });
            return;
        }
        
        const merchantData = this.data.form;
        
        wx.request({
            url: 'https://api.example.com/merchants',
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
            },
            data: merchantData,
            success: (res) => {
                console.log('Success:', res.data);
                wx.showToast({
                    title: '注册成功！',
                    icon: 'success'
                });
                // 延迟跳转，确保用户看到提示
                setTimeout(() => {
                    wx.navigateTo({
                        url: '/pages/merchant/login/login'
                    });
                }, 1500);
            },
            fail: (error) => {
                console.error('Error:', error);
                wx.showToast({
                    title: '注册失败，请重试！',
                    icon: 'none'
                });
            }
        });
    },
    
    goBack: function() {
        wx.navigateBack();
    }
});
```