// exportService.ts — handles export, export reminders, JSON generation
import { db } from '../db/dexie';

export async function exportAllDataAsJSON(): Promise<string> {
  const [activities, sessions, exportsLog, dailyStats] = await Promise.all([
    db.activities.toArray(),
    db.sessions.toArray(),
    db.exports.toArray(),
    db.dailyStats.toArray(),
  ]);
  const result = {
    exportedAt: new Date().toISOString(),
    activities,
    sessions,
    exports: exportsLog,
    dailyStats,
  };
  return JSON.stringify(result, null, 2);
}
