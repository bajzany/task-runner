import * as dotenv from 'dotenv';
import express from 'express';
import { ExecutorService } from './services/ExecutorService';

dotenv.config();

async function runExecutor() {
  const executorService = new ExecutorService();
  const app = express();
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Executor API listening on port ${PORT}`);
  });

  app.post('/shutdown', async (req, res) => {
    console.log('Shutdown requested via HTTP');
    res.send('Shutting down');
    await executorService.shutdown();
  });

  await executorService.run()
}

runExecutor().catch((err) => {
  console.error('Executor crashed:', err);
  process.exit(1);
});
