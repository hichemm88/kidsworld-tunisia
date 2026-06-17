@echo off
cd /d C:\Projets\Kidsworld
if exist .git\index.lock del /f .git\index.lock
git add src/app/api/kiwo/route.ts src/components/map/MapView.tsx
git commit -m "fix: kiwo smart reply with history context + map CSS from package + invalidateSize"
git push origin main
echo.
echo === DONE ===
git log --oneline -3
pause
