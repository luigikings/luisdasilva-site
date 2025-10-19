import { pool } from '../db.js';
import { NotFoundError } from '../utils/errors.js';
import type { Question } from '../types/index.js';

type QuestionRow = {
  id: number;
  text: string;
  category: string;
  click_count: number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    clickCount: Number(row.click_count),
    isActive: row.is_active,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };
}

export async function getActiveQuestions(): Promise<Question[]> {
  const { rows } = await pool.query<QuestionRow>(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     WHERE is_active = TRUE
     ORDER BY updated_at DESC, created_at DESC`
  );

  return rows.map(mapQuestion);
}

export async function getAllQuestions(): Promise<Question[]> {
  const { rows } = await pool.query<QuestionRow>(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     ORDER BY updated_at DESC, created_at DESC`
  );

  return rows.map(mapQuestion);
}

export async function getQuestionById(id: number): Promise<Question> {
  const { rows } = await pool.query<QuestionRow>(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     WHERE id = $1`,
    [id]
  );

  const row = rows[0];
  if (!row) {
    throw new NotFoundError('Question not found');
  }

  return mapQuestion(row);
}

export async function incrementQuestionClick(questionId: number): Promise<Question> {
  const { rows } = await pool.query<QuestionRow>(
    `UPDATE questions
     SET click_count = click_count + 1,
         updated_at = NOW()
     WHERE id = $1 AND is_active = TRUE
     RETURNING id, text, category, click_count, is_active, created_at, updated_at`,
    [questionId]
  );

  const row = rows[0];
  if (!row) {
    throw new NotFoundError('Question not found or inactive');
  }

  return mapQuestion(row);
}

export async function getQuestionByText(text: string): Promise<Question> {
  const { rows } = await pool.query<QuestionRow>(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     WHERE text = $1`,
    [text]
  );

  const row = rows[0];
  if (!row) {
    throw new NotFoundError('Question not found');
  }

  return mapQuestion(row);
}

export async function createQuestion(text: string, category: string): Promise<Question> {
  const { rows } = await pool.query<QuestionRow>(
    `INSERT INTO questions (text, category)
     VALUES ($1, $2)
     RETURNING id, text, category, click_count, is_active, created_at, updated_at`,
    [text, category]
  );

  return mapQuestion(rows[0]);
}

export async function getTopQuestions(limit: number): Promise<Question[]> {
  const { rows } = await pool.query<QuestionRow>(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     WHERE is_active = TRUE
     ORDER BY click_count DESC, updated_at DESC, created_at DESC
     LIMIT $1`,
    [limit]
  );

  return rows.map(mapQuestion);
}

export async function trackQuestionUsage(payload: {
  text: string;
  category?: string | null;
}): Promise<Question> {
  const category = (payload.category ?? 'general').trim() || 'general';
  const normalizedText = payload.text.trim();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO questions (text, category, is_active)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (text) DO UPDATE SET
         category = EXCLUDED.category,
         is_active = TRUE,
         updated_at = NOW()`,
      [normalizedText, category]
    );

    const { rows } = await client.query<QuestionRow>(
      `UPDATE questions
       SET click_count = click_count + 1,
           updated_at = NOW()
       WHERE text = $1
       RETURNING id, text, category, click_count, is_active, created_at, updated_at`,
      [normalizedText]
    );

    await client.query('COMMIT');

    const row = rows[0];
    if (!row) {
      throw new NotFoundError('Question not found');
    }

    return mapQuestion(row);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
