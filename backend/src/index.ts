import { createApp } from './app.js';
import { env } from './env.js';

// env validation runs at import time — if it throws, the process exits before listen()
const app = createApp();

app.listen(env.PORT, () => {
  console.log(`📬 Email API running on port ${env.PORT}`);
});