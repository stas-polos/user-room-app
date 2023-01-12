import { getDataSourceOptions } from './typeorm.config';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();
export = getDataSourceOptions(configService);
