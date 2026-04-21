import { useEffect, useState } from 'react';
import { db } from '../../db/dexie';
import type { Session, Activity } from '../../db/schema';
import { Button, Box, Typography, MenuItem, Select, CircularProgress } from '@mui/material';

function getDuration(start: string, end?: string): string {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const diff = Math.max(0, e.getTime() - s.getTime());
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function TimerControl({ activities, onSessionChange }: { activities: Activity[], onSessionChange?: () => void }) {
  const [active, setActive] = useState<Session | null>(null);
  const [activityId, setActivityId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Live update duration every second
  useEffect(() => {
    const refresh = async () => {
      try {
        const foundSession = await db.sessions.filter(s => s.endTime == null).first();
        if (foundSession && typeof foundSession.id === 'string') {
          setActive(foundSession);
        } else {
          setActive(null);
        }
      } catch (e) {
        setActive(null);
      } finally {
        setLoading(false);
      }
    }
    refresh();
    const intv = setInterval(refresh, 1000);
    return () => clearInterval(intv);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    const priorSession = await db.sessions.filter(s => s.endTime == null).first();
if (priorSession && priorSession.id) {
  await db.sessions.update(priorSession.id as string, { endTime: new Date().toISOString() });
}
const session: Session = {
  id: crypto.randomUUID(),
  activityId: activityId || undefined,
  startTime: new Date().toISOString(),
  endTime: null,
};
await db.sessions.add(session);
setActivityId('');
    setLoading(false);
    onSessionChange && onSessionChange();
  };

  const handleStop = async () => {
    if (active) {
      if (!active) return;
const aid = active.id;
if (!aid) return;
await db.sessions.update(aid as string, { endTime: new Date().toISOString() });
      setActive(null);
    }
    onSessionChange && onSessionChange();
  };

  if (loading) return <CircularProgress size={32} />;

  return (
    <Box sx={{ mb: 2 }}>
      {active ? (
        <Box>
          <Typography>Active Session:</Typography>
          <Typography variant="h6">
            {active.activityId ? (activities.find(a => a.id === active.activityId)?.name || 'Activity') : 'General'}
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            {getDuration(active.startTime)} elapsed
          </Typography>
          <Button color="error" variant="contained" onClick={handleStop} sx={{ mt: 2 }}>Stop</Button>
        </Box>
      ) : (
        <Box>
          <Select
            value={activityId}
            displayEmpty
            onChange={e => setActivityId(e.target.value)}
            sx={{ minWidth: 180, mr: 2 }}
          >
            <MenuItem value="">(No Activity)</MenuItem>
            {activities.map(a => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
          </Select>
          <Button color="primary" variant="contained" onClick={handleStart}>
            Start Timer
          </Button>
        </Box>
      )}
    </Box>
  );
}
