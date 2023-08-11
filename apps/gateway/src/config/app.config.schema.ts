import { baseConfigValidation } from '@app/common/config/config.schema';
import Joi from 'joi';

export const configValidation = baseConfigValidation.keys({
  AUTH_SERVICE_URL: Joi.string().required(),
  TENANT_SERVICE_URL: Joi.string().required(),
  BLOG_SERVICE_URL: Joi.string().required(),
  FILE_MANAGER_URL: Joi.string().required(),
  USERS_SERVICE_URL: Joi.string().required(),
  GATEWAY_URL: Joi.string().required(),
});
