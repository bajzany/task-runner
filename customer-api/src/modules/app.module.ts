import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {HealthModule} from './health/health.module';
import {TaskModule} from './task/task.module';
import {TaskEntity} from './task/entities/task.entity';
import {TaskStatusLogEntity} from "./task/entities/task.status.log.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [TaskEntity, TaskStatusLogEntity],
        synchronize: true,
      }),
    }),
    HealthModule,
    TaskModule,
  ],
})
export class AppModule {}
