// timerService.ts — agent for time tracking session rules
import { db } from '../db/dexie';
import type { Session } from '../db/schema';

export async function startNewSession(activityId?: string) {
  // Stop current session if one is active
  const runningSession = await db.sessions.filter(s => s.endTime == null).first();
if (runningSession) {
  if (!runningSession) return;
const id = (runningSession as { id: string | null | undefined }).id;
if (typeof id !== 'string' || !id) return;
await db.sessions.update(id as string, { endTime: new Date().toISOString() });
}

  const session: Session = {
    id: crypto.randomUUID(),
    activityId,
    startTime: new Date().toISOString(),
    endTime: null,
  };
  await db.sessions.add(session);
}

export async function stopCurrentSession() {
  const runningSession = await db.sessions.filter(s => s.endTime == null).first();
if (runningSession) {
  if (!runningSession) return;
const id = (runningSession as { id: string | null | undefined }).id;
if (typeof id !== 'string' || !id) return;
await db.sessions.update(id as string, { endTime: new Date().toISOString() });
}
}
