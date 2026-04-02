/**
 * Certification API Route Tests
 * 
 * Tests the actual certification API routes to catch bugs in:
 * - Authentication logic (401 responses)
 * - Validation logic (400 responses)
 * - Error handling (404 responses)
 * - HTTP status codes
 * 
 * Note: These tests verify the API route code logic, not database operations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDb } from '../../setup';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';

// Mock getServerSession
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

// Mock auth options
vi.mock('@/lib/auth', () => ({
    authOptions: {
        providers: [],
        callbacks: {},
    },
}));

import { getServerSession } from 'next-auth';

describe('Certification API Routes - Authentication & Validation', () => {
    let testUserId: string;

    beforeEach(async () => {
        vi.clearAllMocks();
        
        // Create test user
        testUserId = `test-user-${randomUUID()}`;
        await prisma.user.create({
            data: {
                id: testUserId,
                name: 'Test User',
                jobTitle: 'Developer',
                intro: 'Test intro',
                about: 'Test about',
                updatedAt: new Date(),
            },
        });
    });

    afterEach(async () => {
        // Clean up test data
        try {
            await prisma.certification.deleteMany({ where: { userId: testUserId } });
            await prisma.user.delete({ where: { id: testUserId } });
        } catch (e) {
            // Ignore cleanup errors
        }
    });

    describe('Authentication - GET /api/certifications', () => {
        it('returns 401 when not authenticated', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const { GET } = await import('@/app/api/certifications/route');
            
            const request = new Request('http://localhost/api/certifications', {
                method: 'GET',
            });

            const response = await GET(request);
            expect(response.status).toBe(401);
        });
    });

    describe('Authentication - POST /api/certifications/new', () => {
        it('returns 401 when not authenticated', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const { POST } = await import('@/app/api/certifications/new/route');
            
            const request = new Request('http://localhost/api/certifications/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'AWS',
                    organization: 'Amazon',
                    year: '2024',
                }),
            });

            const response = await POST(request as any);
            expect(response.status).toBe(401);
        });

        it('returns 400 when title is missing', async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: testUserId, name: 'Test' }
            });

            const { POST } = await import('@/app/api/certifications/new/route');
            
            const request = new Request('http://localhost/api/certifications/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organization: 'Amazon',
                    year: '2024',
                }),
            });

            const response = await POST(request as any);
            expect(response.status).toBe(400);
            
            const body = await response.json();
            expect(body.error).toContain('required');
        });

        it('returns 400 when organization is missing', async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: testUserId, name: 'Test' }
            });

            const { POST } = await import('@/app/api/certifications/new/route');
            
            const request = new Request('http://localhost/api/certifications/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'AWS',
                    year: '2024',
                }),
            });

            const response = await POST(request as any);
            expect(response.status).toBe(400);
        });

        it('returns 400 when year is missing', async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: testUserId, name: 'Test' }
            });

            const { POST } = await import('@/app/api/certifications/new/route');
            
            const request = new Request('http://localhost/api/certifications/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'AWS',
                    organization: 'Amazon',
                }),
            });

            const response = await POST(request as any);
            expect(response.status).toBe(400);
        });

        it('returns 201 when creating certification with valid data', async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: testUserId, name: 'Test' }
            });

            const { POST } = await import('@/app/api/certifications/new/route');
            
            const request = new Request('http://localhost/api/certifications/new', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'AWS Solutions Architect',
                    organization: 'Amazon',
                    year: '2024',
                }),
            });

            const response = await POST(request as any);
            expect(response.status).toBe(201);
            
            const body = await response.json();
            expect(body.title).toBe('AWS Solutions Architect');
            expect(body.organization).toBe('Amazon');
            expect(body.year).toBe('2024');
        });
    });

    describe('Authentication & Validation - PUT /api/certifications/[id]/update', () => {
        it('returns 401 when not authenticated', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const { PUT } = await import('@/app/api/certifications/[id]/update/route');
            
            const request = new Request('http://localhost/api/certifications/test-id/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Updated' }),
            });

            const response = await PUT(request as any, { params: Promise.resolve({ id: 'test-id' }) });
            expect(response.status).toBe(401);
        });

        it('returns 404 when certification not found', async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: testUserId, name: 'Test' }
            });

            const { PUT } = await import('@/app/api/certifications/[id]/update/route');
            
            const request = new Request('http://localhost/api/certifications/non-existent/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Updated' }),
            });

            const response = await PUT(request as any, { params: Promise.resolve({ id: 'non-existent' }) });
            expect(response.status).toBe(404);
        });

        it('returns 400 when title is empty string', async () => {
            // First create a certification
            const certId = `cert-${randomUUID()}`;
            await prisma.certification.create({
                data: {
                    id: certId,
                    title: 'AWS',
                    organization: 'Amazon',
                    year: '2024',
                    userId: testUserId,
                },
            });

            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: testUserId, name: 'Test' }
            });

            const { PUT } = await import('@/app/api/certifications/[id]/update/route');
            
            const request = new Request(`http://localhost/api/certifications/${certId}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: '' }),
            });

            const response = await PUT(request as any, { params: Promise.resolve({ id: certId }) });
            expect(response.status).toBe(400);
        });

        it('updates certification successfully', async () => {
            const certId = `cert-${randomUUID()}`;
            await prisma.certification.create({
                data: {
                    id: certId,
                    title: 'AWS',
                    organization: 'Amazon',
                    year: '2024',
                    userId: testUserId,
                },
            });

            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: testUserId, name: 'Test' }
            });

            const { PUT } = await import('@/app/api/certifications/[id]/update/route');
            
            const request = new Request(`http://localhost/api/certifications/${certId}/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Updated Title' }),
            });

            const response = await PUT(request as any, { params: Promise.resolve({ id: certId }) });
            expect(response.status).toBe(200);
            
            const body = await response.json();
            expect(body.title).toBe('Updated Title');
        });
    });

    describe('Authentication & Validation - DELETE /api/certifications/[id]/delete', () => {
        it('returns 401 when not authenticated', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const { DELETE } = await import('@/app/api/certifications/[id]/delete/route');
            
            const request = new Request('http://localhost/api/certifications/test-id/delete', {
                method: 'DELETE',
            });

            const response = await DELETE(request as any, { params: { id: 'test-id' } });
            expect(response.status).toBe(401);
        });

        it('returns 404 when certification not found', async () => {
            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: testUserId, name: 'Test' }
            });

            const { DELETE } = await import('@/app/api/certifications/[id]/delete/route');
            
            const request = new Request('http://localhost/api/certifications/non-existent/delete', {
                method: 'DELETE',
            });

            const response = await DELETE(request as any, { params: { id: 'non-existent' } });
            expect(response.status).toBe(404);
        });

        it('returns 204 on successful deletion', async () => {
            const certId = `cert-${randomUUID()}`;
            await prisma.certification.create({
                data: {
                    id: certId,
                    title: 'AWS',
                    organization: 'Amazon',
                    year: '2024',
                    userId: testUserId,
                },
            });

            vi.mocked(getServerSession).mockResolvedValue({
                user: { id: testUserId, name: 'Test' }
            });

            const { DELETE } = await import('@/app/api/certifications/[id]/delete/route');
            
            const request = new Request(`http://localhost/api/certifications/${certId}/delete`, {
                method: 'DELETE',
            });

            const response = await DELETE(request as any, { params: { id: certId } });
            expect(response.status).toBe(204);
        });
    });
});
