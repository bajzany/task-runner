import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

@Entity({ name: 'tasks' })
export class TaskEntity {
  @ApiProperty({
    description: 'Unique task ID (UUID)',
    example: 'b1a5f132-2a53-4c3c-bcb1-9e939b471c5d',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Task name or label',
    example: 'Data processing job',
  })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({
    description: 'Priority of the task (1 = lowest, 10 = highest)',
    example: 10,
    minimum: 1,
    maximum: 10,
  })
  @Column({ type: 'int', default: 1 })
  priority!: number;

  @ApiProperty({
    description: 'Current status of the task',
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    example: 'pending',
  })
  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status!: TaskStatus;

  @ApiProperty({
    description: 'Progress of the task in percentage (0–100)',
    example: 50,
  })
  @Column({ type: 'int', default: 0 })
  progress!: number;

  @ApiProperty({
    description: 'Error message (if any)',
    required: false,
    nullable: true,
    example: '',
  })
  @Column({ type: 'text', nullable: true })
  error_msg!: string | null;

  @ApiProperty({
    description: 'Timestamp when the task was created',
    example: '2025-04-03T12:34:56.789Z',
  })
  @CreateDateColumn()
  created_at!: Date;

  @ApiProperty({
    description: 'Timestamp when the task was last updated',
    example: '2025-04-03T12:34:56.789Z',
  })
  @UpdateDateColumn()
  updated_at!: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when task execution ended',
    example: '2025-04-03T12:34:56.789Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  finished_at?: Date;
}
