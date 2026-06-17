@echo off
cd /d C:\Projets\Kidsworld
del .git\index.lock 2>nul
git add src/app/api/admin/seed-real-v2/route.ts
git commit -m "feat: seed-real-v2 — 42 listings reels Grand Tunis"
git push origin main
pause
