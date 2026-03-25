@echo off
echo Starting local server...
echo.
echo Server URLs:
echo   Merchant: http://localhost:8000/merchant/post-message/index.html
echo   User: http://localhost:8000/resident/view-messages/index.html
echo.
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000

pause
