import { baseConfigValidation } from '@app/common/config/config.schema';
import Joi from 'joi';

export const configValidation = baseConfigValidation.keys({
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_URL: Joi.string().required(),
  CLIENT_URI: Joi.string().required(),
});
