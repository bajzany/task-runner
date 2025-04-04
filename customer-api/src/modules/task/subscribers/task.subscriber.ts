import {DataSource, EntitySubscriberInterface, EventSubscriber, UpdateEvent,} from 'typeorm';
import {TaskEntity} from '../entities/task.entity';
import {TaskStatusLogEntity} from "../entities/task.status.log.entity";

@EventSubscriber()
export class TaskSubscriber implements EntitySubscriberInterface<TaskEntity> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return TaskEntity;
  }

  async afterUpdate(event: UpdateEvent<TaskEntity>): Promise<void> {
    const prevStatus = event.databaseEntity?.status;
    const newStatus = event.entity?.status;

    if (!prevStatus || !newStatus || prevStatus === newStatus) {
      return;
    }

    const log = new TaskStatusLogEntity();
    log.task_id = event.entity!.id;
    log.new_status = newStatus;
    log.reason = `Status changed from "${prevStatus}" to "${newStatus}"`;

    await event.manager.getRepository(TaskStatusLogEntity).save(log);
  }
}
