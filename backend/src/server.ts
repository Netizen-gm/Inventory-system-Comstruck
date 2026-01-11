// Load environment variables FIRST before importing any other modules
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import logger from './config/logger';
import { validateEnv } from './config/env.validation';

// Validate environment variables before starting
validateEnv();

const PORT = process.env.PORT || 3000;

let server: ReturnType<typeof app.listen>;

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} signal received: starting graceful shutdown`);

  // Stop accepting new requests
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');

      // Close database connection
      disconnectDatabase()
        .then(() => {
          logger.info('Graceful shutdown completed');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        });
    });

    // Force close server after 10 seconds
    setTimeout(() => {
      logger.error('Forcing server shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();
