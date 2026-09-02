@echo off
title SkillG - browser mode (troubleshooting)
cd /d "%~dp0"
rem Force opening in default browser, keep console logs
python "app.py" --no-window
pause
