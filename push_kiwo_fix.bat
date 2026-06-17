@echo off
cd /d C:\Projets\Kidsworld
if exist .git\index.lock del /f .git\index.lock
git add src/app/api/kiwo/route.ts
git commit -m "fix: kiwo - accent-insensitive category detection + shopping handler"
git push origin main
echo === DONE ===
git log --oneline -3
pause
