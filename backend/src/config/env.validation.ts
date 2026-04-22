import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Server
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),

  // Auth
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters for security',
  }),
  ACCESS_TOKEN_TTL: Joi.string().default('15m'),
  REFRESH_TOKEN_TTL: Joi.string().default('7d'),

  // Stripe (required in production only)
  STRIPE_SECRET_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  STRIPE_WEBHOOK_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  STRIPE_PRICE_ID_PRO: Joi.string().optional().allow(''),
  STRIPE_PRICE_ID_ENTERPRISE: Joi.string().optional().allow(''),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
});
