import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

/**
 * UserPreference Factory - Create test user preferences
 */
export function createUserPreferenceFactory(tx: PrismaClient) {
    return {
        /**
         * Create a single user preference
         */
        async create(
            userId: string,
            overrides?: Partial<Parameters<typeof tx.userPreference.create>[0]['data']>
        ) {
            return tx.userPreference.create({
                data: {
                    id: uuidv4(),
                    key: 'test_preference',
                    value: JSON.stringify({ data: 'test' }),
                    userId,
                    ...overrides,
                },
            })
        },

        /**
         * Create multiple user preferences for a user
         */
        async createMany(userId: string, count: number, overrides?: Partial<any>) {
            const preferences = []
            for (let i = 0; i < count; i++) {
                preferences.push(
                    await this.create(userId, {
                        key: `preference_${i}`,
                        ...overrides,
                    })
                )
            }
            return preferences
        },

        /**
         * Create a preference with specific key and value
         */
        async createWithKey(
            userId: string,
            key: string,
            value: any,
            overrides?: Partial<any>
        ) {
            return this.create(userId, {
                key,
                value: JSON.stringify(value),
                ...overrides,
            })
        },
    }
}
