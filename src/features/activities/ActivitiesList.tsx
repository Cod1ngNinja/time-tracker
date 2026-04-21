import { useEffect, useState } from 'react';
import { db } from '../../db/dexie';
import type { Activity } from '../../db/schema';
import {
  Box, Button, IconButton, List, ListItem, ListItemText,
  ListItemSecondaryAction, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const COLORS = [
  '#1976d2', '#e57373', '#81c784', '#ffb300', '#ba68c8', '#64b5f6', '#f06292', '#ffd54f', '#aed581', '#fff'
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function ActivitiesList(props: { refreshActivities?: () => void }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setActivities(await db.activities.toArray());
  };

  useEffect(() => { refresh(); }, []);

  const openAdd = () => {
    setEditActivity(null);
    setName('');
    setColor(randomColor());
    setDialogOpen(true);
  };

  const openEdit = (a: Activity) => {
    setEditActivity(a);
    setName(a.name);
    setColor(a.color || COLORS[0]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim().toLowerCase();
    // Exclude the currently edited activity when editing
    const duplicate = activities.some(a =>
      a.name.trim().toLowerCase() === trimmedName && (!editActivity || a.id !== editActivity.id)
    );
    if (duplicate) {
      setError('Activity name already exists.');
      return;
    }
    if (name.trim() === '') return;
    if (editActivity) {
      await db.activities.update(editActivity.id as string, { name, color });
    } else {
      await db.activities.add({
        id: crypto.randomUUID(),
        name,
        color,
      });
    }
    setError(null);
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await db.activities.delete(deleteId as string);
      setDeleteId(null);
    refresh();
    props.refreshActivities && props.refreshActivities();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Your Activities</Typography>
        <Button color="primary" variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add
        </Button>
      </Box>
      <List>
        {activities.map(a => (
          <ListItem sx={{ mb: 1, borderRadius: 1, bgcolor: a.color || COLORS[0] + '22' }} key={a.id} >
            <ListItemText primary={a.name} secondary={a.color} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="edit" onClick={() => openEdit(a)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => setDeleteId(a.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {activities.length === 0 && (
          <Typography color="text.secondary" sx={{ mt: 4 }}>No activities—add one above!</Typography>
        )}
      </List>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editActivity ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={name} onChange={e => { setName(e.target.value); setError(null); }} sx={{ mt: 1 }} autoFocus />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <TextField
            select
            fullWidth
            label="Color"
            value={color}
            onChange={e => setColor(e.target.value)}
            sx={{ mt: 2 }}
          >
            {COLORS.map(c => (
              <MenuItem value={c} key={c}>
                <Box sx={{ display: 'inline-block', width: 24, height: 24, bgcolor: c, borderRadius: 1, mr: 2 }} />
                {c}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button color="primary" onClick={handleSave} variant="contained" disabled={!!error || name.trim() === ''}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Activity?</DialogTitle>
        <DialogContent><Typography>Are you sure? This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
