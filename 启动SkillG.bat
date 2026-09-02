@echo off
title SkillG
cd /d "%~dp0"

rem Prefer pythonw (no console window); fall back to python
where pythonw >nul 2>nul
if %errorlevel%==0 (
    start "" pythonw "app.py"
) else (
    start "" python "app.py"
)

rem Native desktop window needs: python -m pip install pywebview
rem Without it the app opens in your default browser automatically.
exit /b 0
