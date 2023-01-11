import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import { HashService } from '../hash/hash.service';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { RmqService, ROOM_SERVICE, USER_SERVICE } from '@app/common';
import { AuthenticatableInterface } from '../auth/basic_auth/interfaces';

@Injectable()
export class UsersService {
  microserviceClients: { [key: string]: ClientProxy } = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
    private readonly rmqService: RmqService,
  ) {
    for (const microservice of [ROOM_SERVICE, USER_SERVICE]) {
      this.microserviceClients[microservice] = ClientProxyFactory.create(
        this.rmqService.getOptions(microservice),
      );
    }
  }

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...userData } = createUserDto;

    const user = await this.userRepository.create({
      ...userData,
      hashedPassword: password ? await this.hashService.make(password) : null,
    });

    await this.userRepository.save(user);

    return user;
  }

  public getById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      id,
    });
  }

  public getByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      email,
    });
  }

  public async entranceOrExitToRoom(
    id: string,
    inRoom: boolean,
  ): Promise<User> {
    await this.userRepository.update({ id }, { inRoom });
    return this.getById(id);
  }

  public async checkUserInRoom(
    authUser: AuthenticatableInterface,
  ): Promise<boolean | undefined> {
    const user = await this.getById(authUser.id);

    return user?.inRoom;
  }
}
