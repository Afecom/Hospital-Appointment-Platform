import 'dotenv/config';
import { slotworker } from './slot.worker.js';

// Basic visibility / lifecycle handling for the worker process
slotworker.on('completed', (job) => {
  console.log(`Job completed: ${job.id} (${job.name})`);
});

slotworker.on('failed', (job, err) => {
  console.error(`Job failed: ${job?.id} (${job?.name})`, err?.message || err);
});

process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await slotworker.close();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception in worker process', err);
  process.exit(1);
});

console.log('Worker process started');
