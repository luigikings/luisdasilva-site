import { pool } from '../db.js';

export type AnalyticsEventType = 'cv_download' | 'github_visit';

export type AnalyticsEventRecord = {
  type: AnalyticsEventType;
  total: number;
};

export async function trackAnalyticsEvent(eventType: AnalyticsEventType): Promise<AnalyticsEventRecord> {
  const { rows } = await pool.query<{ event_type: string; total: number }>(
    `INSERT INTO analytics_events (event_type, total, updated_at)
     VALUES ($1, 1, NOW())
     ON CONFLICT (event_type) DO UPDATE SET
       total = analytics_events.total + 1,
       updated_at = NOW()
     RETURNING event_type, total`,
    [eventType]
  );

  const row = rows[0];
  return {
    type: row.event_type as AnalyticsEventType,
    total: Number(row.total)
  };
}

export async function getAnalyticsEventTotals(): Promise<Record<AnalyticsEventType, number>> {
  const { rows } = await pool.query<{ event_type: string; total: number }>(
    `SELECT event_type, total FROM analytics_events`
  );

  return rows.reduce<Record<AnalyticsEventType, number>>(
    (acc, row) => {
      const type = row.event_type as AnalyticsEventType;
      if (type === 'cv_download' || type === 'github_visit') {
        acc[type] = Number(row.total);
      }
      return acc;
    },
    {
      cv_download: 0,
      github_visit: 0
    }
  );
}
