import { db } from '../db.js';

export type AnalyticsEventType = 'cv_download' | 'github_visit';

export type AnalyticsEventRecord = {
  type: AnalyticsEventType;
  total: number;
};

export function trackAnalyticsEvent(eventType: AnalyticsEventType): AnalyticsEventRecord {
  const statement = db.prepare(
    `INSERT INTO analytics_events (event_type, total, updated_at)
     VALUES (?, 1, datetime('now'))
     ON CONFLICT(event_type) DO UPDATE SET
       total = total + 1,
       updated_at = datetime('now')`
  );

  statement.run(eventType);

  const row = db
    .prepare(`SELECT event_type, total FROM analytics_events WHERE event_type = ?`)
    .get(eventType) as { event_type: string; total: number } | undefined;

  return {
    type: eventType,
    total: row?.total ?? 0
  };
}

export function getAnalyticsEventTotals(): Record<AnalyticsEventType, number> {
  const rows = db
    .prepare(`SELECT event_type, total FROM analytics_events`)
    .all() as Array<{ event_type: string; total: number }>;

  return rows.reduce(
    (acc, row) => {
      if (row.event_type === 'cv_download' || row.event_type === 'github_visit') {
        acc[row.event_type] = row.total;
      }
      return acc;
    },
    {
      cv_download: 0,
      github_visit: 0
    } as Record<AnalyticsEventType, number>
  );
}
