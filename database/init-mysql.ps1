# MySQL 初始化脚本 - 需要以管理员身份运行
# 邻盟营销助手项目

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   MySQL 初始化配置脚本" -ForegroundColor Cyan
Write-Host "   邻盟营销助手项目" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员身份运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[错误] 此脚本需要以管理员身份运行！" -ForegroundColor Red
    Write-Host "请右键点击此脚本，选择'以管理员身份运行'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4"
$mysqld = "$mysqlPath\bin\mysqld.exe"
$mysql = "$mysqlPath\bin\mysql.exe"
$dataDir = "C:\ProgramData\MySQL\MySQL Server 8.4\Data"

# 检查MySQL安装
if (-not (Test-Path $mysqld)) {
    Write-Host "[错误] 未找到MySQL安装: $mysqld" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[1/5] MySQL安装路径: $mysqlPath" -ForegroundColor Green
Write-Host ""

# 创建数据目录
Write-Host "[2/5] 创建数据目录..." -ForegroundColor Yellow
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "数据目录已创建: $dataDir" -ForegroundColor Green
} else {
    Write-Host "数据目录已存在: $dataDir" -ForegroundColor Green
}
Write-Host ""

# 初始化MySQL
Write-Host "[3/5] 初始化MySQL数据目录..." -ForegroundColor Yellow
Write-Host "这可能需要几分钟，请耐心等待..." -ForegroundColor Gray

$initResult = & $mysqld --initialize-insecure --console 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "MySQL数据目录初始化成功！" -ForegroundColor Green
} else {
    Write-Host "初始化输出: $initResult" -ForegroundColor Gray
}
Write-Host ""

# 安装MySQL服务
Write-Host "[4/5] 安装MySQL服务..." -ForegroundColor Yellow
$serviceExists = Get-Service -Name "MySQL84" -ErrorAction SilentlyContinue
if ($serviceExists) {
    Write-Host "MySQL服务已存在" -ForegroundColor Green
} else {
    & $mysqld --install MySQL84
    Write-Host "MySQL服务已安装" -ForegroundColor Green
}
Write-Host ""

# 启动MySQL服务
Write-Host "[5/5] 启动MySQL服务..." -ForegroundColor Yellow
$service = Get-Service -Name "MySQL84" -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "MySQL服务已在运行中" -ForegroundColor Green
} else {
    Start-Service -Name "MySQL84"
    Start-Sleep -Seconds 3
    $service = Get-Service -Name "MySQL84"
    if ($service.Status -eq "Running") {
        Write-Host "MySQL服务已启动" -ForegroundColor Green
    } else {
        Write-Host "[警告] MySQL服务启动失败，请手动启动" -ForegroundColor Yellow
    }
}
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   MySQL 初始化完成！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 设置root密码
Write-Host "正在设置root密码为 'root'..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# 创建临时SQL文件
$tempSql = @"
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
"@
$tempSqlPath = "$env:TEMP\set_password.sql"
$tempSql | Out-File -FilePath $tempSqlPath -Encoding ASCII

# 执行密码设置
& $mysql -u root --skip-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root'; FLUSH PRIVILEGES;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "root密码已设置为: root" -ForegroundColor Green
} else {
    Write-Host "[提示] 如果密码设置失败，请手动执行以下命令:" -ForegroundColor Yellow
    Write-Host "  1. $mysql -u root --skip-password" -ForegroundColor Gray
    Write-Host "  2. ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';" -ForegroundColor Gray
    Write-Host "  3. FLUSH PRIVILEGES;" -ForegroundColor Gray
    Write-Host "  4. EXIT;" -ForegroundColor Gray
}

Remove-Item $tempSqlPath -ErrorAction SilentlyContinue
Write-Host ""

# 执行数据库创建脚本
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   正在创建数据库..." -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

$sqlPath = "d:\12494\Documents\business-district-news\database\create_database.sql"
if (Test-Path $sqlPath) {
    Get-Content $sqlPath | & $mysql -u root -proot 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "数据库 neighbor_alliance 创建成功！" -ForegroundColor Green
    } else {
        Write-Host "[警告] 数据库创建可能有问题，请检查" -ForegroundColor Yellow
    }
} else {
    Write-Host "[错误] SQL文件不存在: $sqlPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   配置完成！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "数据库连接信息:" -ForegroundColor White
Write-Host "  主机: localhost" -ForegroundColor Gray
Write-Host "  端口: 3306" -ForegroundColor Gray
Write-Host "  数据库: neighbor_alliance" -ForegroundColor Gray
Write-Host "  用户名: root" -ForegroundColor Gray
Write-Host "  密码: root" -ForegroundColor Gray
Write-Host ""
pause
