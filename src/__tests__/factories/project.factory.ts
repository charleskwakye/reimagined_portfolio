import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

/**
 * Project Factory - Create test projects with sensible defaults
 */
export function createProjectFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single project
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.project.create>[0]['data']>
        ) {
            return tx.project.create({
                data: {
                    title: faker.hacker.phrase(),
                    shortDesc: faker.lorem.sentence(),
                    featured: false,
                    technologies: ['TypeScript', 'React'],
                    contentBlocks: [],
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple projects for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const projects = []
            for (let i = 0; i < count; i++) {
                projects.push(await this.create(userId, overrides))
            }
            return projects
        },

        /**
         * Create a featured project
         */
        async createFeatured(userId: string, overrides?: Partial<any>) {
            return this.create(userId, { featured: true, ...overrides })
        },
    }
}
