@echo off
chcp 65001 >nul
echo ============================================
echo    MySQL 初始化配置脚本
echo    邻盟营销助手项目
echo ============================================
echo.

REM 设置MySQL安装路径（根据实际安装位置调整）
set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.4

REM 检查MySQL是否存在
if not exist "%MYSQL_PATH%\bin\mysqld.exe" (
    echo [错误] 未找到MySQL安装路径: %MYSQL_PATH%
    echo 请检查MySQL是否正确安装，或修改脚本中的MYSQL_PATH变量
    pause
    exit /b 1
)

echo [1/4] 检测到MySQL安装路径: %MYSQL_PATH%
echo.

REM 初始化MySQL数据目录
echo [2/4] 正在初始化MySQL数据目录...
echo 这可能需要几分钟时间，请耐心等待...
"%MYSQL_PATH%\bin\mysqld.exe" --initialize-insecure --console
if %errorlevel% neq 0 (
    echo [警告] 初始化可能已完成或出现错误，继续下一步...
)
echo.

REM 安装MySQL服务
echo [3/4] 正在安装MySQL服务...
"%MYSQL_PATH%\bin\mysqld.exe" --install MySQL84
if %errorlevel% neq 0 (
    echo [警告] 服务可能已存在，继续下一步...
)
echo.

REM 启动MySQL服务
echo [4/4] 正在启动MySQL服务...
net start MySQL84
if %errorlevel% neq 0 (
    echo [警告] 服务可能已在运行，继续下一步...
)
echo.

echo ============================================
echo    MySQL 初始化完成！
echo ============================================
echo.
echo 接下来请执行以下步骤设置root密码：
echo.
echo 1. 打开新的命令提示符窗口
echo 2. 执行以下命令连接MySQL（无密码）:
echo    "%MYSQL_PATH%\bin\mysql.exe" -u root
echo.
echo 3. 在MySQL命令行中执行以下SQL设置密码为 'root':
echo    ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
echo    FLUSH PRIVILEGES;
echo    EXIT;
echo.
echo 4. 然后运行 init-database.bat 执行数据库创建脚本
echo.
pause
