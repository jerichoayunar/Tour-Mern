@echo off
REM Usage: run-restore-backup.cmd "C:\path\to\backup.zip" "<KEY optional>" "temp_db_name(optional)"
SETLOCAL
SET SCRIPT_DIR=%~dp0
SET FILEPATH=%~1
SET KEY=%~2
SET TEMPDB=%~3
IF "%TEMPDB%"=="" SET TEMPDB=tourdb_restore

powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%SCRIPT_DIR%restore-backup.ps1' -FilePath '%FILEPATH%' -Key '%KEY%' -TempDb '%TEMPDB%'"
