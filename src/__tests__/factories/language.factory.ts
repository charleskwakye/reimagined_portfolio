import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { faker } from '@faker-js/faker'

/**
 * Language Factory - Create test language entries
 */
export function createLanguageFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single language entry
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.language.create>[0]['data']>
        ) {
            return tx.language.create({
                data: {
                    id: randomUUID(),
                    name: faker.helpers.arrayElement([
                        'English',
                        'Spanish',
                        'French',
                        'German',
                        'Mandarin',
                        'Japanese',
                        'Portuguese',
                        'Italian',
                    ]),
                    proficiency: faker.helpers.arrayElement([
                        'Native',
                        'Fluent',
                        'Professional',
                        'Conversational',
                        'Basic',
                    ]),
                    updatedAt: new Date(),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple language entries for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const languages = []
            for (let i = 0; i < count; i++) {
                languages.push(await this.create(userId, overrides))
            }
            return languages
        },

        /**
         * Create language with specific proficiency level
         */
        async createWithProficiency(
            userId: string,
            proficiency: string,
            overrides?: Partial<any>
        ) {
            return this.create(userId, { proficiency, ...overrides })
        },
    }
}
