@echo off
REM ==================================================================
REM  Genera la carpeta "ejecutable" con el sistema completo en un solo
REM  archivo biblioteca.jar (Spring Boot + Angular).
REM  Requisitos: Java 17, Maven y Node instalados.
REM  Uso: doble clic o ejecutar desde la carpeta raiz del proyecto.
REM ==================================================================
setlocal
cd /d "%~dp0"

echo.
echo [1/3] Compilando el frontend Angular...
pushd frontend
call npm install --no-audit --no-fund || goto error
call npm run build:ejecutable || goto error
popd

echo.
echo [2/3] Compilando el backend con la interfaz incluida...
pushd backend
if exist mvnw.cmd (
    call mvnw.cmd -q -Pejecutable package -DskipTests || goto error
) else (
    call mvn -q -Pejecutable package -DskipTests || goto error
)
popd

echo.
echo [3/3] Armando la carpeta "ejecutable"...
if exist ejecutable rmdir /s /q ejecutable
mkdir ejecutable
copy /y backend\target\biblioteca-backend-1.0.0.jar ejecutable\biblioteca.jar >nul || goto error
copy /y scripts\INICIAR.bat ejecutable\INICIAR.bat >nul
copy /y scripts\LEEME.txt ejecutable\LEEME.txt >nul
copy /y backend\application-local.properties.example ejecutable\application-local.properties.example >nul

echo.
echo ==================================================================
echo  LISTO. Carpeta generada: %CD%\ejecutable
echo  Para abrir el sistema: doble clic en ejecutable\INICIAR.bat
echo ==================================================================
pause
exit /b 0

:error
popd 2>nul
echo.
echo *** Ocurrio un error. Revise los mensajes de arriba. ***
pause
exit /b 1
