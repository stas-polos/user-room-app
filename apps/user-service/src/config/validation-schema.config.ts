import * as Joi from '@hapi/joi';

const TYPE_ORM_LOGGING = [
  'query',
  'error',
  'schema',
  'warn',
  'info',
  'log',
  'all',
];

export const validationSchema = Joi.object({
  PORT: Joi.number().required(),
  ROOM_SERVICE_HOST: Joi.string().required(),
  ROOM_SERVICE_PORT: Joi.number().required(),
  USER_SERVICE_HOST: Joi.string().required(),
  USER_SERVICE_PORT: Joi.number().required(),

  DB_TYPE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  TYPEORM_LOGGING: [Joi.boolean(), Joi.string().valid(...TYPE_ORM_LOGGING)],
  TYPEORM_SYNCHRONIZE: Joi.boolean(),

  PASSPORT_DEFAULT_STRATEGY: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.string().required(),

  RABBIT_MQ_URI: Joi.string().required(),
  RABBIT_MQ_ROOMS_QUEUE: Joi.string().required(),
  RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
  RABBIT_MQ_USERS_QUEUE: Joi.string().required(),
});
