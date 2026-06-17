@echo off
cd /d C:\Projets\Kidsworld

echo === Abort rebase + Force Push ===
echo.

echo Aborting rebase...
git rebase --abort

echo.
echo Dropping stash (if any)...
git stash drop

echo.
echo Current state:
git log --oneline -5
git status --short

echo.
echo Force pushing to GitHub...
git push --force origin main

echo.
echo === DONE ===
git log --oneline -5
pause
