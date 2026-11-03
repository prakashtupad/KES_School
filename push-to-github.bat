@echo off
title Push KES_School to GitHub (prakashtupad/KES_School)
cd /d "%~dp0"
echo ============================================================================
echo   Pushing KES_School to https://github.com/prakashtupad/KES_School.git
echo ============================================================================
echo.
git remote remove origin 2>nul
git remote add origin https://github.com/prakashtupad/KES_School.git
git add -A
git commit -m "Update Shri Siddharoodha English Medium School website" 2>nul
git branch -M main
echo Running: git push -u origin main
echo Complete the GitHub Sign-In / Token prompt if requested...
echo.
git push -u origin main
echo.
pause
