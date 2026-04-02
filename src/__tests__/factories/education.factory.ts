import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { faker } from '@faker-js/faker'

/**
 * Education Factory - Create test education entries
 */
export function createEducationFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single education entry
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.education.create>[0]['data']>
        ) {
            const startDate = faker.date.past({ years: 10 })
            const endDate = faker.date.between({ from: startDate, to: new Date() })
            
            return tx.education.create({
                data: {
                    id: randomUUID(),
                    degree: faker.helpers.arrayElement([
                        'B.S. Computer Science',
                        'M.S. Software Engineering',
                        'B.A. Design',
                        'Ph.D. Artificial Intelligence',
                    ]),
                    institution: faker.company.name() + ' University',
                    location: faker.location.city() + ', ' + faker.location.state(),
                    startDate,
                    endDate,
                    current: false,
                    description: faker.lorem.paragraph(),
                    updatedAt: new Date(),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple education entries for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const educations = []
            for (let i = 0; i < count; i++) {
                educations.push(await this.create(userId, overrides))
            }
            return educations
        },

        /**
         * Create education with specific degree type
         */
        async createWithDegree(
            userId: string,
            degree: string,
            overrides?: Partial<any>
        ) {
            return this.create(userId, { degree, ...overrides })
        },
    }
}
