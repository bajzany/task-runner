import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TaskEntity, TaskStatus } from './task.entity';

@Entity({ name: 'task_status_logs' })
export class TaskStatusLogEntity {
  @ApiProperty({ description: 'Log entry ID (UUID)', example: 'c87f2143-1234-4cd3-a8df-23456' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Associated task ID' })
  @Column()
  task_id!: string;

  @ManyToOne(() => TaskEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: TaskEntity;

  @ApiProperty({
    description: 'New status assigned to the task',
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    example: 'in_progress',
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
  })
  new_status!: TaskStatus;

  @ApiProperty({
    description: 'Optional message explaining the status change',
    example: 'Status changed from "pending" to "in_progress"',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  reason?: string;

  @ApiProperty({
    description: 'When the status change occurred',
    example: '2025-04-03T12:34:56.789Z',
  })
  @CreateDateColumn()
  changed_at!: Date;
}
