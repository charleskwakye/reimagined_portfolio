import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { randomUUID } from 'crypto'

/**
 * SocialLink Factory - Create test social media links
 */
export function createSocialLinkFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single social link entry
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.socialLink.create>[0]['data']>
        ) {
            const platform = faker.helpers.arrayElement([
                'GitHub',
                'LinkedIn',
                'Twitter',
                'Instagram',
                'Facebook',
                'YouTube',
                'TikTok',
                'Discord',
            ])
            
            return tx.socialLink.create({
                data: {
                    id: randomUUID(),
                    platform,
                    url: `https://${platform.toLowerCase()}.com/${faker.internet.userName()}`,
                    icon: platform.toLowerCase(),
                    updatedAt: new Date(),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple social links for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const links = []
            for (let i = 0; i < count; i++) {
                links.push(await this.create(userId, overrides))
            }
            return links
        },

        /**
         * Create social link with specific platform
         */
        async createWithPlatform(
            userId: string,
            platform: string,
            overrides?: Partial<any>
        ) {
            return this.create(userId, { platform, ...overrides })
        },
    }
}
