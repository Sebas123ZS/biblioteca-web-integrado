@echo off
REM ==================================================================
REM  Sistema de Gestion de Biblioteca - Inicio con doble clic
REM  - Si existe application-local.properties en esta carpeta, usa MySQL.
REM  - Si no existe, arranca en MODO DEMO con base de datos en memoria (H2)
REM    y datos de ejemplo cargados automaticamente.
REM ==================================================================
if "%~1"=="abrir-navegador" goto abrir
setlocal
cd /d "%~dp0"
title Sistema de Biblioteca

where java >nul 2>nul
if errorlevel 1 goto sinjava

set "PERFIL="
if exist application-local.properties goto conmysql
set "PERFIL=--spring.profiles.active=h2"
echo Modo DEMO: base de datos en memoria H2 con datos de ejemplo.
echo Para usar MySQL copie application-local.properties.example como
echo application-local.properties y complete su contrasena.
goto iniciar

:conmysql
echo Usando MySQL con los datos de application-local.properties

:iniciar
echo.
echo Iniciando el sistema... el navegador se abrira solo en unos segundos.
echo Usuarios de prueba:  admin / Admin123   y   jperez / Lector123
echo Para detener el sistema cierre esta ventana.
echo.
start "" /b cmd /c ""%~f0" abrir-navegador"
java -jar biblioteca.jar %PERFIL%
pause
exit /b

:abrir
timeout /t 3 /nobreak >nul
curl -s -o nul http://localhost:8080/api/health
if errorlevel 1 goto abrir
start "" http://localhost:8080
exit /b

:sinjava
echo No se encontro Java. Instale Java 17 o superior:
echo https://adoptium.net
pause
exit /b 1
