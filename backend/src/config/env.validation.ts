/**
 * Environment variable validation
 * Validates required environment variables at application startup
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
] as const;

// Optional environment variables with defaults are handled in respective files

/**
 * Validate JWT secret strength
 */
const validateJWTSecret = (secret: string): void => {
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security. ' +
      'Generate a strong secret using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  // Warn if using default/weak secret
  if (secret === 'your-super-secret-jwt-key' || secret.includes('secret')) {
    console.warn(
      '[WARNING] Using weak or default JWT_SECRET. ' +
      'Please set a strong random secret in production!'
    );
  }
};

/**
 * Validate environment variables
 * Throws error if required variables are missing
 */
export const validateEnv = (): void => {
  const missing: string[] = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate JWT_SECRET strength (only in production)
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET) {
    validateJWTSecret(process.env.JWT_SECRET);
  } else if (process.env.JWT_SECRET) {
    // Warn in development
    validateJWTSecret(process.env.JWT_SECRET);
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  if (process.env.NODE_ENV && !validEnvs.includes(process.env.NODE_ENV)) {
    throw new Error(
      `Invalid NODE_ENV: ${process.env.NODE_ENV}. Must be one of: ${validEnvs.join(', ')}`
    );
  }
};

/**
 * Get environment variable with optional default
 */
export const getEnvVar = (key: string, defaultValue?: string): string => {
  return process.env[key] || defaultValue || '';
};
