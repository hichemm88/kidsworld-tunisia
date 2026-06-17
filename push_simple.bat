@echo off
cd /d C:\Projets\Kidsworld
if exist .git\index.lock del /f .git\index.lock
git add src/app/api/kiwo/route.ts
git commit -m "fix: kiwo context injection - no re-asking city/age already in message"
git push origin main
echo.
echo === DONE ===
git log --oneline -3
pause
