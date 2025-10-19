import { initializeDatabase, closeDatabase } from './db.js';

async function run() {
  try {
    await initializeDatabase();
    console.log('✅ Database schema is up to date');
  } catch (error) {
    console.error('❌ Database migration failed', error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

void run();
