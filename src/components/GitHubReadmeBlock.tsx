'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MarkdownBlock } from './MarkdownBlock';
import { FiLoader, FiAlertCircle, FiGithub } from 'react-icons/fi';

interface GitHubReadmeBlockProps {
  repoUrl: string;
  branch?: string;
  lastUpdated?: string;
  isPreview?: boolean;
}

interface ReadmeData {
  content: string;
  lastUpdated: string;
  isFresh: boolean;
  isCached: boolean;
  isStale?: boolean;
  branch: string;
  error?: string;
}

export function GitHubReadmeBlock({ repoUrl, branch, lastUpdated: initialLastUpdated, isPreview = false }: GitHubReadmeBlockProps) {
  const [readme, setReadme] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readmeData, setReadmeData] = useState<ReadmeData | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchReadme = useCallback(async (force = false) => {
    if (!repoUrl) {
      setError('No repository URL provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/github-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, branch, force }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch README');
      }

      const data: ReadmeData = await response.json();
      setReadme(data.content);
      setReadmeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch README');
    } finally {
      setLoading(false);
    }
  }, [repoUrl, branch]);

  useEffect(() => {
    // Only fetch once on mount, not on every dependency change
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchReadme();
    }
  }, []); // Empty dependency array - only run once on mount

  if (loading) {
    return (
      <div className="my-8 p-8 flex flex-col items-center justify-center border border-border rounded-lg bg-muted/50">
        <FiLoader className="animate-spin h-8 w-8 text-primary mb-3" />
        <p className="text-muted-foreground">Loading README from GitHub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 p-6 border border-destructive/30 rounded-lg bg-destructive/10">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-destructive mb-1">Failed to Load README</h4>
            <p className="text-sm text-destructive/80">{error}</p>
            {repoUrl && (
              <a 
                href={repoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline"
              >
                <FiGithub className="h-4 w-4" />
                View Repository on GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <MarkdownBlock content={readme} />
    </div>
  );
}

// Admin version with refresh capability
interface GitHubReadmeBlockAdminProps extends GitHubReadmeBlockProps {
  onRefresh?: (lastUpdated: string) => void;
}

export function GitHubReadmeBlockAdmin({ repoUrl, branch, onRefresh }: GitHubReadmeBlockAdminProps) {
  const [readme, setReadme] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readmeData, setReadmeData] = useState<ReadmeData | null>(null);
  const [parsedUrl, setParsedUrl] = useState<{owner: string; repo: string} | null>(null);
  const hasFetchedRef = useRef(false);
  const isMountedRef = useRef(true);

  const fetchReadme = useCallback(async (force = false, isManualRefresh = false) => {
    if (!repoUrl) {
      setError('No repository URL provided');
      setLoading(false);
      return;
    }

    try {
      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/github-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, branch, force }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch README');
      }

      const data: ReadmeData = await response.json();
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setReadme(data.content);
        setReadmeData(data);
        
        // Parse URL for display
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          setParsedUrl({ owner: match[1], repo: match[2].replace(/\.git$/, '') });
        }
        
        // Only call onRefresh for manual refreshes, not auto-fetch
        if (isManualRefresh && onRefresh) {
          onRefresh(data.lastUpdated);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch README');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [repoUrl, branch]); // Remove onRefresh from dependencies

  useEffect(() => {
    // Only fetch once on mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchReadme(false, false);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, []); // Empty dependency array - only run once

  const handleForceRefresh = () => {
    fetchReadme(true, true); // force=true, isManualRefresh=true
  };

  // Format time ago
  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  // Check if fresh (within 5 minutes)
  const isFresh = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return date > fiveMinutesAgo;
  };

  if (loading) {
    return (
      <div className="my-8 p-8 flex flex-col items-center justify-center border border-border rounded-lg bg-muted/50">
        <FiLoader className="animate-spin h-8 w-8 text-primary mb-3" />
        <p className="text-muted-foreground">Loading README from GitHub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8 p-6 border border-destructive/30 rounded-lg bg-destructive/10">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-destructive mb-1">Failed to Load README</h4>
            <p className="text-sm text-destructive/80">{error}</p>
            {repoUrl && (
              <a 
                href={repoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline"
              >
                <FiGithub className="h-4 w-4" />
                View Repository on GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      {/* Admin Status Bar */}
      {readmeData && (
        <div className="flex items-center justify-between p-3 mb-4 bg-muted rounded-md border border-border">
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                readmeData.isStale 
                  ? 'bg-orange-500' 
                  : isFresh(readmeData.lastUpdated) 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
              }`} 
            />
            <span className="text-sm text-muted-foreground">
              {readmeData.isStale 
                ? `Stale • Updated ${formatTimeAgo(readmeData.lastUpdated)}`
                : isFresh(readmeData.lastUpdated)
                  ? `Live • Updated ${formatTimeAgo(readmeData.lastUpdated)}`
                  : `Cached • Updated ${formatTimeAgo(readmeData.lastUpdated)}`
              }
            </span>
            {parsedUrl && (
              <span className="text-xs text-muted-foreground">
                ({parsedUrl.owner}/{parsedUrl.repo})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleForceRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {refreshing ? (
              <>
                <FiLoader className="animate-spin h-3 w-3" />
                Refreshing...
              </>
            ) : (
              <>
                <FiGithub className="h-3 w-3" />
                Force Refresh
              </>
            )}
          </button>
        </div>
      )}
      
      <MarkdownBlock content={readme} />
    </div>
  );
}