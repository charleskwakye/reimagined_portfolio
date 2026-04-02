'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getUserProfile } from '@/lib/actions/user';
import { createUserProfile } from '@/lib/actions/admin';
import { FiSave, FiUser, FiImage, FiGlobe, FiEdit2, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProfilePhotoManager from '@/components/ProfilePhotoManager';

export default function ProfileManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'photos'>('profile');
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    intro: '',
    location: '',
    yearsOfExperience: '',
    education: '',
    interests: '',
    website: ''
  });
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [newLanguage, setNewLanguage] = useState({ name: '', proficiency: '' });
  const [editingLanguage, setEditingLanguage] = useState<string | null>(null);
  const [editLanguageData, setEditLanguageData] = useState({ name: '', proficiency: '' });
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [isReorderingLanguages, setIsReorderingLanguages] = useState(false);
  const [newSocialLink, setNewSocialLink] = useState({ platform: '', url: '', icon: '' });
  const [isAddingSocialLink, setIsAddingSocialLink] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await getUserProfile();
        if (userData) {
          // Extract metadata from about text
          const aboutText = userData.about || '';
          const location = extractMetadataFromAbout(aboutText, 'location');
          const yearsOfExperience = extractMetadataFromAbout(aboutText, 'yearsOfExperience');
          const education = extractMetadataFromAbout(aboutText, 'education');
          const interests = extractMetadataFromAbout(aboutText, 'interests');

          setFormData({
            name: userData.name || '',
            jobTitle: userData.jobTitle || '',
            intro: userData.intro || '',
            location,
            yearsOfExperience,
            education,
            interests,
            website: ''
          });
          setProfileImage(userData.profileImage || '');
        }

        // Fetch social links, languages, and language order separately
        const [socialLinksResponse, languagesResponse, languageOrderResponse] = await Promise.all([
          fetch('/api/social-links'),
          fetch('/api/languages'),
          fetch('/api/languages/reorder')
        ]);

        if (socialLinksResponse.ok) {
          const socialLinksData = await socialLinksResponse.json();
          setSocialLinks(socialLinksData.socialLinks || []);
        }

        if (languagesResponse.ok) {
          const languagesData = await languagesResponse.json();
          let languagesList = languagesData.languages || [];

          // Apply saved order if available
          if (languageOrderResponse.ok) {
            const orderData = await languageOrderResponse.json();
            const savedOrder = orderData.languageOrder || [];

            if (savedOrder.length > 0) {
              // Sort languages according to saved order
              languagesList = savedOrder
                .map((id: string) => languagesList.find((lang: any) => lang.id === id))
                .filter(Boolean)
                .concat(languagesList.filter((lang: any) => !savedOrder.includes(lang.id)));
            }
          }

          setLanguages(languagesList);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      }
    }

    fetchUserData();
  }, []);

  // Helper function to extract metadata from about text
  function extractMetadataFromAbout(aboutText: string, key: string): string {
    // This is a simple extraction method - you can make it more sophisticated if needed
    const regex = new RegExp(`<!-- ${key}:(.*?)-->`, 'i');
    const match = aboutText.match(regex);
    return match ? match[1].trim() : '';
  }

  // Helper function to save metadata in about text
  function saveMetadataInAbout(aboutText: string, metadata: Record<string, string>): string {
    let result = aboutText;

    // Remove existing metadata
    Object.keys(metadata).forEach(key => {
      const regex = new RegExp(`<!-- ${key}:.*?-->\\s*`, 'gi');
      result = result.replace(regex, '');
    });

    // Add metadata at the end
    Object.entries(metadata).forEach(([key, value]) => {
      if (value) {
        result += `\n<!-- ${key}:${value} -->`;
      }
    });

    return result;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const savePromise = new Promise<void>(async (resolve, reject) => {
      try {
        // Get current user data to preserve existing about content
        const userData = await getUserProfile();
        const currentAbout = userData?.about || '';

        // Create metadata object for Quick Facts
        const metadata = {
          location: formData.location,
          yearsOfExperience: formData.yearsOfExperience,
          education: formData.education,
          interests: formData.interests
        };

        // Update about field with metadata
        const updatedAbout = saveMetadataInAbout(currentAbout, metadata);

        const result = await createUserProfile({
          name: formData.name,
          jobTitle: formData.jobTitle,
          intro: formData.intro,
          about: updatedAbout,
          profileImage,
          resumeUrl: undefined // Keep any existing resume URL
        });

        if (result.success) {
          resolve();
          router.refresh();
        } else {
          reject(result.error || 'Something went wrong. Please try again.');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        reject('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    });

    toast.promise(savePromise, {
      loading: 'Updating profile...',
      success: 'Profile updated successfully!',
      error: (err) => `Error: ${err}`
    });
  };

  const handleProfilePhotoSelect = async (imageUrl: string) => {
    // Update local state immediately for UI feedback
    setProfileImage(imageUrl);

    // Only save to database if the image URL has changed
    if (imageUrl !== profileImage) {
      setIsSavingImage(true);

      try {
        // Get current user data to preserve existing about content
        const userData = await getUserProfile();
        const currentAbout = userData?.about || '';

        // Save the new profile image to the database
        const result = await createUserProfile({
          name: formData.name,
          jobTitle: formData.jobTitle,
          intro: formData.intro,
          about: currentAbout,
          profileImage: imageUrl,
          resumeUrl: undefined // Keep any existing resume URL
        });

        if (result.success) {
          toast.success(imageUrl ? 'Profile photo updated successfully!' : 'Profile photo removed successfully!');
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update profile photo');
          // Revert to previous image if save failed
          setProfileImage(profileImage);
        }
      } catch (error) {
        console.error('Error updating profile photo:', error);
        toast.error('Failed to update profile photo');
        // Revert to previous image if save failed
        setProfileImage(profileImage);
      } finally {
        setIsSavingImage(false);
      }
    }
  };

  // Social Links Management Functions
  const handleAddSocialLink = async () => {
    if (!newSocialLink.platform || !newSocialLink.url) {
      toast.error('Platform and URL are required');
      return;
    }

    if (socialLinks.length >= 4) {
      toast.error('Maximum of 4 social links allowed');
      return;
    }

    setIsAddingSocialLink(true);
    try {
      const response = await fetch('/api/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSocialLink)
      });

      if (response.ok) {
        const data = await response.json();
        setSocialLinks([...socialLinks, data.socialLink]);
        setNewSocialLink({ platform: '', url: '', icon: '' });
        toast.success('Social link added successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add social link');
      }
    } catch (error) {
      console.error('Error adding social link:', error);
      toast.error('Failed to add social link');
    } finally {
      setIsAddingSocialLink(false);
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    try {
      const response = await fetch(`/api/social-links/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSocialLinks(socialLinks.filter(link => link.id !== id));
        toast.success('Social link deleted successfully!');
      } else {
        toast.error('Failed to delete social link');
      }
    } catch (error) {
      console.error('Error deleting social link:', error);
      toast.error('Failed to delete social link');
    }
  };

  // Language management functions
  const handleAddLanguage = async () => {
    if (!newLanguage.name || !newLanguage.proficiency) {
      toast.error('Language name and proficiency are required');
      return;
    }

    setIsAddingLanguage(true);
    try {
      const response = await fetch('/api/languages/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLanguage)
      });

      if (response.ok) {
        const data = await response.json();
        setLanguages([...languages, data.language]);
        setNewLanguage({ name: '', proficiency: '' });
        toast.success('Language added successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add language');
      }
    } catch (error) {
      console.error('Error adding language:', error);
      toast.error('Failed to add language');
    } finally {
      setIsAddingLanguage(false);
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    try {
      const response = await fetch(`/api/languages/${id}/delete`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLanguages(languages.filter(lang => lang.id !== id));
        toast.success('Language deleted successfully!');
      } else {
        toast.error('Failed to delete language');
      }
    } catch (error) {
      console.error('Error deleting language:', error);
      toast.error('Failed to delete language');
    }
  };

  const handleEditLanguage = (language: any) => {
    setEditingLanguage(language.id);
    setEditLanguageData({ name: language.name, proficiency: language.proficiency });
  };

  const handleUpdateLanguage = async (id: string) => {
    if (!editLanguageData.name || !editLanguageData.proficiency) {
      toast.error('Language name and proficiency are required');
      return;
    }

    try {
      const response = await fetch(`/api/languages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editLanguageData)
      });

      if (response.ok) {
        const updatedLanguage = await response.json();
        setLanguages(languages.map(lang =>
          lang.id === id ? updatedLanguage : lang
        ));
        setEditingLanguage(null);
        setEditLanguageData({ name: '', proficiency: '' });
        toast.success('Language updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update language');
      }
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error('Failed to update language');
    }
  };

  const handleCancelEdit = () => {
    setEditingLanguage(null);
    setEditLanguageData({ name: '', proficiency: '' });
  };

  const moveLanguage = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= languages.length) return;

    console.log(`Moving language from index ${fromIndex} to ${toIndex}`);

    const newLanguages = [...languages];
    const [movedLanguage] = newLanguages.splice(fromIndex, 1);
    newLanguages.splice(toIndex, 0, movedLanguage);

    console.log('New languages order:', newLanguages.map(l => l.name));

    setLanguages(newLanguages);
    setIsReorderingLanguages(true);

    try {
      // Create a reorder API call similar to tools
      const response = await fetch('/api/languages/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageOrder: newLanguages.map(lang => lang.id)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save language order');
      }

      console.log('Language order saved successfully');
      toast.success('Language order updated successfully');
    } catch (error) {
      console.error('Error saving language order:', error);
      toast.error('Failed to save language order');
      // Revert on error
      const [socialLinksResponse, languagesResponse] = await Promise.all([
        fetch('/api/social-links'),
        fetch('/api/languages')
      ]);
      if (languagesResponse.ok) {
        const languagesData = await languagesResponse.json();
        setLanguages(languagesData.languages || []);
      }
    } finally {
      setIsReorderingLanguages(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      <p className="text-muted-foreground mb-8">Manage your personal information and profile photos</p>

      {/* Tabs */}
      <div className="border-b border-border mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
          >
            <FiUser className="mr-2 h-5 w-5" />
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${activeTab === 'photos'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
          >
            <FiImage className="mr-2 h-5 w-5" />
            Profile Photos
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-24 w-24 relative rounded-full overflow-hidden border-2 border-primary/20">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Selected profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-muted h-full w-full flex items-center justify-center text-4xl text-muted-foreground">
                  {formData.name ? formData.name[0] : "U"}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium">{profileImage ? 'Profile Photo Selected' : 'No Profile Photo'}</h2>
              <p className="text-sm text-muted-foreground mb-2">
                {profileImage ? 'You can change your photo in the "Profile Photos" tab' : 'Add profile photos in the "Profile Photos" tab'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className="text-sm text-primary hover:underline"
              >
                {profileImage ? 'Change photo' : 'Add a photo'}
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="jobTitle" className="text-sm font-medium leading-none">
                Job Title
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                value={formData.jobTitle}
                onChange={handleChange}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Full Stack Developer"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="intro" className="text-sm font-medium leading-none">
              Intro/Tagline
            </label>
            <input
              id="intro"
              name="intro"
              type="text"
              value={formData.intro}
              onChange={handleChange}
              className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="A brief intro like 'Passionate developer building amazing web experiences'"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium leading-none">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="New York, USA"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Displayed in Quick Facts section
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="yearsOfExperience" className="text-sm font-medium leading-none">
                Years of Experience
              </label>
              <input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="text"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="5+ years"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Displayed in Quick Facts section
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="education" className="text-sm font-medium leading-none">
                Education Summary
              </label>
              <input
                id="education"
                name="education"
                type="text"
                value={formData.education}
                onChange={handleChange}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="BSc Computer Science"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Brief education summary for Quick Facts section
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="interests" className="text-sm font-medium leading-none">
                Interests
              </label>
              <input
                id="interests"
                name="interests"
                type="text"
                value={formData.interests}
                onChange={handleChange}
                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Hiking, Reading, Photography"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list for Quick Facts section
              </p>
            </div>
          </div>

          {/* Languages Management Section */}
          <div className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Languages</h3>
                <p className="text-sm text-muted-foreground">
                  Manage languages with proficiency levels. These will appear on your home page and about page.
                </p>
              </div>
              <button
                onClick={() => setIsAddingLanguage(true)}
                className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
              >
                Add Language
              </button>
            </div>

            {/* Add Language Form */}
            {isAddingLanguage && (
              <div className="border rounded-lg p-4 bg-card">
                <h4 className="text-base font-medium mb-4">Add New Language</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="language-name" className="block text-sm font-medium mb-2 text-foreground">
                      Language Name
                    </label>
                    <input
                      id="language-name"
                      type="text"
                      value={newLanguage.name}
                      onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Spanish, French, Mandarin"
                    />
                  </div>
                  <div>
                    <label htmlFor="language-proficiency" className="block text-sm font-medium mb-2 text-foreground">
                      Proficiency Level
                    </label>
                    <select
                      id="language-proficiency"
                      value={newLanguage.proficiency}
                      onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select proficiency</option>
                      <option value="Native">Native</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Basic">Basic</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddLanguage}
                    disabled={!newLanguage.name || !newLanguage.proficiency}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
                  >
                    Add Language
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingLanguage(false);
                      setNewLanguage({ name: '', proficiency: '' });
                    }}
                    className="px-4 py-2 border border-input rounded-md hover:bg-muted text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Languages List */}
            <div className="space-y-3">
              {languages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  No languages added yet. Add your first language to get started!
                </p>
              ) : (
                languages.map((language: any, index: number) => (
                  <div key={language.id} className="flex items-center justify-between p-4 border border-input rounded-lg bg-card">
                    {editingLanguage === language.id ? (
                      // Edit mode
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editLanguageData.name}
                          onChange={(e) => setEditLanguageData({ ...editLanguageData, name: e.target.value })}
                          className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Language name"
                        />
                        <select
                          value={editLanguageData.proficiency}
                          onChange={(e) => setEditLanguageData({ ...editLanguageData, proficiency: e.target.value })}
                          className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select proficiency</option>
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Basic">Basic</option>
                        </select>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {index + 1}
                          </span>
                          <span className="font-medium text-foreground">{language.name}</span>
                          <span className="text-sm text-muted-foreground">({language.proficiency})</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      {editingLanguage === language.id ? (
                        // Edit mode buttons
                        <>
                          <button
                            onClick={() => handleUpdateLanguage(language.id)}
                            disabled={!editLanguageData.name || !editLanguageData.proficiency}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md disabled:opacity-50"
                            title="Save changes"
                          >
                            <FiSave className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                            title="Cancel edit"
                          >
                            <FiUser className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        // View mode buttons
                        <>
                          <button
                            onClick={() => moveLanguage(index, index - 1)}
                            disabled={index === 0 || isReorderingLanguages}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <FiChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveLanguage(index, index + 1)}
                            disabled={index === languages.length - 1 || isReorderingLanguages}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <FiChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditLanguage(language)}
                            disabled={isReorderingLanguages}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md disabled:opacity-50"
                            title="Edit language"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLanguage(language.id)}
                            disabled={isReorderingLanguages}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                            title="Delete language"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {isReorderingLanguages && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Updating language order...</span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-medium mt-8 mb-4">Social Links (Max 4)</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage up to 4 social links that will appear universally across your site (footer, contact page, etc.).
          </p>

          {/* Existing Social Links */}
          <div className="space-y-4 mb-6">
            {socialLinks.length > 0 ? (
              socialLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{link.platform}</p>
                    <p className="text-sm text-muted-foreground">{link.url}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSocialLink(link.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No social links added yet.</p>
            )}
          </div>

          {/* Add New Social Link */}
          <div className="border border-dashed border-border rounded-lg p-4">
            <h4 className="font-medium mb-4">Add New Social Link</h4>
            <div className="mb-4 p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium mb-2">
                🎯 <strong>Platforms with Professional Icons:</strong>
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mb-3">
                <div>• GitHub ✅</div>
                <div>• LinkedIn ✅</div>
                <div>• Twitter/X ✅</div>
                <div>• Instagram ✅</div>
                <div>• YouTube ✅</div>
                <div>• Email/Mail ✅</div>
                <div>• Website/Portfolio ✅</div>
                <div>• Discord/Slack ✅</div>
              </div>
              <p className="text-sm font-medium mb-2">
                📱 <strong>Other platforms (use emojis in Icon field):</strong>
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <div>• TikTok 🎵</div>
                <div>• Behance 🎨</div>
                <div>• Dribbble 🏀</div>
                <div>• Facebook 📘</div>
                <div>• WhatsApp 💬</div>
                <div>• Telegram ✈️</div>
                <div>• Medium 📝</div>
                <div>• Spotify 🎵</div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="platform" className="text-sm font-medium leading-none">
                  Platform
                </label>
                <input
                  id="platform"
                  type="text"
                  value={newSocialLink.platform}
                  onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value })}
                  className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="GitHub, Twitter, LinkedIn, etc."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium leading-none">
                  URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={newSocialLink.url}
                  onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                  className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="icon" className="text-sm font-medium leading-none">
                  Icon (optional)
                </label>
                <input
                  id="icon"
                  type="text"
                  value={newSocialLink.icon}
                  onChange={(e) => setNewSocialLink({ ...newSocialLink, icon: e.target.value })}
                  className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Icon name or emoji"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Platforms with ✅ above:</strong> Leave empty for automatic professional icons
                  <br />
                  <strong>Other platforms:</strong> Use emojis (🎵📱🎨) for custom icons
                </p>
              </div>
            </div>

            <button
              onClick={handleAddSocialLink}
              disabled={isAddingSocialLink || !newSocialLink.platform || !newSocialLink.url || socialLinks.length >= 4}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              {isAddingSocialLink ? 'Adding...' : socialLinks.length >= 4 ? 'Max 4 Links Reached' : 'Add Social Link'}
            </button>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
              <FiSave className="ml-2 h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {activeTab === 'photos' && (
        <div className="space-y-6">
          <ProfilePhotoManager
            maxPhotos={5}
            currentProfileImage={profileImage}
            onPhotoSelect={handleProfilePhotoSelect}
          />

          {isSavingImage && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Saving profile photo...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 