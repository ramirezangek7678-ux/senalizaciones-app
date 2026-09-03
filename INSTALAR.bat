@echo off 
title Senalamiento MS 
echo Instalando dependencias... 
cd /d "%~dp0backend" 
call npm install 
cd /d "%~dp0frontend" 
call npm install 
echo Listo. Iniciando aplicacion... 
start "Backend" cmd /k "cd /d "%~dp0backend" && npm run dev" 
timeout /t 3 /nobreak >nul 
start "Frontend" cmd /k "cd /d "%~dp0frontend" && set DANGEROUSLY_DISABLE_HOST_CHECK=true^&^& npm start" 
timeout /t 8 /nobreak >nul 
start http://localhost:3000
