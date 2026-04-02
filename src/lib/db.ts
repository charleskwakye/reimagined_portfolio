import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Add retry and connection timeout settings for serverless database
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Add connection handling options for serverless databases like Neon
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add retry logic to handle transient connection errors
    // Especially important for serverless environments
    errorFormat: 'minimal',
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const MAX_RETRIES = 3;
        let retries = 0;
        let lastError;

        while (retries < MAX_RETRIES) {
          try {
            const result = await query(args);
            return result;
          } catch (e) {
            lastError = e;
            const error = e as Error;

            // Only retry on connection errors or deadlocks
            if (
              error.message.includes('Connection') ||
              error.message.includes('terminated') ||
              error.message.includes('closed') ||
              error.message.includes('deadlock')
            ) {
              retries++;
              // Exponential backoff
              const delay = Math.min(100 * 2 ** retries, 1000);
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              // Non-connection errors shouldn't be retried
              throw error;
            }
          }
        }

        // If we've exhausted all retries, throw the last error
        throw lastError;
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Add a connection check function to verify database connectivity
export async function checkDbConnection() {
  try {
    // Run a simple query to check connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

// Helper to reconnect to the database in case of connection errors
export async function reconnectDatabase() {
  try {
    // Force a disconnect and reconnect
    await prisma.$disconnect();
    // The next query will automatically reconnect
    await prisma.$connect();
    return true;
  } catch (error) {
    return false;
  }
}

// Also export as default for backwards compatibility
export default prisma; 