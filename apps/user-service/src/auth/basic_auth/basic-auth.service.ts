import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/user.entity';
import { HashService } from '../../hash/hash.service';
import {
  AccessTokenInterface,
  AuthenticatableInterface,
  TokenPayloadInterface,
} from './interfaces';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../../users/dto';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ROOM_SERVICE, USER_SERVICE } from '@app/common';
import { RmqService } from '@app/common';

@Injectable()
export class BasicAuthService {
  microserviceClients: { [key: string]: ClientProxy } = {};

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly rmqService: RmqService,
  ) {
    for (const microservice of [ROOM_SERVICE, USER_SERVICE]) {
      this.microserviceClients[microservice] = ClientProxyFactory.create(
        this.rmqService.getOptions(microservice),
      );
    }
  }

  public async register(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersService.getByEmail(createUserDto.email);
    if (user) {
      throw new BadRequestException([
        `User with '${createUserDto.email}' is exist`,
      ]);
    }

    const createdUser = await this.usersService.create(createUserDto);

    await lastValueFrom(
      this.microserviceClients[ROOM_SERVICE].emit('created_user', createdUser),
    );

    return createdUser;
  }

  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.getByEmail(email);

    if (
      user &&
      (await this.verifyPassword(password, user.hashedPassword ?? ''))
    ) {
      return user;
    }

    throw new BadRequestException(['wrong email and/or password']);
  }

  public tokenPayloadToUser(
    payload: TokenPayloadInterface,
  ): AuthenticatableInterface {
    return {
      id: payload.userId,
      email: payload.email,
      inRoom: payload.inRoom,
    };
  }

  private verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return this.hashService.check(plainTextPassword, hashedPassword);
  }

  public decodeToken(token: string): TokenPayloadInterface {
    try {
      return this.jwtService.verify<TokenPayloadInterface>(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (err) {
      throw new BadRequestException(['invalid token']);
    }
  }

  public getTokenPayload(
    user: AuthenticatableInterface,
  ): TokenPayloadInterface {
    return {
      userId: user.id,
      email: user.email,
      inRoom: user.inRoom,
    };
  }

  public async generateAccessToken(
    user: AuthenticatableInterface,
  ): Promise<AccessTokenInterface> {
    return {
      type: this.configService.get('PASSPORT_DEFAULT_STRATEGY'),
      token: this.jwtService.sign(this.getTokenPayload(user)),
    };
  }
}
