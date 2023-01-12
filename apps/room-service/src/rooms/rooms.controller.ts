import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard, RmqService } from '@app/common';
import { RoomsService } from './rooms.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRoomDto } from './dto';
import { Room } from './room.entity';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { object } from 'joi';
import { AuthUser } from '../auth/decorators';
import { AuthenticatableInterface } from '../auth/interfaces';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);

  constructor(
    private readonly rmqService: RmqService,
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Create room.' })
  @ApiBody({
    type: CreateRoomDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: Room,
    description: 'The request must create and return new room.',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  create(@Body() createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomsService.create(createRoomDto);
  }

  @ApiOperation({ summary: 'Delete room by id' })
  @ApiParam({
    name: 'roomId',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID room.',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    type: null,
  })
  @Delete('/:roomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(ClassSerializerInterceptor)
  delete(@Param('roomId', ParseUUIDPipe) roomId: string): Promise<Room> {
    return this.roomsService.delete(roomId);
  }

  @ApiOperation({ summary: 'Get information room by id' })
  @ApiParam({
    name: 'roomId',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID room.',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Room,
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:roomId')
  show(@Param('roomId', ParseUUIDPipe) roomId: string): Promise<Room> {
    return this.roomsService.getById(roomId);
  }

  @ApiOperation({ summary: 'Entrance the room by id.' })
  @ApiParam({
    name: 'roomId',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID room.',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: object,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/:roomId/entrance')
  entrance(
    @AuthUser() authUser: AuthenticatableInterface,
    @Param('roomId', ParseUUIDPipe) roomId: string,
  ): Promise<User> {
    return this.roomsService.entrance(authUser, roomId);
  }

  @ApiOperation({ summary: 'Exit the room by id.' })
  @ApiParam({
    name: 'roomId',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID room.',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: object,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/:roomId/exit')
  exit(
    @AuthUser() authUser: AuthenticatableInterface,
    @Param('roomId', ParseUUIDPipe) roomId: string,
  ): Promise<User> {
    return this.roomsService.exit(authUser, roomId);
  }

  @EventPattern('created_user')
  @UseInterceptors(ClassSerializerInterceptor)
  handleAuthenticatedUser(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.debug(data);

    const { id, email } = data;

    this.usersService.create({ id, email });
    this.rmqService.ack(context);
  }
}
