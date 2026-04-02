import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

/**
 * Certification Factory - Create test certifications
 */
export function createCertificationFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single certification
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.certification.create>[0]['data']>
        ) {
            return tx.certification.create({
                data: {
                    title: faker.lorem.words(3),
                    organization: faker.company.name(),
                    year: new Date().getFullYear().toString(),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple certifications
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const certs = []
            for (let i = 0; i < count; i++) {
                certs.push(await this.create(userId, overrides))
            }
            return certs
        },

        /**
         * Create with PDF URL
         */
        async createWithPdf(userId: string, overrides?: Partial<any>) {
            return this.create(userId, {
                pdfUrl: `https://example.com/cert-${faker.string.uuid()}.pdf`,
                ...overrides,
            })
        },

        /**
         * Create with credential URL
         */
        async createWithUrl(userId: string, overrides?: Partial<any>) {
            return this.create(userId, {
                url: `https://credentials.example.com/verify/${faker.string.uuid()}`,
                ...overrides,
            })
        },
    }
}
