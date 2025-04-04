import { Injectable, OnModuleInit } from '@nestjs/common';
import { connect, Channel } from 'amqplib';
import {ConfigService} from "@nestjs/config";

@Injectable()
export class RabbitService implements OnModuleInit {

  constructor(private readonly configService: ConfigService) {}

  private channel!: Channel;
  private queueName!: string;

  async onModuleInit() {
    const rabbitURL = this.configService.get<string>('RABBITMQ_URL')
    this.queueName = String(this.configService.get<string>('QUEUE_NAME'))
    const connection = await connect(String(rabbitURL));
    this.channel = await connection.createChannel();
    await this.channel.assertQueue(this.queueName, {
      durable: true,
      maxPriority: 10,
    });
  }

  async sendToQueue(message: object, priority: number) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }

    const payload = Buffer.from(JSON.stringify(message));
    this.channel.sendToQueue(this.queueName, payload, { persistent: true, priority });
  }
}
