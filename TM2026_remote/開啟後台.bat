@echo off
chcp 65001 >nul
cd /d "%~dp0.."
where py >nul 2>&1
if %errorlevel% equ 0 (
  start "immba-http" /MIN py -3 -m http.server 8766
  timeout /t 2 /nobreak >nul
  start "" "http://127.0.0.1:8766/TM2026_remote/admin/dashboard.html"
) else (
  start "" "%~dp0admin\dashboard.html"
)
exit /b 0
