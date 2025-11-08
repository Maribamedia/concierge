@echo off
REM Convex Deployment Script for Windows
REM Run this script locally on your Windows machine after cloning the repository

echo ===================================
echo Concierge V2 - Convex Deployment
echo ===================================
echo.

REM Check if we're in the correct directory
if not exist package.json (
    echo Error: Please run this script from the project root directory
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    exit /b 1
)

echo Step 1: Installing dependencies...
call pnpm install || call npm install

echo.
echo Step 2: Deploying to Convex...
echo This will open a browser window for authentication if you're not logged in.
echo.

REM Deploy to Convex
if defined CONVEX_DEPLOY_KEY (
    echo Using CONVEX_DEPLOY_KEY for deployment...
    call pnpm exec convex deploy --yes
) else (
    echo No CONVEX_DEPLOY_KEY found. Using interactive authentication...
    call pnpm exec convex deploy
)

echo.
echo Step 3: Verifying deployment...

REM Check if _generated directory exists
if not exist "convex\_generated" (
    echo Error: TypeScript types were not generated
    echo Please check the Convex dashboard for deployment errors
    exit /b 1
)

echo √ TypeScript types generated successfully

echo.
echo Step 4: Building application...
call pnpm build

echo.
echo ===================================
echo √ Deployment Complete!
echo ===================================
echo.
echo Next steps:
echo 1. Review the deployment in Convex dashboard
echo 2. Test the application: pnpm dev
echo 3. Run comprehensive tests (see PRODUCTION_DEPLOYMENT_TESTING_REPORT.md)
echo.
