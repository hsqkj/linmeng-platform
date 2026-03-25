@echo off
chcp 65001 >nul
echo ========================================
echo 邻盟平台 - 一键启动脚本
echo ========================================
echo.

echo [1/5] 检查环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未安装 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo Node.js 已安装

echo.
echo [2/5] 安装后端依赖...
cd server
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo 错误: 后端依赖安装失败
        pause
        exit /b 1
    )
)
echo 后端依赖安装完成

echo.
echo [3/5] 安装前端依赖...
cd ..\apps\community-h5
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo 错误: 社区端依赖安装失败
        pause
        exit /b 1
    )
)

cd ..\merchant-h5
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo 错误: 商家端依赖安装失败
        pause
        exit /b 1
    )
)

cd ..\admin-web
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo 错误: 管理后台依赖安装失败
        pause
        exit /b 1
    )
)
echo 前端依赖安装完成

echo.
echo [4/5] 配置环境变量...
cd ..\..\server
if not exist .env (
    echo 正在创建 .env 文件...
    (
        echo PORT=3000
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=linmeng
        echo JWT_SECRET=linmeng_jwt_secret_key_2024
        echo CORS_ORIGIN=*
    ) > .env
    echo .env 文件创建成功
    echo.
    echo 请编辑 server\.env 文件配置数据库连接信息！
    echo.
)

echo.
echo [5/5] 启动服务...
echo.
echo ========================================
echo 启动中... 请稍候
echo ========================================
echo.
echo 后端服务: http://localhost:3000
echo 社区端H5: http://localhost:5173
echo 商家端H5: http://localhost:5174
echo 管理后台:  http://localhost:5175
echo ========================================
echo.

start "后端服务" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak >nul
start "社区端H5" cmd /k "cd /d %~dp0apps\community-h5 && npm run dev"
timeout /t 2 /nobreak >nul
start "商家端H5" cmd /k "cd /d %~dp0apps\merchant-h5 && npm run dev"
timeout /t 2 /nobreak >nul
start "管理后台" cmd /k "cd /d %~dp0apps\admin-web && npm run dev"

echo.
echo 所有服务已启动！
echo.
echo 首次使用请执行以下步骤：
echo 1. 确保 MySQL 数据库已启动
echo 2. 创建数据库: CREATE DATABASE linmeng DEFAULT CHARACTER SET utf8mb4;
echo 3. 配置 server\.env 中的数据库连接信息
echo 4. 运行初始化脚本: cd server && npm run init-db
echo.
pause
