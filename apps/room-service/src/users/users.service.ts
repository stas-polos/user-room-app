import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import { AuthenticatableInterface } from '../auth/interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create({
      ...createUserDto,
    });

    await this.userRepository.save(user);

    return user;
  }

  public async entranceOrExitToRoom(
    authUser: AuthenticatableInterface,
    roomId: string = null,
  ): Promise<User> {
    await this.userRepository.update({ id: authUser.id }, { roomId });

    return this.getById(authUser.id);
  }

  public getById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne(
      {
        id,
      },
      { relations: ['room'] },
    );
  }
}
