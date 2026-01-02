import { z } from 'zod';

const NODE_ENV = z.enum(['development', 'production', 'test']);

const duration = z
  .string({ message: 'Duration is required' })
  .regex(/^\d+(s|m|h|d)$/, 'Invalid duration format. Example: 15m, 7d');

export const envValidationSchema = z
  .object({
    // Client
    CLIENT_URL: z
      .string({ message: 'CLIENT_URL is required' })
      .url('CLIENT_URL must be a valid URL'),

    // Server
    SERVER_URL: z
      .string({ message: 'SERVER_URL is required' })
      .url('SERVER_URL must be a valid URL'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    API_PREFIX: z.string().default('api'),
    API_VERSION: z.string().default('v1'),
    NODE_ENV: NODE_ENV.default('development'),

    // Database (PostgreSQL)
    POSTGRES_HOST: z.string().min(1, 'POSTGRES_HOST is required'),
    POSTGRES_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
    POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
    POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD is required'),
    POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),

    // JWT
    ACCESS_TOKEN_SECRET: z
      .string()
      .min(32, 'ACCESS_TOKEN_SECRET must be at least 32 characters'),
    ACCESS_TOKEN_EXPIRATION: duration,
    REFRESH_TOKEN_SECRET: z
      .string()
      .min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),
    REFRESH_TOKEN_EXPIRATION: duration,

    // Brevo
    BREVO_API_KEY: z.string().min(1, 'BREVO_API_KEY is required'),
    BREVO_MAILER_SENDER: z
      .string({ message: 'BREVO_MAILER_SENDER is required' })
      .email('BREVO_MAILER_SENDER must be a valid email'),

    // PayOS
    PAYOS_CLIENT_ID: z.string().min(1, 'PAYOS_CLIENT_ID is required'),
    PAYOS_API_KEY: z.string().min(1, 'PAYOS_API_KEY is required'),
    PAYOS_CHECKSUM_KEY: z.string().min(1, 'PAYOS_CHECKSUM_KEY is required'),

    // Throttle
    THROTTLE_TTL: z.coerce.number().default(60000),
    THROTTLE_LIMIT: z.coerce.number().default(10),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === 'production') {
      if (env.CLIENT_URL.includes('localhost')) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CLIENT_URL'],
          message: 'Production CLIENT_URL cannot be localhost',
        });
      }
    }

    if (env.SERVER_URL.includes('localhost')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SERVER_URL'],
        message: 'Production SERVER_URL cannot be localhost',
      });
    }
  });

export type EnvValidationSchema = z.infer<typeof envValidationSchema>;
