import {IsInt, IsNotEmpty, IsString, Max, Min} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Name of the task',
    example: 'Generate weekly report',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Priority of the task',
    example: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  priority!: number;
}
