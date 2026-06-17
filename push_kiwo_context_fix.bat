@echo off
cd /d C:\Projets\Kidsworld
if exist .git\index.lock del /f .git\index.lock
git add src/app/api/kiwo/route.ts
git commit -m "fix: kiwo injects detected city+category into Claude prompt - no re-asking for known info"
git push origin main
echo.
echo === DONE ===
git log --oneline -3
pause
