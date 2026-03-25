@echo off
echo ========================================
echo 邻盟营销助手 - 启动脚本
echo ========================================
echo.

echo [1/3] 检查Java环境...
java -version
if %errorlevel% neq 0 (
    echo 错误：未安装Java 17或以上版本
    pause
    exit /b 1
)

echo.
echo [2/3] 检查Maven环境...
mvn -version
if %errorlevel% neq 0 (
    echo 错误：未安装Maven
    pause
    exit /b 1
)

echo.
echo [3/3] 启动项目...
echo.
mvn spring-boot:run

pause
