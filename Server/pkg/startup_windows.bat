:begin
cls
@echo off
if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit /b)

Set keyname=MAL Sync Program

echo	MAL-Sync
echo    1. Add MAL-Sync Program to Startup
echo    2. Remove MAL-Sync Program From Startup
echo    x. Exit

set /p choice=  Choose A Service:
if not '%choice%'== set %choice%=choice:~0,1%

if '%choice%'=='1' goto :addstartup
if '%choice%'=='2' goto :delstartup
if '%choice%'=='x' goto :exit

:addstartup
cls

if exist %~dp0server_win.exe (
    reg add HKLM\Software\Microsoft\Windows\CurrentVersion\Run\ /v "%keyname%" /t REG_SZ /d %~dp0server_win.exe
) else (
    echo File not found!
)

timeout /t 2 >nul

goto begin

:delstartup
cls
reg delete HKLM\Software\Microsoft\Windows\CurrentVersion\Run\ /v "%keyname%" /f

timeout /t 2 >nul

goto begin
