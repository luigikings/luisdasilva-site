import { db } from '../db.js';
import { NotFoundError } from '../utils/errors.js';
import type { Question } from '../types/index.js';

type QuestionRow = {
  id: number;
  text: string;
  category: string;
  click_count: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    clickCount: row.click_count,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function getActiveQuestions(): Question[] {
  const statement = db.prepare(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     WHERE is_active = 1
     ORDER BY updated_at DESC, created_at DESC`
  );

  const rows = statement.all() as QuestionRow[];
  return rows.map(mapQuestion);
}

export function getAllQuestions(): Question[] {
  const statement = db.prepare(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     ORDER BY updated_at DESC, created_at DESC`
  );
  const rows = statement.all() as QuestionRow[];
  return rows.map(mapQuestion);
}

export function getQuestionById(id: number): Question {
  const statement = db.prepare(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     WHERE id = ?`
  );

  const row = statement.get(id) as QuestionRow | undefined;
  if (!row) {
    throw new NotFoundError('Question not found');
  }

  return mapQuestion(row);
}

export function incrementQuestionClick(questionId: number): Question {
  const updateStatement = db.prepare(
    `UPDATE questions
     SET click_count = click_count + 1,
         updated_at = datetime('now')
     WHERE id = ? AND is_active = 1`
  );

  const result = updateStatement.run(questionId);

  if (result.changes === 0) {
    throw new NotFoundError('Question not found or inactive');
  }

  return getQuestionById(questionId);
}

export function getQuestionByText(text: string): Question {
  const statement = db.prepare(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     WHERE text = ?`
  );

  const row = statement.get(text) as QuestionRow | undefined;

  if (!row) {
    throw new NotFoundError('Question not found');
  }

  return mapQuestion(row);
}

export function createQuestion(text: string, category: string): Question {
  const insertStatement = db.prepare(
    `INSERT INTO questions (text, category, click_count, is_active)
     VALUES (?, ?, 0, 1)`
  );

  const result = insertStatement.run(text, category);
  return getQuestionById(Number(result.lastInsertRowid));
}

export function getTopQuestions(limit: number): Question[] {
  const statement = db.prepare(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     WHERE is_active = 1
     ORDER BY click_count DESC, updated_at DESC, created_at DESC
     LIMIT ?`
  );

  const rows = statement.all(limit) as QuestionRow[];
  return rows.map(mapQuestion);
}

export function trackQuestionUsage(payload: {
  text: string;
  category?: string | null;
}): Question {
  const category = (payload.category ?? 'general').trim() || 'general';

  const run = db.transaction(() => {
    const upsertStatement = db.prepare(
      `INSERT INTO questions (text, category, click_count, is_active, created_at, updated_at)
       VALUES (?, ?, 0, 1, datetime('now'), datetime('now'))
       ON CONFLICT(text) DO UPDATE SET
         category = excluded.category,
         is_active = 1,
         updated_at = datetime('now')`
    );

    upsertStatement.run(payload.text, category);

    const incrementStatement = db.prepare(
      `UPDATE questions
       SET click_count = click_count + 1,
           updated_at = datetime('now')
       WHERE text = ?`
    );

    incrementStatement.run(payload.text);

    return getQuestionByText(payload.text);
  });

  return run();
}
