const publicKey = process.env.JWT_PUBLIC_KEY;
const privateKey = process.env.JWT_PRIVATE_KEY;

export const configBase = {
  appName: process.env.APP_NAME,
  port: parseInt(process.env.PORT, 10),
  debug: process.env.NODE_ENV === 'development',
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    url: process.env.REDIS_URL,
    ttl: parseInt(process.env.REDIS_TTL, 10),
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10),
    limit: parseInt(process.env.THROTTLE_LIMIT, 10),
  },
  jwt: {
    access: {
      privateKey,
      publicKey,
      time: parseInt(process.env.JWT_ACCESS_TIME, 10),
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,
      time: parseInt(process.env.JWT_REFRESH_TIME, 10),
    },
  },
  clientUri: process.env.CLIENT_URI,
};