#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import base64

# 从剪贴板或输入获取图片数据
# 这里我们创建一个占位文件，实际图片需要用户手动放置

logo_html = '''
<!DOCTYPE html>
<html>
<head>
    <title>Logo 占位</title>
</head>
<body>
    <p>请将 logo 图片保存为 logo.png 到此目录</p>
</body>
</html>
'''

with open('logo_placeholder.html', 'w', encoding='utf-8') as f:
    f.write(logo_html)

print("请手动将 logo 图片保存为: logo.png")
