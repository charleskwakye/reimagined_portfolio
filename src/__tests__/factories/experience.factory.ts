import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { faker } from '@faker-js/faker'

/**
 * Experience Factory - Create test work experience entries
 */
export function createExperienceFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single experience entry
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.experience.create>[0]['data']>
        ) {
            const startDate = faker.date.past({ years: 5 })
            const endDate = faker.date.between({ from: startDate, to: new Date() })
            
            return tx.experience.create({
                data: {
                    id: randomUUID(),
                    title: faker.person.jobTitle(),
                    company: faker.company.name(),
                    location: faker.location.city() + ', ' + faker.location.state(),
                    startDate,
                    endDate,
                    current: false,
                    description: faker.lorem.paragraphs(2),
                    updatedAt: new Date(),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple experience entries for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const experiences = []
            for (let i = 0; i < count; i++) {
                experiences.push(await this.create(userId, overrides))
            }
            return experiences
        },

        /**
         * Create a current (ongoing) experience entry
         */
        async createCurrent(userId: string, overrides?: Partial<any>) {
            const startDate = faker.date.past({ years: 2 })
            return this.create(userId, {
                current: true,
                endDate: null,
                startDate,
                ...overrides,
            })
        },
    }
}
