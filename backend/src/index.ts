import { createApp } from './app.js';
import { env } from './env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 API server running on port ${env.PORT}`);
});
