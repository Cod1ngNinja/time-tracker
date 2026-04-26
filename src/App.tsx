import ReloadPrompt from "./ReloadPrompt";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  Box,
  Container,
  Tabs,
  Tab,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useState, useCallback } from "react";
import ActivitiesList from "./features/activities/ActivitiesList";
import TimerControl from "./features/timer/TimerControl";
import SessionHistory from "./features/timer/SessionHistory";
import DashboardSummary from "./features/timer/DashboardSummary";
import { useEffect } from "react";
import { db } from "./db/dexie";
import type { Activity, Session } from "./db/schema";

interface AppProps {
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
}

function App({ mode, setMode }: AppProps) {
  const [tab, setTab] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const refreshSessions = useCallback(
    () => db.sessions.toArray().then(setSessions),
    [],
  );

  useEffect(() => {
    // fetch activities from Dexie, seed "Run" if none exist
    db.activities.toArray().then(async (results) => {
      // If there is no activity named "Run" (case-insensitive), add one
      const hasRun = results.some((a) => a.name.trim().toLowerCase() === "run");
      if (!hasRun) {
        const defaultActivity = {
          id: crypto.randomUUID(),
          name: "Run",
          color: "#1976d2",
        };
        await db.activities.add(defaultActivity);
        // After adding, refetch ALL activities so we update from the DB only
        setActivities(await db.activities.toArray());
      } else {
        setActivities(results);
      }
    });
    refreshSessions();
  }, [refreshSessions]);
  return (
    <>
      <ReloadPrompt />
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Time Tracker
          </Typography>
          <IconButton
            sx={{ mr: 1 }}
            color="inherit"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          >
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Switch
            checked={mode === "dark"}
            onChange={() => setMode(mode === "dark" ? "light" : "dark")}
            color="default"
          />
        </Toolbar>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Dashboard" />
          <Tab label="Activities" />
          <Tab label="Reports" />
        </Tabs>
      </AppBar>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {tab === 0 && (
          <Box sx={{ my: 2 }}>
            {/* TimerControl will be shown here, needs activities for props */}
            <TimerControl
              activities={activities}
              onSessionChange={refreshSessions}
            />
            <DashboardSummary sessions={sessions} activities={activities} />
            <SessionHistory
              activities={activities}
              sessions={sessions}
              refreshSessions={refreshSessions}
            />
          </Box>
        )}
        {tab === 1 && (
          <Box sx={{ my: 2 }}>
            <ActivitiesList
              refreshActivities={() =>
                db.activities.toArray().then(setActivities)
              }
            />
          </Box>
        )}
        {tab === 2 && (
          <Box sx={{ my: 2 }}>
            <Typography variant="h4" gutterBottom>
              Reports
            </Typography>
            <Typography>
              Visual analytics and trends (feature coming soon).
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}

export default App;
