@echo off
echo Iniciando AGENDA INTELIGENTE (Modo Desarrollo)... 🚀

:: 1. Iniciar el Backend en una ventana nueva
start cmd /k "cd server && npm run dev"

:: 2. Esperar 2 segundos para dar tiempo al server
timeout /t 2 /nobreak >nul

:: 3. Iniciar el Frontend en una ventana nueva
start cmd /k "cd client && npm run dev"

echo.
echo Todo listo! Tu backend corre en el puerto 3000 y frontend en el 5173.
echo Puedes minimizar esta ventana (pero no la cierres).
pause