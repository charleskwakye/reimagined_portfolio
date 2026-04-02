import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { faker } from '@faker-js/faker'

/**
 * ApproachItem Factory - Create test approach/methodology items
 */
export function createApproachItemFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single approach item
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.approachItem.create>[0]['data']>
        ) {
            return tx.approachItem.create({
                data: {
                    id: randomUUID(),
                    title: faker.hacker.ingverb() + ' ' + faker.hacker.noun(),
                    description: faker.lorem.paragraph(),
                    order: faker.number.int({ min: 0, max: 10 }),
                    updatedAt: new Date(),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple approach items for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const items = []
            for (let i = 0; i < count; i++) {
                items.push(await this.create(userId, { order: i, ...overrides }))
            }
            return items
        },

        /**
         * Create an ordered approach item
         */
        async createOrdered(userId: string, order: number, overrides?: Partial<any>) {
            return this.create(userId, { order, ...overrides })
        },
    }
}
