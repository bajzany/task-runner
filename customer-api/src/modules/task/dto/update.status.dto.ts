import {ApiProperty} from "@nestjs/swagger";
import {TaskStatus} from "../entities/task.entity";

export class UpdateTaskStatusDto {
  @ApiProperty({ required: false, enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'] })
  status?: TaskStatus;

  @ApiProperty({ required: false, example: 80 })
  progress?: number;

  @ApiProperty({ required: false, example: 'Something went wrong' })
  error_msg?: string;
}
