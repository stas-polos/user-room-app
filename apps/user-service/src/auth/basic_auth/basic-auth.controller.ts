import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BasicAuthService } from './basic-auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenInterface, AuthenticatableInterface } from './interfaces';
import { ResponseAccessTokenDto, LoginDto } from './dto';
import { LocalAuthGuard } from './guards';
import { AuthUser } from './decorators';
import { User } from '../../users/user.entity';
import { CreateUserDto } from '../../users/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiTags('Auth/Base')
@Controller('auth/base')
export class BasicAuthController {
  constructor(private readonly authService: BasicAuthService) {}

  @ApiOperation({ summary: 'Register user.' })
  @ApiBody({
    type: CreateUserDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: User,
    description: 'The request must create and return new user',
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Login user.' })
  @ApiBody({
    type: LoginDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ResponseAccessTokenDto,
    description: 'The request must generate and return access token.',
  })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  login(
    @AuthUser() user: AuthenticatableInterface,
  ): Promise<AccessTokenInterface> {
    return this.authService.generateAccessToken(user);
  }

  @MessagePattern('validated_user')
  validateUser(@Payload() data: any) {
    const tokenPayload = this.authService.decodeToken(data.jwt);
    return this.authService.tokenPayloadToUser(tokenPayload);
  }
}
