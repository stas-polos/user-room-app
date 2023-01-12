import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDataSourceOptions(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: configService.get('DB_TYPE'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_DATABASE'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: configService.get('TYPEORM_SYNCHRONIZE'),
    autoLoadEntities: true,
    logging: configService.get('TYPEORM_LOGGING'),
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    cli: {
      migrationsDir: './apps/room-service/src/database/migrations',
    },
    extra: {
      charset: 'utf8mb4_unicode_ci',
    },
  };
}
