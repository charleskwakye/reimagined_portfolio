import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { randomUUID } from 'crypto'

/**
 * Tool Factory - Create test tool/skill entries
 */
export function createToolFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single tool entry
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.tool.create>[0]['data']>
        ) {
            return tx.tool.create({
                data: {
                    id: randomUUID(),
                    name: faker.helpers.arrayElement([
                        'React',
                        'TypeScript',
                        'Node.js',
                        'Python',
                        'PostgreSQL',
                        'AWS',
                        'Docker',
                        'Kubernetes',
                        'GraphQL',
                        'Next.js',
                    ]),
                    category: faker.helpers.arrayElement([
                        'Frontend',
                        'Backend',
                        'Database',
                        'DevOps',
                        'Language',
                        'Framework',
                        'Tool',
                    ]),
                    icon: faker.helpers.maybe(() => 'code'),
                    updatedAt: new Date(),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple tool entries for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const tools = []
            for (let i = 0; i < count; i++) {
                tools.push(await this.create(userId, overrides))
            }
            return tools
        },

        /**
         * Create tool with specific category
         */
        async createWithCategory(
            userId: string,
            category: string,
            overrides?: Partial<any>
        ) {
            return this.create(userId, { category, ...overrides })
        },
    }
}
