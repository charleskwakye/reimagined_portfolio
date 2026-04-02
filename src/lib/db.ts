import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only create Prisma client if DATABASE_URL is available (not during build without env)
let prismaInstance: PrismaClient | undefined;

function getPrismaClient(): PrismaClient | undefined {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }
  
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
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

            if (
              error.message.includes('Connection') ||
              error.message.includes('terminated') ||
              error.message.includes('closed') ||
              error.message.includes('deadlock')
            ) {
              retries++;
              const delay = Math.min(100 * 2 ** retries, 1000);
              await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
              throw error;
            }
          }
        }

        throw lastError;
      },
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }

  return prismaInstance;
}

export const prisma = getPrismaClient();

// Add a connection check function to verify database connectivity
export async function checkDbConnection() {
  try {
    if (!prisma) return false;
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