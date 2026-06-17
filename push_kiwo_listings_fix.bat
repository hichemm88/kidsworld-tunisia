@echo off
cd /d C:\Projets\Kidsworld
if exist .git\index.lock del /f .git\index.lock
git add src/app/api/kiwo/route.ts src/app/auth/login/page.tsx
git commit -m "fix: kiwo uses category_nom filter (view has no category_slug) + auth redirect"
git push origin main
echo.
echo === DONE ===
git log --oneline -4
pause
