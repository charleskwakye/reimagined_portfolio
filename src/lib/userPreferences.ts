import { prisma } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * UserPreferences utility functions
 * These functions provide a safe way to store and retrieve user preferences
 * without modifying the core data models
 */

// Keys for different preference types
export const PreferenceKeys = {
  CERTIFICATION_ORDER: 'certification_order',
  EXPERIENCE_ORDER: 'experience_order',
  CONTACT_INFO: 'contact_info',
};

/**
 * Get a user preference by key
 */
export async function getUserPreference(userId: string, key: string) {
  try {
    const preference = await prisma.userPreference.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });
    
    if (!preference) return null;
    
    try {
      // Parse the JSON value
      return JSON.parse(preference.value);
    } catch (e) {
      console.error('Error parsing preference value:', e);
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving preference ${key}:`, error);
    return null;
  }
}

/**
 * Set a user preference
 */
export async function setUserPreference(userId: string, key: string, value: any) {
  try {
    // Convert the value to a JSON string
    const jsonValue = JSON.stringify(value);
    
    // Upsert the preference (create if doesn't exist, update if it does)
    const result = await prisma.userPreference.upsert({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      update: {
        value: jsonValue,
        updatedAt: new Date(),
      },
      create: {
        id: uuidv4(),
        userId,
        key,
        value: jsonValue,
        updatedAt: new Date(),
      },
    });
    
    return true;
  } catch (error) {
    console.error(`Error setting preference ${key}:`, error);
    return false;
  }
}

/**
 * Delete a user preference
 */
export async function deleteUserPreference(userId: string, key: string) {
  try {
    await prisma.userPreference.delete({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });
    
    return true;
  } catch (error) {
    console.error(`Error deleting preference ${key}:`, error);
    return false;
  }
}

/**
 * Get the ordering for certifications
 */
export async function getCertificationOrder(userId: string) {
  return getUserPreference(userId, PreferenceKeys.CERTIFICATION_ORDER) || {};
}

/**
 * Set the ordering for certifications
 */
export async function setCertificationOrder(userId: string, orderMap: Record<string, number>) {
  return setUserPreference(userId, PreferenceKeys.CERTIFICATION_ORDER, orderMap);
}

/**
 * Get the ordering for experiences
 */
export async function getExperienceOrder(userId: string) {
  return getUserPreference(userId, PreferenceKeys.EXPERIENCE_ORDER) || {};
}

/**
 * Set the ordering for experiences
 */
export async function setExperienceOrder(userId: string, orderMap: Record<string, number>) {
  return setUserPreference(userId, PreferenceKeys.EXPERIENCE_ORDER, orderMap);
}

/**
 * Get the contact info
 */
export async function getContactInfo(userId: string) {
  return getUserPreference(userId, PreferenceKeys.CONTACT_INFO) || {
    email: 'example@example.com',
    location: 'New York, NY',
    connectText: 'Interested in working together? Feel free to reach out to discuss potential opportunities.',
  };
}

/**
 * Set the contact info
 */
export async function setContactInfo(userId: string, contactInfo: any) {
  return setUserPreference(userId, PreferenceKeys.CONTACT_INFO, contactInfo);
} 