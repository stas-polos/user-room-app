import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/basic_auth/guards';
import { AuthUser } from '../auth/basic_auth/decorators';
import { AuthenticatableInterface } from '../auth/basic_auth/interfaces';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get information current auth user' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('user')
  show(@AuthUser() user: AuthenticatableInterface) {
    return this.usersService.getById(user.id);
  }

  @MessagePattern('entrance-or-exit-to-room')
  @UseInterceptors(ClassSerializerInterceptor)
  entranceOrExitToRoom(
    @Payload() user: { id: string; inRoom: boolean },
  ): Promise<User> {
    return this.usersService.entranceOrExitToRoom(user.id, user.inRoom);
  }

  @MessagePattern('check-user-in-room')
  @UseInterceptors(ClassSerializerInterceptor)
  checkUserInRoom(
    @Payload() user: AuthenticatableInterface,
  ): Promise<boolean | undefined> {
    return this.usersService.checkUserInRoom(user);
  }
}
