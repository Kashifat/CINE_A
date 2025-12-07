@echo off
echo ============================================================
echo   CONFIGURATION GIT - PROJET CINE_A
echo ============================================================
echo.

cd /d C:\Users\Admin\Desktop\CineA

echo [1/7] Verification de Git...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Git n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)
echo    Git detecte: OK

echo.
echo [2/7] Initialisation du depot Git...
git init
if %errorlevel% neq 0 (
    echo ERREUR lors de l'initialisation
    pause
    exit /b 1
)

echo.
echo [3/7] Ajout de tous les fichiers...
git add .
if %errorlevel% neq 0 (
    echo ERREUR lors de l'ajout des fichiers
    pause
    exit /b 1
)

echo.
echo [4/7] Creation du commit initial...
git commit -m "Initial commit - CineA streaming platform with microservices"
if %errorlevel% neq 0 (
    echo ERREUR lors du commit
    pause
    exit /b 1
)

echo.
echo [5/7] Renommage de la branche en 'main'...
git branch -M main

echo.
echo [6/7] Ajout du depot distant GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/Kashifat/CINE_A.git
if %errorlevel% neq 0 (
    echo ERREUR lors de l'ajout du remote
    pause
    exit /b 1
)

echo.
echo [7/7] Push vers GitHub...
echo ATTENTION: Vous devrez peut-etre entrer vos identifiants GitHub
echo.
git push -u origin main
if %errorlevel% neq 0 (
    echo ERREUR lors du push
    echo.
    echo Verifiez:
    echo - Que le depot https://github.com/Kashifat/CINE_A.git existe
    echo - Vos identifiants GitHub
    echo - Votre connexion internet
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   SUCCES ! Votre projet est sur GitHub
echo   https://github.com/Kashifat/CINE_A
echo ============================================================
echo.

echo Affichage du statut Git:
git status

echo.
echo Affichage des remotes:
git remote -v

pause
