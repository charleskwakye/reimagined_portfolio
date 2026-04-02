import { NextRequest, NextResponse } from 'next/server';
import { githubCache, parseGitHubUrl, transformImageUrls } from '@/lib/github-cache';

interface RequestBody {
  repoUrl: string;
  branch?: string;
  force?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { repoUrl, branch, force = false } = body;

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL. Use format: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    const cacheKey = `${parsed.owner}:${parsed.repo}:${branch || parsed.branch}`;
    
    // Check cache unless force refresh
    if (!force) {
      const cached = githubCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          content: cached.content,
          lastUpdated: cached.lastUpdated.toISOString(),
          isFresh: true,
          isCached: true,
          branch: cached.branch,
        });
      }
    } else {
      // Force refresh - invalidate cache
      githubCache.invalidate(cacheKey);
    }

    // Fetch from GitHub
    const branchesToTry = [branch || parsed.branch, 'main', 'master'];
    let content = '';
    let successBranch = '';

    for (const branchName of branchesToTry) {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branchName}/README.md`,
          {
            headers: {
              'Accept': 'text/plain',
              'User-Agent': 'Portfolio-App/1.0',
            },
            next: { revalidate: 0 }, // Don't cache at Next.js level
          }
        );

        if (response.ok) {
          content = await response.text();
          successBranch = branchName;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!content) {
      // Try to return stale cache as fallback
      const staleEntry = githubCache.getStale(cacheKey);
      if (staleEntry) {
        return NextResponse.json({
          content: staleEntry.content,
          lastUpdated: staleEntry.lastUpdated.toISOString(),
          isFresh: false,
          isCached: true,
          isStale: true,
          branch: staleEntry.branch,
          error: 'Failed to fetch from GitHub, showing cached content',
        });
      }

      return NextResponse.json(
        { error: 'README.md not found in repository' },
        { status: 404 }
      );
    }

    // Transform content
    const transformedContent = transformImageUrls(content, parsed.owner, parsed.repo, successBranch);

    // Update cache
    const now = new Date();
    githubCache.set(cacheKey, {
      content: transformedContent,
      lastUpdated: now,
      branch: successBranch,
    });

    return NextResponse.json({
      content: transformedContent,
      lastUpdated: now.toISOString(),
      isFresh: true,
      isCached: false,
      branch: successBranch,
    });

  } catch (error) {
    console.error('Error fetching GitHub README:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}