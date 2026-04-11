@echo off 
start "Backend" cmd /k "cd /d %~dp0backend && npm run dev" 
timeout /t 3 /nobreak >nul 
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start" 
echo Abre tu navegador en: http://localhost:3000 
