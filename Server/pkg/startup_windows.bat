@echo off

:begin
cls
if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)

Set keyname=Discord RPC Extension

echo	Discord-RPC-Extension
echo    1. Add Discord-RPC-Extension Program to Startup
echo    2. Remove Discord-RPC-Extension Program From Startup
echo    3. Exit

set /p choice=  Choose A Service:
if not '%choice%'== set %choice%=choice:~0,1%

if '%choice%'=='1' goto :addstartup
if '%choice%'=='2' goto :delstartup
if '%choice%'=='3' goto :exit

:addstartup
cls
if exist "%~dp0server_win.exe" (
    reg add HKLM\Software\Microsoft\Windows\CurrentVersion\Run\ /v "%keyname%" /t REG_SZ /d "%~dp0server_win.exe"
) else (
    echo Server file not found!
)
timeout /t 2 >nul
goto begin

:delstartup
cls
reg delete HKLM\Software\Microsoft\Windows\CurrentVersion\Run\ /v "%keyname%" /f
:: also delete old key
reg delete HKLM\Software\Microsoft\Windows\CurrentVersion\Run\ /v "MAL Sync Program" /f
timeout /t 2 >nul
goto begin
