// Simple in-memory cache for GitHub READMEs with TTL
interface CacheEntry {
  content: string;
  lastUpdated: Date;
  branch: string;
}

class GitHubCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const age = Date.now() - entry.lastUpdated.getTime();
    if (age > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  set(key: string, entry: CacheEntry): void {
    this.cache.set(key, entry);
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  isFresh(key: string): boolean {
    const entry = this.get(key);
    if (!entry) return false;
    const age = Date.now() - entry.lastUpdated.getTime();
    return age < this.TTL_MS;
  }

  // Get stale entry even if expired (for fallback)
  getStale(key: string): CacheEntry | null {
    return this.cache.get(key) || null;
  }
}

export const githubCache = new GitHubCache();

// Helper to parse GitHub URL
export function parseGitHubUrl(url: string): { owner: string; repo: string; branch: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, '');
      const branchFromUrl = match[3];
      return { owner, repo, branch: branchFromUrl || 'main' };
    }
  }
  return null;
}

// Transform relative URLs in README to absolute
export function transformImageUrls(content: string, owner: string, repo: string, branchName: string): string {
  // Handle markdown images with relative paths
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let transformed = content.replace(markdownImageRegex, (match, alt, url) => {
    if (url.startsWith('http') || url.startsWith('data:')) {
      return match;
    }
    if (url.startsWith('/')) {
      const absoluteUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branchName}${url}`;
      return `![${alt}](${absoluteUrl})`;
    }
    const absoluteUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branchName}/${url}`;
    return `![${alt}](${absoluteUrl})`;
  });

  // Handle HTML img tags
  const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  transformed = transformed.replace(htmlImgRegex, (match, url) => {
    if (url.startsWith('http') || url.startsWith('data:')) {
      return match;
    }
    const baseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branchName}`;
    const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    return match.replace(url, absoluteUrl);
  });

  // Handle anchor links
  const anchorRegex = /\[([^\]]+)\]\((?!http|\/\/|#|mailto:)([^)]+)\)/g;
  transformed = transformed.replace(anchorRegex, (match, text, url) => {
    const baseUrl = `https://github.com/${owner}/${repo}/blob/${branchName}`;
    const absoluteUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    return `[${text}](${absoluteUrl})`;
  });

  return transformed;
}

// Format time ago for display
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}