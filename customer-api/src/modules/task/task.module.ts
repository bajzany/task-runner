import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TaskEntity} from './entities/task.entity';
import {TaskService} from './services/task.service';
import {TaskController} from './controllers/task.controller';
import {RabbitService} from "./services/rabbit.service";
import {TaskStatusLogEntity} from "./entities/task.status.log.entity";
import {TaskSubscriber} from "./subscribers/task.subscriber";

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TaskStatusLogEntity])],
  controllers: [TaskController],
  providers: [TaskService, RabbitService, TaskSubscriber],
})
export class TaskModule {}
