import { db } from '../db.js';
import { createQuestion } from './questionService.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import type { Suggestion } from '../types/index.js';

type SuggestionRow = {
  id: number;
  text: string;
  category: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  question_id: number | null;
};

function mapSuggestion(row: SuggestionRow): Suggestion {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    processedAt: row.processed_at,
    questionId: row.question_id
  };
}

export function createSuggestion(text: string, category?: string | null): Suggestion {
  const statement = db.prepare(
    `INSERT INTO suggestions (text, category, status)
     VALUES (?, ?, 'pending')`
  );

  const result = statement.run(text, category ?? null);
  return getSuggestionById(Number(result.lastInsertRowid));
}

export function getSuggestionById(id: number): Suggestion {
  const statement = db.prepare<[number], SuggestionRow>(
    `SELECT id, text, category, status, created_at, updated_at, processed_at, question_id
     FROM suggestions
     WHERE id = ?`
  );

  const row = statement.get(id);
  if (!row) {
    throw new NotFoundError('Suggestion not found');
  }

  return mapSuggestion(row);
}

export function listSuggestions(status?: Suggestion['status']): Suggestion[] {
  if (status) {
    const statement = db.prepare<[Suggestion['status']], SuggestionRow>(
      `SELECT id, text, category, status, created_at, updated_at, processed_at, question_id
       FROM suggestions
       WHERE status = ?
       ORDER BY created_at DESC`
    );
    return statement.all(status).map(mapSuggestion);
  }

  const statement = db.prepare<[], SuggestionRow>(
    `SELECT id, text, category, status, created_at, updated_at, processed_at, question_id
     FROM suggestions
     ORDER BY created_at DESC`
  );
  return statement.all().map(mapSuggestion);
}

export function approveSuggestion(
  suggestionId: number,
  options: { category?: string | null } = {}
) {
  const suggestion = getSuggestionById(suggestionId);

  if (suggestion.status !== 'pending') {
    throw new AppError('Only pending suggestions can be approved', 409);
  }

  const category = options.category ?? suggestion.category ?? 'general';

  const transaction = db.transaction(() => {
    const question = createQuestion(suggestion.text, category);

    const updateStatement = db.prepare(
      `UPDATE suggestions
       SET status = 'approved',
           category = ?,
           question_id = ?,
           processed_at = datetime('now'),
           updated_at = datetime('now')
       WHERE id = ?`
    );

    updateStatement.run(category, question.id, suggestionId);

    return { suggestion: getSuggestionById(suggestionId), question };
  });

  return transaction();
}

export function rejectSuggestion(suggestionId: number) {
  const suggestion = getSuggestionById(suggestionId);

  if (suggestion.status !== 'pending') {
    throw new AppError('Only pending suggestions can be rejected', 409);
  }

  const updateStatement = db.prepare(
    `UPDATE suggestions
     SET status = 'rejected',
         processed_at = datetime('now'),
         updated_at = datetime('now')
     WHERE id = ?`
  );

  updateStatement.run(suggestionId);
  return getSuggestionById(suggestionId);
}

export function deleteSuggestion(suggestionId: number) {
  const suggestion = getSuggestionById(suggestionId);

  if (suggestion.status !== 'pending') {
    throw new AppError('Only pending suggestions can be deleted', 409);
  }

  const deleteStatement = db.prepare(
    `DELETE FROM suggestions
     WHERE id = ?`
  );

  deleteStatement.run(suggestionId);
}
