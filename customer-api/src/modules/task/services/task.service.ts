import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {TaskEntity} from '../entities/task.entity';
import {Repository} from 'typeorm';
import {RabbitService} from "./rabbit.service";
import {CreateTaskDto} from "../dto/create.task.dto";
import {TaskStatusLogEntity} from "../entities/task.status.log.entity";

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepo: Repository<TaskEntity>,
    @InjectRepository(TaskStatusLogEntity)
    private readonly statusLogRepo: Repository<TaskStatusLogEntity>,
    private readonly rabbitService: RabbitService,
  ) {}

  async create(data: CreateTaskDto): Promise<TaskEntity> {
    const task = this.taskRepo.create({
      name: data.name,
      priority: data.priority,
    });

    const saved = await this.taskRepo.save(task);

    await this.rabbitService.sendToQueue({
      id: saved.id,
      name: saved.name,
      created_at: saved.created_at,
    }, saved.priority);

    return saved;
  }

  findOne(id: string): Promise<TaskEntity | null> {
    return this.taskRepo.findOneBy({ id });
  }

  async getStatusHistory(taskId: string): Promise<TaskStatusLogEntity[]> {
    return this.statusLogRepo.find({
      where: { task_id: taskId },
      order: { changed_at: 'desc' },
    });
  }

  async updateStatus(id: string, data: Partial<TaskEntity>): Promise<TaskEntity> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (data.status === 'completed') {
      data.finished_at = new Date()
    }
    const updated = this.taskRepo.merge(task, data);
    return this.taskRepo.save(updated);
  }

  async cancel(id: string): Promise<TaskEntity> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    task.status = 'cancelled';
    return this.taskRepo.save(task);
  }

  async restart(id: string): Promise<TaskEntity> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    task.status = 'pending';
    task.progress = 0;
    task.error_msg = null;
    const saved = await this.taskRepo.save(task);

    await this.rabbitService.sendToQueue({
      id: saved.id,
      name: saved.name,
      created_at: saved.created_at,
    }, saved.priority);

    return saved;
  }

  async delete(id: string): Promise<void> {
    await this.taskRepo.delete({ id });
  }

  async findPaginated(page = 1, pageSize = 10): Promise<{ data: TaskEntity[]; total: number }> {
    const [data, total] = await this.taskRepo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async getStatistics() {
    const result = await this.taskRepo.query(`
    SELECT
      COUNT(*) AS total,
      SUM(status = 'completed') AS completed,
      SUM(status = 'failed') AS failed,
      SUM(status = 'cancelled') AS cancelled,
      SUM(status = 'pending') AS pending,
      SUM(status = 'in_progress') AS in_progress,
      ROUND(AVG(TIMESTAMPDIFF(SECOND, created_at, finished_at)), 2) AS avg_duration_sec,
      MAX(TIMESTAMPDIFF(SECOND, created_at, finished_at)) AS max_duration_sec,
      MIN(TIMESTAMPDIFF(SECOND, created_at, finished_at)) AS min_duration_sec
    FROM tasks
  `);

    return result[0];
  }
}
