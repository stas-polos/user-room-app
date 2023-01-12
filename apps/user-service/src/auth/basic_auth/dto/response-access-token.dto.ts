import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessTokenInterface, AccessTokenType } from '../interfaces';

export class ResponseAccessTokenDto implements AccessTokenInterface {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  @IsJWT()
  token: string;

  @ApiProperty({ example: 'Bearer' })
  @IsString()
  @IsNotEmpty()
  type: AccessTokenType;
}
