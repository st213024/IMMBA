@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM 優先使用 serve-open.py：同一個程式開伺服器 + 自動開瀏覽器
where py >nul 2>&1 && (
  py serve-open.py
  goto :end
)
where python >nul 2>&1 && (
  python serve-open.py
  goto :end
)

echo [錯誤] 找不到 py 或 python。請安裝 Python 並勾選 Add to PATH。
pause
:end
