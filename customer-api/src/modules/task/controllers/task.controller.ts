import {Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Query,} from '@nestjs/common';
import {TaskService} from '../services/task.service';
import {ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from '@nestjs/swagger';
import {TaskEntity} from '../entities/task.entity';
import {CreateTaskDto} from "../dto/create.task.dto";
import {UpdateTaskStatusDto} from "../dto/update.status.dto";
import {TaskStatusLogEntity} from "../entities/task.status.log.entity";

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 200, description: 'Task has been created', type: TaskEntity })
  create(@Body() data: CreateTaskDto): Promise<TaskEntity> {
    return this.taskService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks with pagination' })
  @ApiResponse({ status: 200, description: 'List of tasks with pagination' })
  getTasks(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10
  ) {
    return this.taskService.findPaginated(Number(page), Number(pageSize));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns various statistics about tasks',
    schema: {
      example: {
        total: '128',
        completed: '57',
        failed: '9',
        cancelled: '12',
        pending: '20',
        in_progress: '30',
        avg_duration_sec: '42.1',
        max_duration_sec: '91',
        min_duration_sec: '8',
      },
    },
  })
  getStats() {
    return this.taskService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task details by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Task found', type: TaskEntity })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string): Promise<TaskEntity> {
    const task = await this.taskService.findOne(id);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get status change history of a task' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Task status history found', type: [TaskStatusLogEntity] })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getHistory(@Param('id') id: string): Promise<TaskStatusLogEntity[]> {
    const task = await this.taskService.findOne(id);
    if (!task) throw new NotFoundException('Task not found');

    return this.taskService.getStatusHistory(id);
  }

  @Post(':id/status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update task status or progress' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
  @ApiBody({ type: UpdateTaskStatusDto })
  @ApiResponse({ status: 200, description: 'Updated task entity', type: TaskEntity })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateTaskStatusDto
  ): Promise<TaskEntity> {
    return this.taskService.updateStatus(id, body);
  }

  @Post(':id/restart')
  @ApiOperation({ summary: 'Restart a task (set it back to pending)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Task has been restarted', type: TaskEntity })
  @ApiResponse({ status: 404, description: 'Task not found' })
  restart(@Param('id') id: string): Promise<TaskEntity> {
    return this.taskService.restart(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a running task' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Task has been cancelled', type: TaskEntity })
  @ApiResponse({ status: 404, description: 'Task not found' })
  cancel(@Param('id') id: string): Promise<TaskEntity> {
    return this.taskService.cancel(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete task by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async delete(@Param('id') id: string): Promise<void> {
    const task = await this.taskService.findOne(id);
    if (!task) throw new NotFoundException('Task not found');
    await this.taskService.delete(id);
  }

}
