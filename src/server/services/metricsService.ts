import { db } from '../db.js';
import { MetricsSummary } from '../types/index.js';
import { getTopQuestions } from './questionService.js';

export function getMetrics(): MetricsSummary {
  const totalClicksRow = db.prepare(`SELECT IFNULL(SUM(click_count), 0) as total FROM questions WHERE is_active = 1`).get() as
    | { total: number }
    | undefined;
  const clicksByCategoryRows = db
    .prepare(
      `SELECT category, IFNULL(SUM(click_count), 0) as total
       FROM questions
       WHERE is_active = 1
       GROUP BY category`
    )
    .all() as Array<{ category: string; total: number }>;

  const suggestionCounts = db
    .prepare(
      `SELECT status, COUNT(*) as total
       FROM suggestions
       GROUP BY status`
    )
    .all() as Array<{ status: string; total: number }>;

  const activeQuestionsRow = db.prepare(`SELECT COUNT(*) as total FROM questions WHERE is_active = 1`).get() as
    | { total: number }
    | undefined;

  const suggestionCountsMap: Record<string, number> = suggestionCounts.reduce(
    (acc: Record<string, number>, row) => {
      acc[row.status] = row.total;
      return acc;
    },
    {} as Record<string, number>
  );

  const clicksByCategory = clicksByCategoryRows.reduce(
    (acc: Record<string, number>, row) => {
      acc[row.category] = row.total;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalClicks: totalClicksRow?.total ?? 0,
    clicksByCategory,
    activeQuestions: activeQuestionsRow?.total ?? 0,
    pendingSuggestions: suggestionCountsMap['pending'] ?? 0,
    approvedSuggestions: suggestionCountsMap['approved'] ?? 0,
    rejectedSuggestions: suggestionCountsMap['rejected'] ?? 0,
    topQuestions: getTopQuestions(5).map((question) => ({
      id: question.id,
      text: question.text,
      category: question.category,
      clickCount: question.clickCount
    }))
  };
}
