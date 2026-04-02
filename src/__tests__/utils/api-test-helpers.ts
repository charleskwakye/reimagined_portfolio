/**
 * API Test Helpers
 * 
 * Utilities for testing Next.js API routes directly
 * without needing to start a server.
 */

import { NextRequest, NextResponse } from 'next/server';
import { vi } from 'vitest';

/**
 * Mock session for authenticated requests
 */
export interface MockSession {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

/**
 * Store for mock session
 */
let mockSession: MockSession | null = null;

/**
 * Set mock session for authenticated requests
 */
export function setMockSession(session: MockSession | null): void {
    mockSession = session;
}

/**
 * Get current mock session
 */
export function getMockSession(): MockSession | null {
    return mockSession;
}

/**
 * Mock getServerSession for testing
 * This should be used with vi.mock to replace the real getServerSession
 */
export const mockGetServerSession = vi.fn(async () => {
    return mockSession;
});

/**
 * Create an authenticated mock session
 */
export function createAuthenticatedSession(userId: string): MockSession {
    return {
        user: {
            id: userId,
            name: 'Test User',
            email: 'test@example.com',
        },
    };
}

/**
 * Reset mock session (simulates no session)
 */
export function resetMockSession(): void {
    mockSession = null;
}

// Alias for createAuthenticatedSession for convenience
export const createMockSession = createAuthenticatedSession;

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    body?: Record<string, unknown> | null
): NextRequest {
    const headers = new Headers({
        'Content-Type': 'application/json',
    });

    const requestInit: RequestInit = {
        method,
        headers,
    };

    if (body && method !== 'GET') {
        requestInit.body = JSON.stringify(body);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextRequest(url, requestInit as any);
}

/**
 * Extract JSON body from a NextResponse
 */
export async function getResponseJson(response: NextResponse): Promise<unknown> {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/**
 * Create URL with query parameters
 */
export function createUrlWithParams(baseUrl: string, params?: Record<string, string>): string {
    const url = new URL(baseUrl, 'http://localhost');
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }
    return url.toString().replace('http://localhost', '');
}
