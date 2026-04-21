import { useEffect, useState } from 'react';
import { db } from '../../db/dexie';
import type { Session, Activity } from '../../db/schema';
import { Button, Box, Typography, MenuItem, Select, CircularProgress } from '@mui/material';

function getDuration(start: string, end?: string): string {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  let delta = Math.floor((e.getTime() - s.getTime()) / 1000);
  const hours = Math.floor(delta / 3600);
  delta = delta % 3600;
  const mins = Math.floor(delta / 60);
  const secs = delta % 60;
  return `${hours > 0 ? hours + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {active ? (
        <Box sx={{ position: 'relative', minHeight: 188, mb: 2 }}>
          <CircularProgress
            size={124}
            sx={{
              color: 'error.main',
              position: 'absolute',
              left: '50%',
              top: '50%',
              zIndex: 1,
              marginLeft: '-62px',
              marginTop: '-62px',
              pointerEvents: 'none',
              opacity: 0.38,
              animation: 'timerPulse 1.4s infinite cubic-bezier(0.19,1,0.22,1)',
            }}
            thickness={3.2}
            variant="indeterminate"
            aria-label="Timer running"
          />
          <Box sx={{
            position: 'relative',
            zIndex: 2,
            py: 3,
            px: 7,
            minWidth: 128,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <Typography variant="subtitle1" sx={{ opacity: 0.87, fontSize: '1.2rem', fontWeight: 500 }}>
              Active Session
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 700, letterSpacing: '0.02em', mt: 1 }}>
              {getDuration(active.startTime)}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '1.55rem', fontWeight: 600, mt: 0.5 }}>
              {active.activityId ? (activities.find(a => a.id === active.activityId)?.name || 'Activity') : 'General'}
            </Typography>
          </Box>
          <Button color="error" variant="contained" onClick={handleStop} sx={{
            mt: 3, px: 7, py: 1.5, fontWeight: 'bold', fontSize: '1.23rem', letterSpacing: '0.03em', boxShadow: '0 0 0 0 rgba(220,38,38,0.36)',
            animation: 'pulse-red 1.33s infinite cubic-bezier(0.16,1,0.3,1)',
          }}>
            Stop
          </Button>
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
            {activities.map(a => (
              <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
            ))}
          </Select>
          <Button color="primary" variant="contained" onClick={handleStart}>
            Start Timer
          </Button>
        </Box>
      )}
    </Box>
  );
}
