import { pool } from '../db.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import type { Suggestion, Question } from '../types/index.js';

type SuggestionRow = {
  id: number;
  text: string;
  category: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date | string;
  updated_at: Date | string;
  processed_at: Date | string | null;
  question_id: number | null;
};

type QuestionRow = {
  id: number;
  text: string;
  category: string;
  click_count: number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

function toIsoString(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapSuggestion(row: SuggestionRow): Suggestion {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    status: row.status,
    createdAt: toIsoString(row.created_at)!,
    updatedAt: toIsoString(row.updated_at)!,
    processedAt: toIsoString(row.processed_at),
    questionId: row.question_id
  };
}

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    clickCount: Number(row.click_count),
    isActive: row.is_active,
    createdAt: toIsoString(row.created_at)!,
    updatedAt: toIsoString(row.updated_at)!
  };
}

export async function createSuggestion(text: string, category?: string | null): Promise<Suggestion> {
  const normalizedText = text.trim();
  const trimmedCategory = category?.trim();
  const normalizedCategory = trimmedCategory ? trimmedCategory : null;

  const { rows } = await pool.query<SuggestionRow>(
    `INSERT INTO suggestions (text, category, status)
     VALUES ($1, $2, 'pending')
     RETURNING id, text, category, status, created_at, updated_at, processed_at, question_id`,
    [normalizedText, normalizedCategory]
  );

  return mapSuggestion(rows[0]);
}

export async function getSuggestionById(id: number): Promise<Suggestion> {
  const { rows } = await pool.query<SuggestionRow>(
    `SELECT id, text, category, status, created_at, updated_at, processed_at, question_id
     FROM suggestions
     WHERE id = $1`,
    [id]
  );

  const row = rows[0];
  if (!row) {
    throw new NotFoundError('Suggestion not found');
  }

  return mapSuggestion(row);
}

export async function listSuggestions(status?: Suggestion['status']): Promise<Suggestion[]> {
  if (status) {
    const { rows } = await pool.query<SuggestionRow>(
      `SELECT id, text, category, status, created_at, updated_at, processed_at, question_id
       FROM suggestions
       WHERE status = $1
       ORDER BY created_at DESC`,
      [status]
    );

    return rows.map(mapSuggestion);
  }

  const { rows } = await pool.query<SuggestionRow>(
    `SELECT id, text, category, status, created_at, updated_at, processed_at, question_id
     FROM suggestions
     ORDER BY created_at DESC`
  );

  return rows.map(mapSuggestion);
}

export async function approveSuggestion(
  suggestionId: number,
  options: { category?: string | null } = {}
): Promise<{ suggestion: Suggestion; question: Question }> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: suggestionRows } = await client.query<SuggestionRow>(
      `SELECT id, text, category, status, created_at, updated_at, processed_at, question_id
       FROM suggestions
       WHERE id = $1
       FOR UPDATE`,
      [suggestionId]
    );

    const suggestionRow = suggestionRows[0];
    if (!suggestionRow) {
      throw new NotFoundError('Suggestion not found');
    }

    if (suggestionRow.status !== 'pending') {
      throw new AppError('Only pending suggestions can be approved', 409);
    }

    const category = (options.category ?? suggestionRow.category ?? 'general').trim() || 'general';

    const { rows: questionRows } = await client.query<QuestionRow>(
      `INSERT INTO questions (text, category)
       VALUES ($1, $2)
       RETURNING id, text, category, click_count, is_active, created_at, updated_at`,
      [suggestionRow.text, category]
    );

    const questionRow = questionRows[0];
    if (!questionRow) {
      throw new AppError('Failed to create question from suggestion');
    }

    const { rows: updatedSuggestionRows } = await client.query<SuggestionRow>(
      `UPDATE suggestions
       SET status = 'approved',
           category = $1,
           question_id = $2,
           processed_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, text, category, status, created_at, updated_at, processed_at, question_id`,
      [category, questionRow.id, suggestionId]
    );

    const updatedSuggestionRow = updatedSuggestionRows[0];
    if (!updatedSuggestionRow) {
      throw new AppError('Failed to update suggestion status');
    }

    await client.query('COMMIT');

    return {
      suggestion: mapSuggestion(updatedSuggestionRow),
      question: mapQuestion(questionRow)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function rejectSuggestion(suggestionId: number): Promise<Suggestion> {
  const suggestion = await getSuggestionById(suggestionId);

  if (suggestion.status !== 'pending') {
    throw new AppError('Only pending suggestions can be rejected', 409);
  }

  const { rows } = await pool.query<SuggestionRow>(
    `UPDATE suggestions
     SET status = 'rejected',
         processed_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, text, category, status, created_at, updated_at, processed_at, question_id`,
    [suggestionId]
  );

  return mapSuggestion(rows[0]);
}

export async function deleteSuggestion(suggestionId: number): Promise<void> {
  const suggestion = await getSuggestionById(suggestionId);

  if (suggestion.status !== 'pending') {
    throw new AppError('Only pending suggestions can be deleted', 409);
  }

  const result = await pool.query(
    `DELETE FROM suggestions
     WHERE id = $1`,
    [suggestionId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError('Suggestion not found');
  }
}
