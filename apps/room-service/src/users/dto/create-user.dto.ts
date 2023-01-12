import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID('all')
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'user@user.com', required: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
