# 邻盟 - 社区活动与商业资源智能对接助手

## 项目简介

邻盟是一个社区活动与商家赞助智能供需对接平台，聚焦解决社区日常活动开展痛点与本地商家精准获客难题，搭建正规、合规、闭环的第三方撮合渠道。

## 技术栈

- **后端**: Node.js + Express + MySQL + Sequelize
- **社区端 H5**: Vue 3 + Vite + Vant
- **商家端 H5**: Vue 3 + Vite + Vant
- **管理后台**: Vue 3 + Vite + Element Plus

## 项目结构

```
linmeng-platform/
├── server/                 # 后端 API 服务
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由接口
│   │   ├── middleware/    # 中间件
│   │   └── app.js         # 入口文件
│   └── package.json
├── apps/
│   ├── community-h5/      # 社区端 H5
│   ├── merchant-h5/       # 商家端 H5
│   └── admin-web/         # 管理后台
├── database/              # 数据库脚本
│   └── schema.sql
└── package.json           # 根配置
```

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装各子项目依赖
cd server && npm install
cd ../apps/community-h5 && npm install
cd ../merchant-h5 && npm install
cd ../admin-web && npm install
```

### 2. 配置数据库

```bash
# 导入数据库结构
mysql -u root -p < database/schema.sql

# 配置后端环境变量
cp server/.env.example server/.env
# 编辑 .env 文件，配置数据库连接信息
```

### 3. 启动服务

```bash
# 启动后端服务
cd server && npm run dev

# 启动社区端 H5 (新终端)
cd apps/community-h5 && npm run dev

# 启动商家端 H5 (新终端)
cd apps/merchant-h5 && npm run dev

# 启动管理后台 (新终端)
cd apps/admin-web && npm run dev
```

### 4. 访问地址

- 后端 API: http://localhost:3000
- 社区端 H5: http://localhost:5173
- 商家端 H5: http://localhost:5174
- 管理后台: http://localhost:5175

## 默认账号

### 管理后台
- 用户名: admin
- 密码: admin123

## 核心功能

### 社区端
- 社区注册认证
- 发布活动需求
- 查看商家报名
- 确认合作
- 评价商家

### 商家端
- 商家注册认证
- 浏览活动广场
- 报名活动赞助
- 查看合作进度
- 会员购买

### 管理后台
- 用户审核管理
- 活动审核管理
- 订单管理
- 数据统计

## 开发规范

- 代码风格: ESLint + Prettier
- 提交规范: Conventional Commits
- 分支管理: Git Flow

## 许可证

MIT License
