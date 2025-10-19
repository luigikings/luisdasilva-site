import { pool } from '../db.js';
import type { MetricsSummary, Question } from '../types/index.js';
import { getAnalyticsEventTotals } from './analyticsService.js';
import { getTopQuestions } from './questionService.js';

export async function getMetrics(): Promise<MetricsSummary> {
  const [totalClicksResult, clicksByCategoryResult, suggestionCountsResult, activeQuestionsResult, analyticsEventTotals, topQuestions] =
    await Promise.all([
      pool.query<{ total: string | number }>(
        `SELECT COALESCE(SUM(click_count), 0) AS total FROM questions WHERE is_active = TRUE`
      ),
      pool.query<{ category: string; total: string | number }>(
        `SELECT category, COALESCE(SUM(click_count), 0) AS total
         FROM questions
         WHERE is_active = TRUE
         GROUP BY category`
      ),
      pool.query<{ status: string; total: string | number }>(
        `SELECT status, COUNT(*) AS total
         FROM suggestions
         GROUP BY status`
      ),
      pool.query<{ total: string | number }>(
        `SELECT COUNT(*) AS total FROM questions WHERE is_active = TRUE`
      ),
      getAnalyticsEventTotals(),
      getTopQuestions(5)
    ]);

  const suggestionCountsMap = suggestionCountsResult.rows.reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.status] = Number(row.total);
      return acc;
    },
    {}
  );

  const clicksByCategory = clicksByCategoryResult.rows.reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.category] = Number(row.total);
      return acc;
    },
    {}
  );

  return {
    totalClicks: Number(totalClicksResult.rows[0]?.total ?? 0),
    clicksByCategory,
    activeQuestions: Number(activeQuestionsResult.rows[0]?.total ?? 0),
    pendingSuggestions: suggestionCountsMap['pending'] ?? 0,
    approvedSuggestions: suggestionCountsMap['approved'] ?? 0,
    rejectedSuggestions: suggestionCountsMap['rejected'] ?? 0,
    cvDownloads: analyticsEventTotals.cv_download ?? 0,
    githubVisits: analyticsEventTotals.github_visit ?? 0,
    topQuestions: topQuestions.map((question: Question) => ({
      id: question.id,
      text: question.text,
      category: question.category,
      clickCount: question.clickCount
    }))
  };
}
