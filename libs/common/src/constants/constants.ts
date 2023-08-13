export const APP_NAME = 'APP_NAME';
export const PORT = 'PORT';
export const REDIS_HOST = 'redis.host';
export const REDIS_PORT = 'redis.ort';
export const SEQUELIZE = 'SEQUELIZE';
export const DEVELOPMENT = 'development';
export const PRODUCTION = 'production';

export const POSTGRES_DUPLICATE_ERROR_CODE = '23505';
export const POSTGRES_DUPLICATE_ERROR_MESSAGE =
  'Database duplicated value error';

// Microservices message patterns
export const GET_USER_BY_ID = 'get_user_by_id';
export const GET_USER_BY_EMAIL = 'get_user_by_email';
export const LOAD_TENANT = 'load_tenant';
export const CREATE_USER = 'create_user';
export const GET_USER_BY_CREDENTIALS = 'get_user_by_credentials';
export const VERIFY_TENANT = 'verify_tenant';
export const VERIFY_BLACKLISTED_TOKEN = 'verify_blacklisted_token';
export const GET_USER_BY_EMAIL_UNCHECKED = 'get_user_by_email_unchecked';
export const CREATE_BLACKLISTED_TOKEN = 'create_blacklisted_token';
