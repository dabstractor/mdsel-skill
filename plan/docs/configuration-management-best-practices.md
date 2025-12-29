# Configuration Management Best Practices for Node.js/TypeScript Projects

## 1. Environment Variable Validation Patterns

### Zod Schema Validation (Recommended Pattern)

```typescript
// src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server Configuration
  PORT: z.string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .default('3000'),

  // Database Configuration
  DATABASE_URL: z.string().url({
    message: 'DATABASE_URL must be a valid URL',
  }),

  // API Keys (required in production)
  API_KEY: z.string().min(1, {
    message: 'API_KEY is required',
  }),

  // Optional API Key with default
  OPTIONAL_API_KEY: z.string().optional(),

  // Feature flags
  ENABLE_NEW_FEATURE: z.string()
    .transform(val => val === 'true')
    .default('false'),
});

// Type-safe environment variables
const env = envSchema.parse(process.env);

export default env;
```

### Envalid Alternative

```typescript
// src/config/env.ts
import envalid from 'envalid';

const env = envalid.cleanEnv(process.env, {
  NODE_ENV: envalid.str({
    choices: ['development', 'production', 'test'] as const,
    default: 'development'
  }),
  PORT: envalid.port({ default: 3000 }),
  DATABASE_URL: envalid.url({ devDefault: 'postgresql://localhost:5432/mydb' }),
  API_KEY: envalid.str(),
  LOG_LEVEL: envalid.str({
    choices: ['error', 'warn', 'info', 'debug'] as const,
    default: 'info'
  }),
});

export default env;
```

## 2. TypeScript Configuration Utilities with Type Safety

### Config Factory Pattern

```typescript
// src/config/index.ts
import { z } from 'zod';
import path from 'path';

// Define schemas
const serverConfigSchema = z.object({
  port: z.number().min(1).max(65535),
  host: z.string().ip().optional().default('localhost'),
  cors: z.object({
    origin: z.array(z.string()).optional(),
    credentials: z.boolean().default(true),
  }).optional(),
});

const databaseConfigSchema = z.object({
  url: z.string().url(),
  ssl: z.boolean().default(false),
  pool: z.object({
    min: z.number().min(0).default(2),
    max: z.number().min(1).default(10),
  }).optional(),
});

// Create configuration with merging
function createConfig<T extends z.ZodType>(schema: T, input: unknown) {
  const result = schema.safeParse(input);

  if (!result.success) {
    console.error('❌ Configuration validation failed:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

// Load configuration from multiple sources
function loadConfig() {
  // Load from environment variables
  const envConfig = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: process.env.HOST || 'localhost',
    cors: process.env.CORS ? JSON.parse(process.env.CORS) : undefined,
    database: {
      url: process.env.DATABASE_URL!,
      ssl: process.env.DATABASE_SSL === 'true',
      pool: process.env.DATABASE_POOL ? JSON.parse(process.env.DATABASE_POOL) : undefined,
    },
  };

  return envConfig;
}

// Export typed configuration
export const config = createConfig(
  z.object({
    server: serverConfigSchema,
    database: databaseConfigSchema,
  }),
  loadConfig()
);

// Type inference
export type Config = z.infer<typeof serverConfigSchema> &
  z.infer<typeof databaseConfigSchema>;
```

### Config Builder Pattern with Defaults

```typescript
// src/config/builder.ts
type ConfigValue<T> = {
  required?: boolean;
  default?: T;
  validator?: (value: unknown) => T;
  env?: string;
};

function buildConfig<T extends Record<string, ConfigValue<any>>>(schema: T) {
  const result: Record<string, any> = {};
  const errors: string[] = [];

  for (const [key, config] of Object.entries(schema)) {
    const envKey = config.env || key.toUpperCase();
    const envValue = process.env[envKey];

    if (config.required && envValue === undefined) {
      errors.push(`Missing required environment variable: ${envKey}`);
      continue;
    }

    if (envValue === undefined && config.default !== undefined) {
      result[key] = config.default;
      continue;
    }

    try {
      if (config.validator) {
        result[key] = config.validator(envValue);
      } else {
        result[key] = envValue;
      }
    } catch (error) {
      errors.push(`Invalid value for ${envKey}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  return result as {
    [K in keyof T]: T[K] extends { validator: infer V }
      ? ReturnType<V>
      : T[K] extends { default: infer D }
        ? D | string
        : string;
  };
}

// Usage
export const config = buildConfig({
  port: {
    required: false,
    default: 3000,
    validator: (val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 65535) {
        throw new Error('Port must be between 1 and 65535');
      }
      return num;
    },
  },
  databaseUrl: {
    required: true,
    env: 'DATABASE_URL',
    validator: (val) => {
      try {
        new URL(val);
        return val;
      } catch {
        throw new Error('DATABASE_URL must be a valid URL');
      }
    },
  },
  logLevel: {
    required: false,
    default: 'info',
    validator: (val) => {
      const levels = ['error', 'warn', 'info', 'debug'];
      if (!levels.includes(val)) {
        throw new Error(`Log level must be one of: ${levels.join(', ')}`);
      }
      return val;
    },
  },
});
```

## 3. Common Libraries Used

### Recommended Libraries

1. **Zod** - Schema validation with TypeScript inference
   - GitHub: https://github.com/colinhacks/zod
   - Best for: Complex validation schemas with detailed error messages

2. **Envalid** - Environment variable validation
   - GitHub: https://github.com/af/envalid
   - Best for: Simple environment variable validation with built-in validators

3. **T3 Env** - Environment variable validation for T3 apps
   - GitHub: https://github.com/t3-oss/t3-env
   - Best for: Next.js applications with split client/server environment variables

4. **convict** - Application configuration management
   - GitHub: https://github.com/mozilla-services/convict
   - Best for: Complex configuration with schema validation and defaults

5. **dotenv** - Environment variable loading from .env files
   - GitHub: https://github.com/motdotla/dotenv
   - Best for: Loading environment variables from .env files

### Example: T3 Env Pattern

```typescript
// src/env/server.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DATABASE_SSL: z.string().transform(val => val === 'true'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_SSL: process.env.DATABASE_SSL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

## 4. Best Practices for Default Values vs Required Values

### Default Values Strategy

```typescript
// Good defaults for development
const defaults = {
  port: 3000,
  host: 'localhost',
  logLevel: 'debug',
  database: {
    pool: {
      min: 2,
      max: 10,
    },
  },
};

// Required values (production must have these)
const required = {
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
};

// Conditional requirements based on environment
const getConditionalRequirements = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      sentryDsn: process.env.SENTRY_DSN,
      monitoringEnabled: true,
    };
  }
  return {
    sentryDsn: undefined,
    monitoringEnabled: false,
  };
};
```

### Multi-environment Configuration

```typescript
// src/config/index.ts
const envConfig = {
  development: {
    port: 3000,
    logLevel: 'debug',
    database: {
      ssl: false,
    },
  },
  production: {
    port: parseInt(process.env.PORT || '8080'),
    logLevel: 'info',
    database: {
      ssl: true,
      pool: {
        min: 10,
        max: 50,
      },
    },
  },
  test: {
    port: 3001,
    logLevel: 'error',
    database: {
      url: process.env.TEST_DATABASE_URL || 'sqlite::memory:',
    },
  },
}[process.env.NODE_ENV || 'development'];

export const config = envConfig;
```

## 5. Error Handling Patterns for Missing/Invalid Config

### Comprehensive Error Handling

```typescript
// src/config/with-error-handling.ts
import { z } from 'zod';

const schema = z.object({
  requiredField: z.string(),
  optionalField: z.string().optional(),
  numberField: z.number().min(0),
});

function validateConfig(config: unknown) {
  const result = schema.safeParse(config);

  if (!result.success) {
    // Format errors for different audiences
    const userFriendlyErrors = result.error.issues.map(issue => {
      const path = issue.path.join('.');
      const message = issue.message;

      if (issue.code === 'invalid_type') {
        return `${path}: Expected ${issue.expected} but got ${issue.received}`;
      }

      return `${path}: ${message}`;
    });

    // Log detailed errors for debugging
    console.error('Configuration validation errors:');
    console.error(JSON.stringify(result.error.format(), null, 2));

    // Show user-friendly message
    console.error('\nPlease fix the following configuration errors:');
    userFriendlyErrors.forEach(error => console.error(`- ${error}`));

    // Exit with appropriate code
    process.exit(1);
  }

  return result.data;
}

// Graceful degradation for non-critical errors
function createConfigWithFallbacks(config: unknown, fallbacks: Record<string, any>) {
  try {
    return validateConfig(config);
  } catch (error) {
    console.warn('Using fallback configuration due to validation errors');
    return { ...fallbacks, ...config };
  }
}
```

### Configuration Health Check

```typescript
// src/config/health-check.ts
export function performConfigHealthCheck(config: any) {
  const issues: string[] = [];

  // Check for common issues
  if (config.port && (config.port < 1 || config.port > 65535)) {
    issues.push('Port is out of valid range (1-65535)');
  }

  if (config.databaseUrl && !config.databaseUrl.startsWith('postgresql://')) {
    issues.push('Database URL should use PostgreSQL protocol');
  }

  if (config.nodeEnv === 'production' && !config.apiKey) {
    issues.push('API key is required in production environment');
  }

  if (issues.length > 0) {
    console.warn('⚠️  Configuration health check issues:');
    issues.forEach(issue => console.warn(`  - ${issue}`));

    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Production environment has configuration issues');
      process.exit(1);
    }
  }

  return true;
}
```

## 6. Common Pitfalls to Avoid

### 1. Not Validating at Startup
```typescript
// ❌ Bad: No validation at all
const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
};

// ✅ Good: Validate immediately
const validatedConfig = schema.parse(process.env);
```

### 2. Hardcoding Secrets
```typescript
// ❌ Bad: Hardcoded secrets
const API_KEY = 'sk-1234567890';

// ✅ Good: Environment variables only
const API_KEY = process.env.API_KEY;
```

### 3. Inconsistent Naming
```typescript
// ❌ Bad: Inconsistent naming
const dbHost = process.env.DB_HOST;
const databasePort = process.env.DB_PORT;

// ✅ Good: Consistent naming
const database = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
};
```

### 4. Not Handling Missing Values
```typescript
// ❌ Bad: Risk of undefined values
const port = parseInt(process.env.PORT);

// ✅ Good: Provide defaults or validate
const port = parseInt(process.env.PORT || '3000');
// or
const port = z.string().transform(Number).parse(process.env.PORT);
```

### 5. Sensitive Data in Logs
```typescript
// ❌ Bad: Logging sensitive data
console.log('Configuration:', {
  apiKey: process.env.API_KEY,
  databaseUrl: process.env.DATABASE_URL,
});

// ✅ Good: Sanitize logs
console.log('Configuration:', {
  apiKey: process.env.API_KEY ? '***' : undefined,
  databaseUrl: process.env.DATABASE_URL ? '***' : undefined,
});
```

## 7. Production-Ready Configuration Example

```typescript
// src/config/production.ts
import { z } from 'zod';

const productionSchema = z.object({
  // Required in production
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(32),
  REDIS_URL: z.string().url(),

  // Optional with warnings
  SENTRY_DSN: z.string().url().optional(),
  MONITORING_ENABLED: z.string().transform(val => val === 'true').default('false'),

  // Server configuration
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('8080'),
  NODE_ENV: z.literal('production'),

  // Security
  CORS_ORIGIN: z.string().url().optional(),
  RATE_LIMIT_REQUESTS: z.string().transform(Number).pipe(z.number().min(1)).default('100'),
});

export const productionConfig = productionSchema.parse(process.env);

// Type safety
export type ProductionConfig = z.infer<typeof productionSchema>;
```

## 8. Testing Configuration

```typescript
// src/config/__tests__/config.test.ts
import { config } from '../index';
import { schema } from '../schema';

describe('Configuration', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.TEST_VAR;
    process.env.NODE_ENV = 'test';
  });

  it('should have valid configuration', () => {
    expect(() => schema.parse(config)).not.toThrow();
  });

  it('should use defaults when env vars are missing', () => {
    expect(config.port).toBe(3000);
  });

  it('should validate required fields', () => {
    delete process.env.DATABASE_URL;

    expect(() => schema.parse(config)).toThrow();
  });
});
```

## Additional Resources

### Official Documentation
- [Zod Documentation](https://zod.dev/)
- [Envalid Documentation](https://www.npmjs.com/package/envalid)
- [T3 Env Documentation](https://env.t3.gg/)
- [dotenv Documentation](https://github.com/motdotla/dotenv)

### GitHub Examples
- [t3-oss/create-t3-app](https://github.com/t3-oss/create-t3-app) - Excellent example of env validation
- [vercel/next.js](https://github.com/vercel/next.js) - Production-grade config patterns
- [prisma/prisma](https://github.com/prisma/prisma) - Database configuration patterns

### Recommended Reading
- [12-Factor App: Config](https://12factor.net/config)
- [TypeScript Configuration with Zod](https://kentcdodds.com/blog/get-a-good-type-system-with-zod)
- [Environment Variables in Node.js](https://nodesource.com/blog/understanding-the-nodejs-event-loop)

### Common Pitfalls Summary
1. **Not validating configuration early** - Always validate at startup
2. **Using any types** - Maintain type safety throughout
3. **Hardcoding values** - Use environment variables or config files
4. **Ignoring validation errors** - Handle errors gracefully
5. **Logging sensitive data** - Sanitize configuration in logs
6. **Not testing configuration** - Write tests for config validation
7. **Missing environment-specific settings** - Support different environments