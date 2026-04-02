import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { randomUUID } from 'crypto'

/**
 * Specialty Factory - Create test specialty entries
 */
export function createSpecialtyFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single specialty entry
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.specialty.create>[0]['data']>
        ) {
            return tx.specialty.create({
                data: {
                    id: randomUUID(),
                    name: faker.hacker.ingverb() + ' ' + faker.hacker.noun(),
                    icon: faker.helpers.maybe(() => 'star'),
                    color: faker.color.rgb(),
                    updatedAt: new Date(),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple specialty entries for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const specialties = []
            for (let i = 0; i < count; i++) {
                specialties.push(await this.create(userId, overrides))
            }
            return specialties
        },

        /**
         * Create a specialty with specific color
         */
        async createWithColor(userId: string, color: string, overrides?: Partial<any>) {
            return this.create(userId, { color, ...overrides })
        },
    }
}
