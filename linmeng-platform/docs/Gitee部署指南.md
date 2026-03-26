# 邻盟 - Gitee码云部署指南

## 文档信息
- **版本号**：V1.0.0
- **更新日期**：2026-03-26
- **适用场景**：国内用户，GitHub访问困难

---

## 一、部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户访问                               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Vercel/      │    │  Vercel/      │    │  Vercel/      │
│  Netlify      │    │  Netlify      │    │  Netlify      │
│  统一入口      │    │  社区端/商家端 │    │  招商大使/后台 │
└───────────────┘    └───────────────┘    └───────────────┘
                              │
                              ▼
                    ┌───────────────┐
                    │   Zeabur/     │
                    │   Render      │
                    │   后端API     │
                    └───────────────┘
                              │
                              ▼
                    ┌───────────────┐
                    │   Zeabur/     │
                    │   MySQL数据库  │
                    └───────────────┘
```

---

## 二、第一步：注册Gitee账号

### 2.1 访问Gitee
打开浏览器访问：**https://gitee.com**

### 2.2 注册账号
1. 点击右上角 **"注册"**
2. 输入手机号或邮箱
3. 设置密码
4. 完成验证
5. 点击 **"立即注册"**

### 2.3 完善信息
- 登录后完善个人信息
- 记住您的用户名

---

## 三、第二步：创建Gitee仓库

### 3.1 创建仓库
1. 登录Gitee后，点击右上角 **"+"** → **"新建仓库"**

### 3.2 填写仓库信息
- **仓库名称**: `linmeng-platform`
- **仓库介绍**: `邻盟 - 社区爱心资源智能匹配助手`
- 选择 **公开**
- ✅ 勾选 **使用Readme文件初始化这个仓库**
- 点击 **"创建"**

### 3.3 记录仓库地址
创建后，仓库地址格式为：
```
https://gitee.com/您的用户名/linmeng-platform.git
```

---

## 四、第三步：推送代码到Gitee

### 4.1 配置Git（首次使用需要）
```bash
git config --global user.name "您的名字"
git config --global user.email "您的邮箱"
```

### 4.2 添加远程仓库
```bash
cd d:\12494\Documents\business-district-news\linmeng-platform

# 添加Gitee远程仓库
git remote add gitee https://gitee.com/您的用户名/linmeng-platform.git
```

### 4.3 推送代码
```bash
# 推送主分支
git push gitee main

# 推送标签
git push gitee v1.0.0
```

### 4.4 如果提示输入密码
Gitee需要使用个人令牌作为密码：
1. 登录Gitee → 设置 → 私人令牌
2. 点击 **"生成新令牌"**
3. 勾选权限：projects、pull_requests
4. 复制生成的令牌
5. 在Git推送时，用户名填Gitee用户名，密码填令牌

---

## 五、第四步：部署后端

### 方案A：使用Zeabur（推荐，支持Gitee）

#### 5.1 注册Zeabur
1. 访问 **https://zeabur.com**
2. 点击 **"Login with GitHub"** 或 **"Login with Gitee"**
3. 授权登录

#### 5.2 创建项目
1. 点击 **"New Project"**
2. 选择 **"Deploy from Git Repository"**
3. 选择 **Gitee** 并授权
4. 选择 `linmeng-platform` 仓库
5. 设置 **Root Directory** 为 `server`

#### 5.3 添加MySQL数据库
1. 在项目中点击 **"Add Service"**
2. 选择 **"Prebuilt Service"** → **"MySQL"**
3. 数据库自动创建

#### 5.4 配置环境变量
在服务设置中添加：
```
NODE_ENV=production
JWT_SECRET=your_random_secret_key_at_least_32_characters
JWT_EXPIRES_IN=7d
```

数据库变量会自动注入：
```
DB_HOST=${MYSQL_HOST}
DB_PORT=${MYSQL_PORT}
DB_USER=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}
DB_NAME=${MYSQL_DATABASE}
```

#### 5.5 获取后端地址
部署成功后，Zeabur会提供域名，如：
```
https://linmeng-api.zeabur.app
```

---

### 方案B：使用Render

#### 5.1 注册Render
1. 访问 **https://render.com**
2. 点击 **"Get Started"** 使用GitHub登录

#### 5.2 创建Web Service
1. 点击 **"New"** → **"Web Service"**
2. 连接GitHub仓库（需要先将Gitee同步到GitHub）

#### 5.3 配置服务
- **Name**: `linmeng-api`
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npx sequelize-cli db:migrate && node src/app.js`

#### 5.4 添加数据库
1. 点击 **"New"** → **"PostgreSQL"** 或 **"MySQL"**
2. 创建数据库
3. 在Web Service中添加环境变量连接数据库

---

## 六、第五步：部署前端

### 方案A：使用Vercel（需要GitHub）

由于Vercel不支持直接从Gitee导入，需要：
1. 将Gitee代码同步到GitHub
2. 或使用Netlify

### 方案B：使用Netlify（推荐）

#### 6.1 注册Netlify
1. 访问 **https://netlify.com**
2. 点击 **"Sign up"** 使用GitHub或邮箱注册

#### 6.2 导入项目
1. 点击 **"Add new site"** → **"Import an existing project"**
2. 选择 **"Deploy from Git"**
3. 如果使用Gitee，需要先同步到GitHub

#### 6.3 部署各端
为每个前端应用创建独立的Netlify站点：

**统一入口 (Portal)**
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: `apps/portal`

**社区端 (Community-H5)**
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: `apps/community-h5`

**商家端 (Merchant-H5)**
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: `apps/merchant-h5`

**招商大使端 (Salesman-H5)**
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: `apps/salesman-h5`

**管理后台 (Admin-Web)**
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: `apps/admin-web`

#### 6.4 配置环境变量
每个站点添加：
```
VITE_API_BASE_URL=https://你的后端API地址
```

---

### 方案C：使用Cloudflare Pages

#### 6.1 注册Cloudflare
1. 访问 **https://pages.cloudflare.com**
2. 使用GitHub登录

#### 6.2 创建项目
1. 点击 **"Create a project"**
2. 选择 **"Connect to Git"**
3. 选择仓库

#### 6.3 配置构建
- Framework preset: Vue.js
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `apps/portal`（或其他端）

---

## 七、完整部署流程总结

```
1. 注册Gitee账号 → https://gitee.com
         ↓
2. 创建仓库 linmeng-platform
         ↓
3. 推送代码到Gitee
         ↓
4. 部署后端到Zeabur → https://zeabur.com
         ↓
5. 获取后端API地址
         ↓
6. 部署前端到Netlify → https://netlify.com
         ↓
7. 配置前端环境变量指向后端地址
         ↓
8. 测试访问
```

---

## 八、平台对比

| 平台 | 免费额度 | 支持Gitee | 国内访问 |
|-----|---------|----------|---------|
| Zeabur | $5/月额度 | ✅ | 较好 |
| Render | 750小时/月 | ❌ 需GitHub | 一般 |
| Netlify | 100GB流量 | ❌ 需GitHub | 一般 |
| Cloudflare | 无限带宽 | ❌ 需GitHub | 较好 |
| Vercel | 100GB流量 | ❌ 需GitHub | 较差 |

---

## 九、常见问题

### Q1: Gitee推送需要密码？
使用个人令牌：
1. Gitee → 设置 → 私人令牌
2. 生成令牌
3. 推送时用令牌作为密码

### Q2: Netlify无法连接Gitee？
Netlify只支持GitHub，需要：
- 方案1：将Gitee代码同步到GitHub
- 方案2：使用Zeabur同时部署前后端

### Q3: 如何同步Gitee到GitHub？
```bash
# 添加GitHub远程仓库
git remote add github https://github.com/用户名/仓库.git

# 推送到GitHub
git push github main
```

---

## 十、下一步

完成Gitee注册后，请告诉我：
1. 您的Gitee用户名是什么？
2. 仓库创建好了吗？

我会帮您执行代码推送命令。
