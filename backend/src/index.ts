import { createApp } from './app.js';
import { env } from './env.js';
import { initializeDatabase } from './db.js';

async function bootstrap() {
  try {
    await initializeDatabase();

    const app = createApp();
    app.listen(env.PORT, () => {
      console.log(`🚀 API server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server', error);
    process.exit(1);
  }
}

void bootstrap();
