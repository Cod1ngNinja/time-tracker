import { useState } from 'react';
import { db } from '../../db/dexie';
import type { Session, Activity } from '../../db/schema';
import {
  Box, List, ListItem, ListItemText, IconButton, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, parseISO, isAfter, subDays } from 'date-fns';

function durationString(start: string, end?: string): string {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const diff = Math.max(0, e.getTime() - s.getTime());
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface Props {
  activities: Activity[];
  sessions: Session[];
  refreshSessions?: () => void;
}

export default function SessionHistory({ activities, sessions, refreshSessions }: Props) {
  const [selected, setSelected] = useState<Session | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editActivityId, setEditActivityId] = useState<string>('');

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);




  const openEdit = (session: Session) => {
    setSelected(session);
    setEditActivityId(session.activityId || '');
    setEditStart(session.startTime);
    setEditEnd(session.endTime ?? '');
    setEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!selected) return;
     await db.sessions.update(selected.id as string, {
      activityId: editActivityId || undefined,
      startTime: editStart,
      endTime: editEnd !== '' ? editEnd : null,
    });
    setEditDialog(false);
    setSelected(null);
    refreshSessions && refreshSessions();
  };
  const handleDelete = async () => {
    if (deleteId) {
      await db.sessions.delete(deleteId as string);
      setDeleteId(null);
      refreshSessions && refreshSessions();
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Recent Sessions</Typography>
      <List>
        {sessions.filter(s => s.endTime !== null && isAfter(parseISO(s.startTime), sevenDaysAgo)).length === 0 && <Typography color="text.secondary">No sessions in last 7 days.</Typography>}
        {sessions.filter(s => s.endTime !== null && isAfter(parseISO(s.startTime), sevenDaysAgo)).sort((a, b) => b.startTime.localeCompare(a.startTime)).map(session => {
          const canEdit = isAfter(parseISO(session.startTime), sevenDaysAgo);
          const activityLabel = session.activityId ? (activities.find(a => a.id === session.activityId)?.name || '') : 'General';
          return (
            <ListItem sx={{ mb: 1, borderRadius: 1, border: !session.endTime ? '2px solid #1976d2' : undefined }} key={session.id}>
              <ListItemText
                primary={activityLabel}
                secondary={`${format(parseISO(session.startTime), 'EEE MMM d, HH:mm')}  →  ${session.endTime ? format(parseISO(session.endTime), 'HH:mm') : '...'}   (${durationString(session.startTime, session.endTime ?? undefined)})`}
              />
              {canEdit && <IconButton onClick={() => openEdit(session)}><EditIcon /></IconButton>}
              <IconButton onClick={() => setDeleteId(session.id)}><DeleteIcon /></IconButton>
            </ListItem>
          );
        })}
      </List>
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Edit Session</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Activity"
            value={editActivityId}
            onChange={e => setEditActivityId(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value="">General</MenuItem>
            {activities.map(a => (
              <MenuItem value={a.id} key={a.id}>{a.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            type="datetime-local"
            label="Start"
            value={editStart.slice(0, 16)}
            onChange={e => setEditStart(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            type="datetime-local"
            label="End"
            value={editEnd ? editEnd.slice(0, 16) : ''}
            onChange={e => setEditEnd(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Session?</DialogTitle>
        <DialogContent><Typography>Delete this session? This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
