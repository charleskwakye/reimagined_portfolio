import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { randomUUID } from 'crypto'

/**
 * User Factory - Create test users with sensible defaults
 */
export function createUserFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single user with optional overrides
         */
        async create(overrides?: Partial<Parameters<typeof tx.user.create>[0]['data']>) {
            return tx.user.create({
                data: {
                    id: randomUUID(),
                    name: faker.person.fullName(),
                    jobTitle: faker.person.jobTitle(),
                    intro: faker.lorem.sentence(),
                    about: faker.lorem.paragraphs(2),
                    updatedAt: new Date(),
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple users
         */
        async createMany(count: number, overrides?: Partial<any>) {
            const users = []
            for (let i = 0; i < count; i++) {
                users.push(await this.create(overrides))
            }
            return users
        },
    }
}
