import * as amqp from 'amqplib';
import {ConsumeMessage} from 'amqplib';
import {Status, TaskApiClient} from "../clients/TaskApiClient";
import {ConnectionTimeoutError} from "../utilities/ConnectionTimeoutError";

export class ExecutorService {
  private readonly queueName: string;
  private readonly errorQueueName: string;
  private readonly rabbitUrl: string;
  private readonly maxAttempts: number;
  private readonly taskApi: TaskApiClient;
  private channel!: amqp.Channel;
  private isShuttingDown = false;
  private isTaskRunning = false;

  constructor() {
    this.rabbitUrl = process.env.RABBITMQ_URL!;
    this.queueName = process.env.QUEUE_NAME!;
    this.errorQueueName = process.env.ERROR_QUEUE_NAME!;
    this.maxAttempts = 3;
    const CUSTOMER_API_URL = process.env.CUSTOMER_API_URL!;
    this.taskApi = new TaskApiClient(CUSTOMER_API_URL);
  }

  async run(): Promise<void> {
    const conn = await amqp.connect(this.rabbitUrl);
    this.channel = await conn.createChannel();

    await this.channel.assertQueue(this.queueName, {
      durable: true,
      maxPriority: 10,
    });

    await this.channel.assertQueue(this.errorQueueName, {
      durable: true,
    });

    await this.channel.prefetch(1);

    console.log('Executor connected and waiting for tasks');

    await this.channel.consume(this.queueName, this.handleMessage.bind(this), {noAck: false});
  }

  private getRandomDelay(minMS: number = 5000, maxMS: number = 120_000) {
    return Math.floor(Math.random() * (maxMS - minMS + 1)) + minMS;
  }

  private async processTask(taskId: string) {
    const duration = this.getRandomDelay()
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await new Promise((res) => setTimeout(res, duration / steps));
      const currentTask = await this.taskApi.getTask(taskId);
      if (currentTask.status === 'cancelled') {
        const errorMessage = `Task ${taskId} was cancelled`
        console.log(errorMessage);
        await this.taskApi.updateTask(taskId, {
          status: 'cancelled',
          progress: 0,
        });
        throw new Error(errorMessage)
      }
      const progress = Math.floor((i / steps) * 100);
      await this.taskApi.updateTask(taskId, {progress});
    }
  }

  private isStatusAllowed(status: Status): boolean {
    const allowedStatuses: Status[] = ['pending', 'failed']
    return allowedStatuses.includes(status)
  }

  async shutdown(): Promise<void> {
    if (this.isTaskRunning) {
      console.log('Task is still running. Shutdown will proceed after completion.');
      this.isShuttingDown = true;
      return;
    }

    console.log('Shutdown in progress...');
    this.isShuttingDown = true;

    try {
      if (this.channel) {
        await this.channel.close();
      }
      console.log('Shutdown complete. Exiting...');
      process.exit(1);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  }

  private async handleMessage(msg: amqp.ConsumeMessage | null) {
    if (!msg) return;

    if (this.isShuttingDown) {
      console.log(`Skipping message because we're shutting down.`);
      return;
    }

    this.isTaskRunning = true;

    const data = JSON.parse(msg.content.toString());
    const taskId = data.id;
    const attempt = msg.properties.headers?.attempt || 0;

    try {
      const task = await this.taskApi.getTask(taskId);
      if (!task) {
        console.log(`Task ${taskId} does not exist, skipping.`);
        this.channel.ack(msg);
        return;
      }

      if (!this.isStatusAllowed(task.status)) {
        console.log(`Task ${taskId} status: ${task.status} is not allowed, skipping.`);
        this.channel.ack(msg);
        return;
      }

      console.log(`Starting task ${taskId}: ${task.name}`);
      await this.taskApi.updateTask(taskId, {status: 'in_progress', progress: 0});

      try {
        await this.processTask(taskId)
      } catch (e) {
        this.channel.ack(msg);
        return;
      }

      const shouldFail = Math.random() < 0.3;
      if (shouldFail) {
        throw Math.random() < 0.5
          ? new ConnectionTimeoutError('SIMULATED DB CONNECTION ERROR')
          : new Error('CRITICAL ERROR');
      }

      await this.taskApi.updateTask(taskId, {
        status: 'completed',
        progress: 100,
        error_msg: null,
      });

      console.log(`Task ${taskId} completed successfully`);
      this.channel.ack(msg);
    } catch (err: any) {
      console.error(`Task ${taskId} failed: ${err.message}`);
      // IF ConnectionTimeoutError try next attempt
      if (err instanceof ConnectionTimeoutError) {
        if (attempt < this.maxAttempts) {
          const nextAttempt = attempt + 1
          console.warn(`Retrying task ${taskId} (attempt ${nextAttempt})`);
          await this.taskApi.updateTask(taskId, {
            status: 'failed',
            progress: 0,
            error_msg: err.message,
          });
          this.channel.sendToQueue(this.queueName, Buffer.from(msg.content), {
            persistent: true,
            priority: data.priority ?? 1,
            headers: {attempt: nextAttempt},
          });
        } else {
          console.warn(`Max attempts for task ${taskId}. Moving to ${this.errorQueueName}`);
          await this.taskApi.updateTask(taskId, {
            status: 'failed',
            progress: 0,
            error_msg: err.message,
          });
          await this.sendToErrorQueue(data, err.message);
        }

        this.channel.ack(msg);
        return;
      }

      try {
        await this.taskApi.updateTask(taskId, {
          status: 'failed',
          error_msg: err.message,
        });
      } catch (updateError: any) {
        console.error(`Failed to mark task as failed: ${updateError.message}`);
      }

      await this.sendToErrorQueue(data, err.message);
      this.channel.ack(msg);
    } finally {
      this.isTaskRunning = false;
      if (this.isShuttingDown) {
        console.log('Task finished. Proceeding to shutdown.');
        await this.shutdown();
      }
    }
  }

  private async sendToErrorQueue(payload: any, reason: string): Promise<void> {
    this.channel.sendToQueue(this.errorQueueName, Buffer.from(JSON.stringify({
      ...payload,
      error_reason: reason,
      timestamp: new Date().toISOString(),
    })), {
      persistent: true,
    });
  }
}
