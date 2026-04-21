// Dexie data models for time tracker
export interface Activity {
  id: string; // Could also be auto-increment number
  name: string;
  color?: string;
  category?: string;
  preferredTime?: string; // e.g., '06:00'
  remindersEnabled?: boolean;
  reminderOffset?: number; // minutes
  recommendedDuration?: number; // minutes
  overrunThreshold?: number; // minutes
}

export interface Session {
  id: string;
  activityId?: string;
  startTime: string; // UTC ISO string
  endTime: string | null; // UTC ISO string or null if running
}

export interface ExportMetadata {
  lastExportedAt: string; // UTC ISO string
}

// Optionally (for performance/stats):
export interface DailyStats {
  date: string; // YYYY-MM-DD UTC
  activityId: string;
  totalDuration: number; // mins
}
