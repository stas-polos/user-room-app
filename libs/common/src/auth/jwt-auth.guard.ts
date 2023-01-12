import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { tap, timeout } from 'rxjs';
import { TypeContextEnum } from './type-context.enum';
import { USER_SERVICE } from '@app/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(@Inject('USERS') private userService: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authentication = this.getAuthentication(context);

    try {
      return await this.userService
        .send('validated_user', {
          jwt: authentication,
        })
        .pipe(
          tap((res) => {
            this.addUser(res, context);
          }),
          timeout(5000),
        )
        .toPromise();
    } catch (error) {
      this.logger.error(error);

      return false;
    }
  }

  private getAuthentication(context: ExecutionContext) {
    let authentication: string;
    if (context.getType() === TypeContextEnum.RPC) {
      authentication = context.switchToRpc().getData().token;
    } else if (context.getType() === TypeContextEnum.HTTP) {
      authentication = context
        .switchToHttp()
        .getRequest()
        .headers['authorization']?.split(' ')[1];
    }
    if (!authentication) {
      throw new UnauthorizedException([
        'No value was provided for Authentication',
      ]);
    }

    return authentication;
  }

  private addUser(user: any, context: ExecutionContext) {
    if (context.getType() === TypeContextEnum.RPC) {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === TypeContextEnum.HTTP) {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
