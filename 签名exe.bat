@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "SIGNTOOL=C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\signtool.exe"
set "THUMBPRINT=2C60E4F5038953DDDF5FD51DC934AB7A1FC4E0EA"

echo ==========================================
echo  Sign SkillG.exe with self-signed cert
echo ==========================================
if not exist "dist\SkillG.exe" (
  echo [ERROR] dist\SkillG.exe not found. Run build first.
  pause
  exit /b 1
)
"%SIGNTOOL%" sign /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /sha1 %THUMBPRINT% "dist\SkillG.exe"
if errorlevel 1 (
  echo [FAILED] Sign error, check cert in CurrentUser^|My.
  pause
  exit /b 1
)
copy /Y "dist\SkillG.exe" "..\SkillG.exe" >nul
echo.
echo [OK] Signed. Copied to ..\SkillG.exe
"%SIGNTOOL%" verify /pa "..\SkillG.exe"
pause
