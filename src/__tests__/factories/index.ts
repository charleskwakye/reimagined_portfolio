/**
 * Export all factories for convenient importing
 *
 * Usage:
 * ```ts
 * import { factories } from '@/__tests__/factories'
 *
 * await testWithDatabase(async (tx) => {
 *   const user = await factories.user(tx).create()
 *   const project = await factories.project(tx).create(user.id)
 * })
 * ```
 */

import { PrismaClient } from '@prisma/client'
import { createUserFactory } from './user.factory'
import { createProjectFactory } from './project.factory'
import { createInternshipFactory } from './internship.factory'
import { createCertificationFactory } from './certification.factory'
import { createExperienceFactory } from './experience.factory'
import { createEducationFactory } from './education.factory'
import { createLanguageFactory } from './language.factory'
import { createSpecialtyFactory } from './specialty.factory'
import { createToolFactory } from './tool.factory'
import { createSocialLinkFactory } from './socialLink.factory'
import { createAboutSectionFactory } from './aboutSection.factory'
import { createApproachItemFactory } from './approachItem.factory'
import { createUserPreferenceFactory } from './userPreference.factory'

export const factories = {
    user: createUserFactory,
    project: createProjectFactory,
    internship: createInternshipFactory,
    certification: createCertificationFactory,
    experience: createExperienceFactory,
    education: createEducationFactory,
    language: createLanguageFactory,
    specialty: createSpecialtyFactory,
    tool: createToolFactory,
    socialLink: createSocialLinkFactory,
    aboutSection: createAboutSectionFactory,
    approachItem: createApproachItemFactory,
    userPreference: createUserPreferenceFactory,
}

/**
 * Convenience function to get all factories bound to a Prisma client
 *
 * Usage:
 * ```ts
 * const f = getAllFactories(tx)
 * const user = await f.user.create()
 * const project = await f.project.create(user.id)
 * ```
 */
export function getAllFactories(tx: PrismaClient) {
    return {
        user: createUserFactory(tx),
        project: createProjectFactory(tx),
        internship: createInternshipFactory(tx),
        certification: createCertificationFactory(tx),
        experience: createExperienceFactory(tx),
        education: createEducationFactory(tx),
        language: createLanguageFactory(tx),
        specialty: createSpecialtyFactory(tx),
        tool: createToolFactory(tx),
        socialLink: createSocialLinkFactory(tx),
        aboutSection: createAboutSectionFactory(tx),
        approachItem: createApproachItemFactory(tx),
        userPreference: createUserPreferenceFactory(tx),
    }
}
