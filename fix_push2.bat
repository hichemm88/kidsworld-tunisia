@echo off
cd /d C:\Projets\Kidsworld

echo === Fix Push ===
echo.

echo Removing lock files...
if exist .git\index.lock del /f .git\index.lock
if exist .git\config.lock del /f .git\config.lock

echo.
echo Stashing uncommitted changes...
git stash

echo.
echo Pulling remote changes (rebase)...
git pull --rebase origin main

echo.
echo Popping stash...
git stash pop

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo === DONE ===
git log --oneline -5
pause
