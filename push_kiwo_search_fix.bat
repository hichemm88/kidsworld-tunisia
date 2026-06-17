@echo off
cd /d C:\Projets\Kidsworld
if exist .git\index.lock del /f .git\index.lock
git add src/app/api/kiwo/route.ts src/app/auth/login/page.tsx
git commit -m "fix: kiwo search by category only (no broken phrase match) + auth redirect"
git push origin main
echo.
echo === DONE ===
git log --oneline -3
pause
