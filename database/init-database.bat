@echo off
chcp 65001 >nul
echo ============================================
echo    数据库创建脚本
echo    邻盟营销助手项目
echo ============================================
echo.

REM 设置MySQL路径
set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.4
set MYSQL_EXE=%MYSQL_PATH%\bin\mysql.exe

REM 检查mysql.exe是否存在
if not exist "%MYSQL_EXE%" (
    echo [错误] 未找到MySQL客户端: %MYSQL_EXE%
    echo 请检查MySQL安装路径是否正确
    pause
    exit /b 1
)

echo 正在连接MySQL并创建数据库...
echo 数据库: neighbor_alliance
echo 用户名: root
echo.

REM 执行SQL脚本
"%MYSQL_EXE%" -u root -p < "d:\12494\Documents\business-district-news\database\create_database.sql"

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo    数据库创建成功！
    echo ============================================
    echo.
    echo 数据库 neighbor_alliance 已创建完成
    echo 包含所有必要的表结构和初始数据
    echo.
) else (
    echo.
    echo [错误] 数据库创建失败
    echo 请检查:
    echo 1. MySQL服务是否已启动
    echo 2. root密码是否正确
    echo 3. SQL脚本路径是否正确
    echo.
)

pause
