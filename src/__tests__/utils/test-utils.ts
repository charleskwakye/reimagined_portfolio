/**
 * API Test Utilities
 * 
 * Utilities for testing Next.js API routes.
 * Uses vitest's mocking to replace dependencies.
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
    };
}

/**
 * Current mock session
 */
let currentSession: MockSessionData | null = null;

/**
 * Set authenticated session
 */
export function setAuthenticatedSession(userId: string): void {
    currentSession = {
        user: {
            id: userId,
            name: 'Test User',
            email: 'test@example.com',
        },
    };
}

/**
 * Clear session (simulates not logged in)
 */
export function clearSession(): void {
    currentSession = null;
}

/**
 * Get current session
 */
export function getSession(): MockSessionData | null {
    return currentSession;
}

/**
 * Reset all mocks
 */
export function resetAllMocks(): void {
    vi.clearAllMocks();
    currentSession = null;
}
