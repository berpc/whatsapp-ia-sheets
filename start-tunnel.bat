@echo off
echo.
echo ========================================
echo   Iniciando Tunel Publico
echo ========================================
echo.
echo Iniciando localtunnel en puerto 3000...
echo.

cd /d "%~dp0"
call npx localtunnel --port 3000

pause
