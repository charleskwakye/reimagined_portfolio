'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiMapPin, FiCalendar, FiBookOpen, FiHeart, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface QuickFact {
    location: string;
    yearsOfExperience: string;
    education: string;
    interests: string;
    languages: string;
}

export default function QuickFactsManagementPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<QuickFact>({
        location: '',
        yearsOfExperience: '',
        education: '',
        interests: '',
        languages: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchQuickFacts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/quick-facts');
                if (response.ok) {
                    const data = await response.json();
                    setFormData(data.quickFacts);
                } else {
                    toast.error('Failed to load quick facts');
                }
            } catch (error) {
                console.error('Error fetching quick facts:', error);
                toast.error('Failed to load quick facts');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuickFacts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.location || !formData.yearsOfExperience) {
            toast.error('Location and years of experience are required');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/quick-facts', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('Quick facts updated successfully!');
                router.refresh();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to update quick facts');
            }
        } catch (error) {
            console.error('Error updating quick facts:', error);
            toast.error('Failed to update quick facts');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quick Facts Management</h1>
                    <p className="text-muted-foreground">Manage the quick facts displayed on your About page</p>
                </div>
                <Link
                    href="/admin/about"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                >
                    <FiArrowLeft className="mr-2 h-4 w-4" />
                    Back to About
                </Link>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h2 className="text-lg font-medium mb-2 flex items-center">
                            <FiMapPin className="mr-2 h-5 w-5 text-primary" />
                            Quick Facts Overview
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            These facts will be displayed in the "Quick Facts" section of your About page.
                            They provide visitors with a quick overview of your background and interests.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium leading-none flex items-center">
                                <FiMapPin className="mr-2 h-4 w-4" />
                                Location *
                            </label>
                            <input
                                id="location"
                                name="location"
                                type="text"
                                value={formData.location}
                                onChange={handleChange}
                                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="New York, USA"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="yearsOfExperience" className="text-sm font-medium leading-none flex items-center">
                                <FiCalendar className="mr-2 h-4 w-4" />
                                Years of Experience *
                            </label>
                            <input
                                id="yearsOfExperience"
                                name="yearsOfExperience"
                                type="text"
                                value={formData.yearsOfExperience}
                                onChange={handleChange}
                                className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="5+ years"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="education" className="text-sm font-medium leading-none flex items-center">
                            <FiBookOpen className="mr-2 h-4 w-4" />
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
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="interests" className="text-sm font-medium leading-none flex items-center">
                            <FiHeart className="mr-2 h-4 w-4" />
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
                        <p className="text-xs text-muted-foreground">
                            Comma-separated list of your interests and hobbies
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="languages" className="text-sm font-medium leading-none flex items-center">
                            <FiMessageSquare className="mr-2 h-4 w-4" />
                            Languages
                        </label>
                        <input
                            id="languages"
                            name="languages"
                            type="text"
                            value={formData.languages}
                            onChange={handleChange}
                            className="block w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="English, Spanish, French"
                        />
                        <p className="text-xs text-muted-foreground">
                            Languages you speak, separated by commas
                        </p>
                    </div>

                    <div className="pt-4 border-t">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <FiSave className="mr-2 h-4 w-4" />
                                    Save Quick Facts
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
