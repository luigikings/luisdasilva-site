import { Pool } from 'pg';
import { env } from './env.js';

const isLocalConnection = env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isLocalConnection
    ? false
    : {
        rejectUnauthorized: false
      }
});

export type DatabaseClient = typeof pool;

export async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL');

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        click_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        processed_at TIMESTAMP WITH TIME ZONE,
        question_id INTEGER REFERENCES questions(id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        event_type TEXT PRIMARY KEY,
        total INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS questions_text_unique ON questions (text)
    `);

    await client.query(
      `INSERT INTO admin_credentials (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         updated_at = NOW()`,
      [env.ADMIN_EMAIL.toLowerCase(), env.ADMIN_PASSWORD_HASH]
    );
  } finally {
    client.release();
  }
}

export async function closeDatabase() {
  await pool.end();
}
