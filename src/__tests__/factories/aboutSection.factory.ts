import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { faker } from '@faker-js/faker'

/**
 * AboutSection Factory - Create test about page sections
 */
export function createAboutSectionFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single about section
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.aboutSection.create>[0]['data']>
        ) {
            return tx.aboutSection.create({
                data: {
                    id: randomUUID(),
                    title: faker.lorem.words(3),
                    content: faker.lorem.paragraphs(3),
                    order: faker.number.int({ min: 0, max: 10 }),
                    updatedAt: new Date(),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple about sections for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const sections = []
            for (let i = 0; i < count; i++) {
                sections.push(await this.create(userId, { order: i, ...overrides }))
            }
            return sections
        },

        /**
         * Create an ordered about section
         */
        async createOrdered(userId: string, order: number, overrides?: Partial<any>) {
            return this.create(userId, { order, ...overrides })
        },
    }
}
