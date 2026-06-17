@echo off
cd /d C:\Projets\Kidsworld

echo === KidsWorld Push Script ===
echo.

echo Removing lock files...
if exist .git\index.lock del /f .git\index.lock
if exist .git\config.lock del /f .git\config.lock

echo Resetting index to HEAD...
git reset HEAD

echo.
echo Adding changed files...
git add src/app/auth/login/page.tsx
git add src/app/profil/page.tsx
git add src/app/api/kiwo/route.ts
git add src/components/kiwo/KiwoChat.tsx

echo.
echo Git status:
git status --short

echo.
echo Committing...
git commit -m "feat: auth redirect par role + profil edition + Kiwo IA refonte"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo === DONE ===
pause
