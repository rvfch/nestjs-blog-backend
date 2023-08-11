import Joi from 'joi';

export const baseConfigValidation = Joi.object({
  APP_NAME: Joi.string().required(),
  NODE_ENV: Joi.string().valid('development', 'production').required(),
  PORT: Joi.number().required(),
  DATABASE_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_URL: Joi.string().required(),
  REDIS_TTL: Joi.number().required(),
  CLIENT_URI: Joi.string().required(),
  THROTTLE_TTL: Joi.number().required(),
  THROTTLE_LIMIT: Joi.number().required(),
  JWT_ACCESS_TIME: Joi.number().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_TIME: Joi.number().required(),
});
