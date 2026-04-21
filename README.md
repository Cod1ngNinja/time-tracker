# Time Tracker PWA

A local-first, offline-capable time tracking PWA built with React, TypeScript, Material UI, and Dexie. Designed for Android & Desktop, inspired by iOS Screen Time/Digital Wellbeing.

## Key Features
- Activity-based time tracking (CRUD)
- Only one timer active at a time (sessions tracked via timestamps, not ticking)
- Intelligent reminders, notifications (Android/Desktop only)
- Fast, smooth offline experience (PWA)
- Analytics dashboard and simple reports
- Manual JSON export and weekly reminders
- Dark mode
- Built with: React, Vite, Material UI, Dexie, date-fns, Recharts, Workbox

## Install & Run
```bash
npm install
npm run dev
```

## Project Structure
```
src/
  app/
  components/
  features/
    timer/
    activities/
    reports/
  db/
    schema.ts
    dexie.ts
  services/
    timerService.ts
    exportService.ts
  hooks/
  utils/
  themes/
```
