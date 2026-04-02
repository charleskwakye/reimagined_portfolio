import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

/**
 * Internship Factory - Create test internships
 */
export function createInternshipFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single internship
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.internship.create>[0]['data']>
        ) {
            const startDate = new Date('2023-06-01')
            const endDate = new Date('2023-08-31')

            return tx.internship.create({
                data: {
                    title: faker.hacker.phrase(),
                    company: faker.company.name(),
                    location: faker.location.city(),
                    startDate,
                    endDate,
                    shortDesc: faker.lorem.paragraph(),
                    contentBlocks: [],
                    technologies: ['TypeScript', 'Node.js'],
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple internships
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const internships = []
            for (let i = 0; i < count; i++) {
                internships.push(await this.create(userId, overrides))
            }
            return internships
        },

        /**
         * Create ongoing internship (no end date)
         */
        async createOngoing(userId: string, overrides?: Partial<any>) {
            return this.create(userId, { endDate: null, ...overrides })
        },
    }
}
