@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================
echo  SkillG - build single-file SkillG.exe
echo ==========================================
python -m PyInstaller --noconfirm --onefile --windowed --name SkillG ^
  --icon skillg.ico --add-data "web;web" ^
  --hidden-import clr --hidden-import webview.platforms.edgechromium ^
  --collect-submodules webview --collect-all pythonnet app.py
if errorlevel 1 (
  echo.
  echo [FAILED] Build error, check messages above.
  pause
  exit /b 1
)
echo.
echo [OK] Output: dist\SkillG.exe
pause
