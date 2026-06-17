@echo off
cd /d C:\Projets\Kidsworld

echo === Nettoyage git en cours ===
if exist .git\index.lock del /f .git\index.lock
if exist .git\rebase-merge del /f /q .git\rebase-merge\*
if exist .git\rebase-apply del /f /q .git\rebase-apply\*

echo === Abort rebase si en cours ===
git rebase --abort 2>nul

echo === Drop stash si bloque ===
git stash drop 2>nul

echo === Reset hard sur origin/main ===
git fetch origin
git reset --hard origin/main

echo === Re-add fichier Kiwo (notre fix) ===
git add src/app/api/kiwo/route.ts

echo === Commit ===
git commit -m "fix: kiwo injects detected city+category into Claude prompt - no re-asking for known info"

echo === Push ===
git push origin main

echo.
echo === DONE ===
git log --oneline -4
pause
