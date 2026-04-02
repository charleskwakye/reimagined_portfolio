'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function QuickActionsPage() {
    const [isUnflagging, setIsUnflagging] = useState(false);
    const [message, setMessage] = useState('');

    const unflagAllProjects = async () => {
        setIsUnflagging(true);
        setMessage('');

        try {
            const response = await fetch('/api/projects/unflag-all', {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`✅ Successfully unflagged ${data.count} projects`);
            } else {
                setMessage('❌ Failed to unflag projects');
            }
        } catch (error) {
            setMessage('❌ Error: ' + error);
        } finally {
            setIsUnflagging(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Quick Admin Actions</h1>

            <div className="bg-card p-6 rounded-lg border">
                <h2 className="text-lg font-semibold mb-4">Fix Featured Projects</h2>
                <p className="text-muted-foreground mb-4">
                    This will remove the "Featured" status from ALL projects. You can then manually select which projects to feature.
                </p>

                <Button
                    onClick={unflagAllProjects}
                    disabled={isUnflagging}
                    variant="destructive"
                >
                    {isUnflagging ? 'Unflagging...' : 'Unflag All Projects'}
                </Button>

                {message && (
                    <div className="mt-4 p-3 rounded-md bg-muted">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
