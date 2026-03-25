@echo off
echo ============================================
echo    MySQL Setup Script
echo    Neighbor Alliance Project
echo ============================================
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Please run as Administrator!
    pause
    exit /b 1
)

set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.4
set MYSQL_EXE=%MYSQL_PATH%\bin\mysql.exe
set MYSQLD_EXE=%MYSQL_PATH%\bin\mysqld.exe

echo [1/6] Checking MySQL installation...
if not exist "%MYSQLD_EXE%" (
    echo [ERROR] MySQL not found: %MYSQLD_EXE%
    pause
    exit /b 1
)
echo MySQL path: %MYSQL_PATH%
echo.

echo [2/6] Creating data directory...
if not exist "C:\ProgramData\MySQL\MySQL Server 8.4\Data" (
    mkdir "C:\ProgramData\MySQL\MySQL Server 8.4\Data"
)
echo Data directory ready
echo.

echo [3/6] Initializing MySQL data directory...
"%MYSQLD_EXE%" --initialize-insecure --console
echo.

echo [4/6] Installing MySQL service...
"%MYSQLD_EXE%" --install MySQL84
echo.

echo [5/6] Starting MySQL service...
net start MySQL84
if %errorlevel% neq 0 (
    echo [INFO] Service may already be running
)
echo.

echo [6/6] Setting root password and creating database...
timeout /t 3 >nul

"%MYSQL_EXE%" -u root --skip-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root'; FLUSH PRIVILEGES;" 2>nul
if %errorlevel% equ 0 (
    echo Root password set to: root
) else (
    echo [INFO] Password may already be set
)

echo.
echo Creating database neighbor_alliance...
"%MYSQL_EXE%" -u root -proot < "d:\12494\Documents\business-district-news\database\create_database.sql" 2>nul
if %errorlevel% equ 0 (
    echo Database created successfully!
) else (
    echo [INFO] Database may already exist
)

echo.
echo ============================================
echo    Setup Complete!
echo ============================================
echo.
echo Database connection info:
echo   Host: localhost
echo   Port: 3306
echo   Database: neighbor_alliance
echo   Username: root
echo   Password: root
echo.
pause
