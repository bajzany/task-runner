import * as amqp from 'amqplib';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL!;
const QUEUE_NAME = process.env.QUEUE_NAME!;
const EXECUTOR_IMAGE = process.env.EXECUTOR_IMAGE!;
const CUSTOMER_API_URL = process.env.CUSTOMER_API_URL!;
const ERROR_QUEUE_NAME = process.env.ERROR_QUEUE_NAME!;

const MAX_EXECUTORS = Number(process.env.MAX_EXECUTORS);
const MIN_EXECUTORS = Number(process.env.MIN_EXECUTORS);

const TASKS_PER_EXECUTOR = 5;
const CHECK_INTERVAL_MS = 15_000;

const EXECUTOR_BASE_NAME = 'automatic_executor_'

async function getQueueSize(): Promise<number> {
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  const queue = await channel.checkQueue(QUEUE_NAME);
  await channel.close();
  await conn.close();
  return queue.messageCount;
}

async function getRunningExecutors(): Promise<string[]> {
  return new Promise((resolve) => {
    exec(`docker ps --filter "name=${EXECUTOR_BASE_NAME}" --format "{{.Names}}"`, (err, stdout) => {
      if (err) return resolve([]);
      const names = stdout.trim().split('\n').filter(Boolean);
      resolve(names);
    });
  });
}

async function cleanupStaleExecutors() {
  const runningExecutors = await getRunningExecutors();
  for (const name of runningExecutors) {
    console.log(`Cleaning up existing executor: ${name}`);
    exec(`docker kill -s SIGTERM ${name}`);
  }
}

async function scaleExecutors() {
  const messages = await getQueueSize();
  const runningExecutors = await getRunningExecutors();

  const idealCount = Math.min(
    MAX_EXECUTORS,
    Math.max(MIN_EXECUTORS, Math.ceil(messages / TASKS_PER_EXECUTOR))
  );

  if (idealCount > runningExecutors.length) {
    const toStart = idealCount - runningExecutors.length;
    for (let i = 0; i < toStart; i++) {
      const name = `${EXECUTOR_BASE_NAME}${Date.now()}_${i}`;
      console.log(`Starting ${name}`);
      exec(
        `docker run --init --name ${name} \
        -e CUSTOMER_API_URL=${CUSTOMER_API_URL} \
        -e RABBITMQ_URL=${RABBITMQ_URL} \
        -e QUEUE_NAME=${QUEUE_NAME} \
        -e ERROR_QUEUE_NAME=${ERROR_QUEUE_NAME} \
        --rm ${EXECUTOR_IMAGE}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error('Error:', error.message);
            return;
          }
          console.log('Executor started:', stdout);
        }
      );
    }
  } else if (idealCount < runningExecutors.length) {
    const toStop = runningExecutors.length - idealCount;
    for (let i = 0; i < toStop; i++) {
      const name = runningExecutors[i];
      console.log(`Stopping ${name}`);
      exec(`docker exec ${name} curl -X POST http://localhost:4000/shutdown`);
    }
  } else {
    console.log('Executors count is optimal.');
  }
}

cleanupStaleExecutors().then(() => {
  setInterval(scaleExecutors, CHECK_INTERVAL_MS);
  console.log('Orchestrator started and polling queue every 15s');
});
