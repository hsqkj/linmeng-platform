@echo off
chcp 65001 >nul
echo ========================================
echo    邻盟营销助手 - 本地启动脚本
echo ========================================
echo.
echo 正在启动本地服务器...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] 检测到 Python，正在启动服务器...
    echo.
    echo 服务器地址：
    echo   商家端: http://localhost:8000/merchant/post-message/index.html
    echo   用户端: http://localhost:8000/resident/view-messages/index.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    python -m http.server 8000
    goto :end
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] 检测到 Node.js，正在启动服务器...
    echo.
    echo 服务器地址：
    echo   商家端: http://localhost:8000/merchant/post-message/index.html
    echo   用户端: http://localhost:8000/resident/view-messages/index.html
    echo.
    echo 按 Ctrl+C 停止服务器
    echo.
    npx http-server -p 8000
    goto :end
)

echo [✗] 未检测到 Python 或 Node.js
echo.
echo 请先安装以下任一工具：
echo   1. Python: https://www.python.org/downloads/
echo   2. Node.js: https://nodejs.org/
echo.
echo 安装完成后重新运行此脚本
echo.

:end
pause
