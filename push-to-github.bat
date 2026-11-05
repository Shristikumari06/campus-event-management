@echo off
title Upload CampusConnect to GitHub
cd /d "%~dp0"

echo ========================================================
echo   CampusConnect - GitHub Upload Tool
echo   Target Account: https://github.com/Shristikumari06
echo ========================================================
echo.

where git >nul 2>nul
if %errorlevel% equ 0 (
  goto :USE_GIT
)

if exist "C:\Program Files\Git\cmd\git.exe" (
  set "PATH=%PATH%;C:\Program Files\Git\cmd"
  goto :USE_GIT
)

echo [1] Automated API Upload (No Git installation needed - Requires GitHub Token)
echo [2] Install Git for Windows and push using standard Git
echo.
set /p CHOICE="Choose method [1 or 2]: "

if "%CHOICE%"=="1" (
  goto :API_UPLOAD
) else (
  echo.
  echo Opening Git for Windows download page...
  start https://git-scm.com/download/win
  echo After installing Git, re-run this script!
  pause
  exit /b 0
)

:API_UPLOAD
echo.
set /p TOKEN="Paste your GitHub Personal Access Token: "
set /p REPONAME="Enter repository name [press Enter for 'campus-event-management']: "
if "%REPONAME%"=="" set REPONAME=campus-event-management

if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" github-upload.js "%TOKEN%" "%REPONAME%"
) else (
  node github-upload.js "%TOKEN%" "%REPONAME%"
)
pause
exit /b 0

:USE_GIT
set /p REPONAME="Enter repository name [press Enter for 'campus-event-management']: "
if "%REPONAME%"=="" set REPONAME=campus-event-management

echo.
echo Initializing Git repository...
git init
git add .
git commit -m "Campus Event Management & Registration Portal - Full Stack"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/Shristikumari06/%REPONAME%.git

echo.
echo Pushing code to GitHub...
echo (If prompted, sign in to your GitHub account in the browser window)
git push -u origin main

echo.
if %errorlevel% equ 0 (
  echo ========================================================
  echo   SUCCESS! Your repository is live at:
  echo   https://github.com/Shristikumari06/%REPONAME%
  echo ========================================================
) else (
  echo [NOTE] Please create the empty repository first at: https://github.com/new
)
pause

