import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Activity, Session, ExportMetadata, DailyStats } from './schema';

// DB version 1 schema
export class TimeTrackerDB extends Dexie {
  activities!: Table<Activity, string>;
  sessions!: Table<Session, string>;
  exports!: Table<ExportMetadata, string>;
  dailyStats!: Table<DailyStats, [string, string]>; // [date, activityId] as key

  constructor() {
    super('timeTracker');
    this.version(1).stores({
      activities: 'id',
      sessions: 'id, activityId, startTime, endTime',
      exports: 'lastExportedAt',
      dailyStats: '[date+activityId], date, activityId'
    });
  }
}

export const db = new TimeTrackerDB();
