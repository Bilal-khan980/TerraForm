@echo off
setlocal

echo ========================================================
echo   Terraform + Docker Demo Execution Script (v2)
echo ========================================================

:: 1. Check for Terraform
where terraform >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Terraform is not currently in your PATH.
    echo Please install Terraform from: https://developer.hashicorp.com/terraform/downloads
    echo Or ensure 'terraform.exe' is available in your command line.
    pause
    exit /b 1
)

:: 2. Check for Docker
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Terraform and Docker found.

:: 3. Navigate to Terraform directory
cd terraform

:: 4. Initialize (With Auto-Retry)
echo.
echo [1/3] Initializing Terraform (might take a few tries)...
set RETRY_COUNT=0
:init_retry
call terraform init
if %errorlevel% equ 0 goto init_success

set /a RETRY_COUNT=%RETRY_COUNT%+1
if %RETRY_COUNT% geq 5 (
    echo.
    echo [ERROR] Terraform init failed after 5 attempts.
    echo Please check your internet connection or try again later.
    pause
    exit /b 1
)

echo [WARN] Init failed (Attempt %RETRY_COUNT%/5). Retrying in 5 seconds...
timeout /t 5 >nul
goto init_retry

:init_success
echo [OK] Terraform initialized.

:: 5. Apply (Dev Environment)
echo.
echo [2/3] Deploying 'dev' environment...
call terraform apply -auto-approve
if %errorlevel% neq 0 (
    echo [ERROR] Terraform apply failed.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   SUCCESS! Application is deployed.
echo ========================================================
echo.
echo Open your browser to: http://localhost:8080
echo.
echo View stats at: http://localhost:8080/metrics
echo.
echo To destroy the demo, run cleanup_demo.bat
echo.
pause
