import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll, afterEach } from 'vitest'

/**
 * Shared Prisma client for all tests
 * Uses transaction-based isolation per test
 */
let prisma: PrismaClient

/**
 * SAFETY CHECK: Verify tests are running against test database
 * This prevents accidentally running tests against production
 */
function verifyTestDatabase(): void {
    const dbUrl = process.env.DATABASE_URL || '';
    
    // Check for production database indicators
    if (dbUrl.includes('neon') || dbUrl.includes('neondb')) {
        throw new Error(
            '❌ SAFETY CHECK FAILED: Tests cannot run against production Neon database!\n' +
            'Use: npm run test:start-db && npm test'
        );
    }
    
    // Check that we're using test database (must contain both localhost AND portfolio_test)
    if (!dbUrl.includes('localhost') || !dbUrl.includes('portfolio_test')) {
        throw new Error(
            '❌ SAFETY CHECK FAILED: DATABASE_URL must point to test database!\n' +
            'Current: ' + dbUrl + '\n' +
            'Use: npm run test:start-db && npm test'
        );
    }
    
    console.log('✅ Safety check passed: Using test database');
}

/**
 * Initialize database connection before all tests
 */
beforeAll(async () => {
    // Run safety check first
    verifyTestDatabase();
    
    prisma = new PrismaClient({
        log: process.env.DEBUG_TESTS === 'true' ? ['query', 'error'] : ['error'],
    })

    // Verify connection
    try {
        await prisma.$queryRaw`SELECT 1`
    } catch (error) {
        console.error('❌ Failed to connect to test database')
        throw error
    }
})

/**
 * Disconnect after all tests complete
 */
afterAll(async () => {
    await prisma.$disconnect()
})

/**
 * Run a test with transaction isolation
 * All database changes auto-rollback after the callback completes
 *
 * Usage:
 * ```ts
 * await testWithDatabase(async (tx) => {
 *   const user = await tx.user.create({ data: {...} })
 *   // ... test assertions
 * })
 * ```
 */
export async function testWithDatabase<T>(
    callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
    let result: T | null = null
    let thrownError: Error | null = null

    try {
        // Using $transaction with a thrown error to force rollback
        await prisma.$transaction(async (tx) => {
            try {
                result = await callback(tx)
            } catch (e) {
                thrownError = e as Error
            }
            // Force rollback by throwing - Prisma will rollback the entire transaction
            const rollbackError = new Error('__TEST_ROLLBACK__')
                ; (rollbackError as any).rollback = true
            throw rollbackError
        })
    } catch (e) {
        const err = e as any
        // Only swallow our intentional rollback error
        if (!err.message?.includes('__TEST_ROLLBACK__')) {
            throw e
        }
    }

    // If the callback threw an error, re-throw it now
    if (thrownError) {
        throw thrownError
    }

    return result!
}

/**
 * Get the Prisma client for outside-of-transaction operations
 * Mainly used for cleanup verification or direct queries
 */
export function getDb(): PrismaClient {
    return prisma
}

