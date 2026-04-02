/**
 * NextAuth Mock for Testing
 * 
 * This file mocks NextAuth to allow testing API routes
 * without needing a real authentication setup.
 */

import { vi } from 'vitest';

/**
 * Mock session data
 */
export interface MockSessionData {
    user?: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    expires?: string;
}

/**
 * Current mock session
 */
let currentSession: MockSessionData | null = null;

/**
 * Set mock session (simulates authenticated user)
 */
export function mockAuthenticatedSession(session: MockSessionData | null): void {
    currentSession = session;
}

/**
 * Get current mock session
 */
export function getMockSession(): MockSessionData | null {
    return currentSession;
}

/**
 * Reset mock session (simulates no session)
 */
export function resetMockSession(): void {
    currentSession = null;
}

/**
 * Create a mock authenticated session
 */
export function createMockSession(userId: string): MockSessionData {
    return {
        user: {
            id: userId,
            name: 'Test User',
            email: 'test@example.com',
            image: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
}

/**
 * Mock function for getServerSession
 * This should be used with vi.mock in test files
 */
export const mockGetServerSession = vi.fn(async () => {
    return currentSession;
});

/**
 * Mock for authOptions
 * This needs to be imported in the mock setup
 */
export const mockAuthOptions = {
    providers: [],
    callbacks: {
        async session() { return currentSession; },
        async jwt() { return currentSession; },
    },
    adapter: null,
    session: {
        strategy: 'jwt' as const,
    },
    secret: 'test-secret',
};
