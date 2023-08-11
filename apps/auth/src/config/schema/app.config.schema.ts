import { baseConfigValidation } from '@app/common/config/config.schema';
import Joi from 'joi';

export const configValidation = baseConfigValidation.keys({
  REFRESH_COOKIE: Joi.string().required(),
  COOKIE_SECRET: Joi.string().required(),
});
