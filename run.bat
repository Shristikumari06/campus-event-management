@echo off
title CampusConnect Server
cd /d "%~dp0"
echo ========================================================
echo   Starting CampusConnect Full-Stack Server...
echo ========================================================
echo.
echo Opening portal in your browser: http://localhost:3000
start http://localhost:3000
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
  node server.js
) else (
  if exist "C:\Program Files\nodejs\node.exe" (
    "C:\Program Files\nodejs\node.exe" server.js
  ) else (
    npm.cmd start
  )
)
pause

