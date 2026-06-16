@echo off
cd /d C:\Projets\Kidsworld

echo Suppression des lock files git...
if exist .git\index.lock del /f .git\index.lock
if exist .git\config.lock del /f .git\config.lock

echo Ajout des fichiers modifies...
git add -A

echo Commit...
git commit -m "fix: map CSS, phone/lat/lng, listing_hours schema, full_name, category_slug"

echo Push vers GitHub...
git push origin main

echo.
echo === DONE ===
pause
