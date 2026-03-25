#!/bin/bash

echo "========================================"
echo "   邻盟营销助手 - 本地启动脚本"
echo "========================================"
echo ""
echo "正在启动本地服务器..."
echo ""

# 检查Python是否安装
if command -v python3 &> /dev/null; then
    echo "[✓] 检测到 Python3，正在启动服务器..."
    echo ""
    echo "服务器地址："
    echo "  商家端: http://localhost:8000/merchant/post-message/index.html"
    echo "  用户端: http://localhost:8000/resident/view-messages/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
    exit 0
fi

# 检查Node.js是否安装
if command -v node &> /dev/null; then
    echo "[✓] 检测到 Node.js，正在启动服务器..."
    echo ""
    echo "服务器地址："
    echo "  商家端: http://localhost:8000/merchant/post-message/index.html"
    echo "  用户端: http://localhost:8000/resident/view-messages/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    npx http-server -p 8000
    exit 0
fi

echo "[✗] 未检测到 Python3 或 Node.js"
echo ""
echo "请先安装以下任一工具："
echo "  1. Python3: https://www.python.org/downloads/"
echo "  2. Node.js: https://nodejs.org/"
echo ""
echo "安装完成后重新运行此脚本"
echo ""
