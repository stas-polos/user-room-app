import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'Simple room', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;
}
