@echo off
echo ===================================
echo Instalador de Property Finder Argentina
echo ===================================
echo.

echo 1. Limpiando instalacion anterior...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .next rmdir /s /q .next
echo.

echo 2. Instalando dependencias (esto puede tardar unos minutos)...
call npm install --legacy-peer-deps
echo.

echo 3. Verificando instalacion...
if exist node_modules (
  echo [OK] Dependencias instaladas correctamente
) else (
  echo [ERROR] Hubo un problema con la instalacion
  goto :error
)
echo.

echo ===================================
echo Instalacion completada con exito!
echo ===================================
echo.
echo Para iniciar la aplicacion:
echo   npm run dev
echo.
echo O simplemente ejecuta el archivo "iniciar.bat"
echo.
pause
exit /b 0

:error
echo.
echo ===================================
echo ERROR: La instalacion ha fallado
echo ===================================
echo.
echo Intenta ejecutar manualmente:
echo   npm install --legacy-peer-deps
echo.
pause
exit /b 1
