import { Box, Typography } from '@mui/material';
import { parseISO } from 'date-fns';
import type { Session, Activity } from '../../db/schema';

function msToHMS(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h > 0 ? h + 'h ' : ''}${m}m`;
}

function isToday(date: string) {
  const d = new Date(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export default function DashboardSummary({ sessions, activities }: { sessions: Session[], activities: Activity[] }) {
  // Filter sessions started today
  const todaySessions = sessions.filter(s => isToday(s.startTime));
  let total = 0;
  const activityTotals: Record<string, number> = {};
  for (const session of todaySessions) {
    const start = parseISO(session.startTime).getTime();
    const end = session.endTime ? parseISO(session.endTime).getTime() : Date.now();
    const duration = Math.max(0, end - start);
    total += duration;
    if (session.activityId) {
      activityTotals[session.activityId] = (activityTotals[session.activityId] || 0) + duration;
    }
  }
  // Find top activity
  let top: string | null = null;
  let max = 0;
  for (const k of Object.keys(activityTotals)) {
    if (activityTotals[k] > max) {
      max = activityTotals[k];
      top = k;
    }
  }
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Today's tracked time: {msToHMS(total)}
      </Typography>
      {!!top && <Typography variant="body2" color="text.secondary">Most: {activities.find(a => a.id === top)?.name} ({msToHMS(max)})</Typography>}
      {todaySessions.length === 0 && <Typography variant="body2" color="text.secondary">No sessions yet today.</Typography>}
    </Box>
  );
}
