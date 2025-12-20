@echo off
setlocal

echo ========================================================
echo   Terraform + Docker Demo Cleanup
echo ========================================================

cd terraform

echo.
echo Destroying resources...
call terraform destroy -auto-approve

if %errorlevel% equ 0 (
    echo.
    echo [OK] Environment destroyed successfully.
) else (
    echo.
    echo [ERROR] terraform destroy failed.
)

pause
