import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { RmqService, ROOM_SERVICE, USER_SERVICE } from '@app/common';
import { AuthenticatableInterface } from '../auth/interfaces';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class RoomsService {
  microserviceClients: { [key: string]: ClientProxy } = {};

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly rmqService: RmqService,
    private readonly usersService: UsersService,
    @Inject('TCP_USER_SERVICE')
    private readonly clientProxy: ClientProxy,
  ) {
    for (const microservice of [ROOM_SERVICE, USER_SERVICE]) {
      this.microserviceClients[microservice] = ClientProxyFactory.create(
        this.rmqService.getOptions(microservice),
      );
    }
  }

  public async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = await this.roomRepository.create(createRoomDto);

    await this.roomRepository.save(room);

    return room;
  }

  public async delete(id: string): Promise<Room> {
    const room = await this.getById(id);
    if (!room) {
      throw new NotFoundException([`Room with '${id}' ids not found`]);
    }

    await Promise.all([
      this.roomRepository.softDelete({ id }),
      room.users.map(async ({ id, email, roomId }) => {
        await Promise.all([
          this.usersService.entranceOrExitToRoom({ id, email, roomId }),
          this.entranceOrExitToRoom(id),
        ]);
      }),
    ]);

    return this.getById(id, true);
  }

  public getById(id: string, withDeleted = false): Promise<Room | undefined> {
    return this.roomRepository.findOne(
      {
        id,
      },
      { relations: ['users'], withDeleted: withDeleted },
    );
  }

  public async entrance(authUser: AuthenticatableInterface, id: string) {
    if (await this.checkUserInRoom(authUser)) {
      throw new BadRequestException(['You are already in the room']);
    }

    await Promise.all([
      this.usersService.entranceOrExitToRoom(authUser, id),
      this.entranceOrExitToRoom(authUser.id, true),
    ]);

    return this.usersService.getById(authUser.id);
  }

  public async exit(authUser: AuthenticatableInterface, id: string) {
    if (!(await this.checkUserInRoom(authUser))) {
      throw new BadRequestException(['You are not in any room']);
    }

    const { room } = await this.usersService.getById(authUser.id);

    if (room.id !== id) {
      throw new BadRequestException([
        `You are not in the room with id "${id}"`,
      ]);
    }

    await Promise.all([
      this.usersService.entranceOrExitToRoom(authUser),
      this.entranceOrExitToRoom(authUser.id),
    ]);

    return this.usersService.getById(authUser.id);
  }

  private checkUserInRoom(
    authUser: AuthenticatableInterface,
  ): Promise<boolean | undefined> {
    return this.clientProxy
      .send('check-user-in-room', authUser)
      .pipe()
      .toPromise();
  }

  private entranceOrExitToRoom(userId: string, inRoom = false): Promise<User> {
    return this.clientProxy
      .send('entrance-or-exit-to-room', {
        id: userId,
        inRoom,
      })
      .pipe()
      .toPromise();
  }
}
