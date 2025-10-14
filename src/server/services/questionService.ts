import { db } from '../db.js';
import { NotFoundError } from '../utils/errors.js';
import { Question } from '../types/index.js';

function mapQuestion(row: any): Question {
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
     ORDER BY created_at ASC`
  );

  return statement.all().map(mapQuestion);
}

export function getAllQuestions(): Question[] {
  const statement = db.prepare(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     ORDER BY created_at DESC`
  );
  return statement.all().map(mapQuestion);
}

export function getQuestionById(id: number): Question {
  const statement = db.prepare(
    `SELECT id, text, category, click_count, is_active, created_at, updated_at
     FROM questions
     WHERE id = ?`
  );

  const row = statement.get(id);
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
     ORDER BY click_count DESC, created_at DESC
     LIMIT ?`
  );

  return statement.all(limit).map(mapQuestion);
}
