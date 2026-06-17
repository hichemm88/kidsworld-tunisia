@echo off
cd /d C:\Projets\Kidsworld

echo === Push login fix ===
if exist .git\index.lock del /f .git\index.lock

git add src/app/auth/login/page.tsx
git status --short
git commit -m "fix: login button stuck - add try/catch + setLoading(false) in all paths"
git push origin main

echo.
echo === DONE ===
git log --oneline -3
pause
