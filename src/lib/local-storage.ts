import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define the base directory for storing files
const STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure the storage directory exists
function ensureDirectoryExists(directory: string) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Initialize storage directories
ensureDirectoryExists(STORAGE_DIR);
ensureDirectoryExists(path.join(STORAGE_DIR, 'profile-photos'));
ensureDirectoryExists(path.join(STORAGE_DIR, 'documents'));
ensureDirectoryExists(path.join(STORAGE_DIR, 'images'));
ensureDirectoryExists(path.join(STORAGE_DIR, 'presentations'));

// Interface to match Vercel Blob's PutBlobResult
export interface PutFileResult {
  url: string;
  pathname: string;
}

/**
 * Save a file to local storage
 */
export async function put(
  pathname: string,
  content: Blob | ReadableStream | ArrayBuffer | string,
  options?: {
    access?: 'public' | 'private';
    addRandomSuffix?: boolean;
    contentType?: string;
  }
): Promise<PutFileResult> {
  const startTime = Date.now();

  try {
    // Add a random suffix to prevent filename collisions
    let finalPathname = pathname;
    if (options?.addRandomSuffix !== false) {
      const extension = path.extname(pathname);
      const basename = path.basename(pathname, extension);
      finalPathname = `${basename}_${uuidv4().substring(0, 8)}${extension}`;
    }

    // Determine the full path where the file will be saved
    const fullPath = path.join(STORAGE_DIR, finalPathname);

    // Ensure the directory exists
    ensureDirectoryExists(path.dirname(fullPath));

    // Convert content to Buffer
    let buffer: Buffer;
    if (typeof content === 'string') {
      buffer = Buffer.from(content);
    } else if (content instanceof ArrayBuffer) {
      buffer = Buffer.from(content);
    } else if (content instanceof Blob) {
      buffer = Buffer.from(await content.arrayBuffer());
    } else {
      // Handle ReadableStream - convert to buffer
      const chunks: Uint8Array[] = [];
      const reader = content.getReader();

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          chunks.push(value);
        }
      }

      buffer = Buffer.concat(chunks);
    }

    // Write the file
    fs.writeFileSync(fullPath, buffer);

    // Generate the URL for the file
    const url = `/uploads/${finalPathname}`;

    logger.info('Local file storage success', {
      operation: 'put',
      pathname: finalPathname,
      url,
      size: buffer.length,
      contentType: options?.contentType || 'application/octet-stream',
      duration: `${Date.now() - startTime}ms`,
    });

    return {
      url,
      pathname: finalPathname
    };
  } catch (error) {
    logger.error('Local file storage error', {
      operation: 'put',
      pathname,
      error: error instanceof Error ? error.message : String(error),
      duration: `${Date.now() - startTime}ms`,
    });

    throw error;
  }
}

/**
 * Delete a file from local storage
 */
export async function del(urlOrPath: string): Promise<void> {
  const startTime = Date.now();

  try {
    // Extract the path from the URL
    let filePath: string;

    if (urlOrPath.startsWith('/uploads/')) {
      // Handle relative URL
      filePath = urlOrPath.replace('/uploads/', '');
    } else if (urlOrPath.startsWith('http')) {
      // Handle full URL
      const url = new URL(urlOrPath);
      const pathParts = url.pathname.split('/');
      // Remove first empty part and 'uploads'
      pathParts.splice(0, 2);
      filePath = pathParts.join('/');
    } else {
      // Assume it's already a path
      filePath = urlOrPath;
    }

    const fullPath = path.join(STORAGE_DIR, filePath);

    // Check if file exists
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);

      logger.info('Local file delete success', {
        operation: 'delete',
        path: filePath,
        duration: `${Date.now() - startTime}ms`,
      });
    } else {
      logger.warn('Local file delete - file not found', {
        operation: 'delete',
        path: filePath,
        duration: `${Date.now() - startTime}ms`,
      });
    }
  } catch (error) {
    logger.error('Local file delete error', {
      operation: 'delete',
      path: urlOrPath,
      error: error instanceof Error ? error.message : String(error),
      duration: `${Date.now() - startTime}ms`,
    });

    throw error;
  }
}

/**
 * List files in local storage
 */
export async function list(options?: {
  prefix?: string;
  limit?: number;
}) {
  const startTime = Date.now();

  try {
    const prefix = options?.prefix || '';
    const limit = options?.limit || 100;

    const searchDir = path.join(STORAGE_DIR, prefix);

    // Check if directory exists
    if (!fs.existsSync(searchDir)) {
      return { blobs: [] };
    }

    // Get all files recursively
    const getAllFiles = (dir: string, fileList: string[] = []): string[] => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          fileList = getAllFiles(filePath, fileList);
        } else {
          fileList.push(filePath);
        }
      });

      return fileList;
    };

    const allFiles = getAllFiles(searchDir);

    // Convert to the format expected by the application
    const blobs = allFiles
      .slice(0, limit)
      .map(filePath => {
        const relativePath = path.relative(STORAGE_DIR, filePath);
        const url = `/uploads/${relativePath.replace(/\\/g, '/')}`;

        return {
          url,
          pathname: relativePath.replace(/\\/g, '/'),
          size: fs.statSync(filePath).size,
          uploadedAt: new Date(fs.statSync(filePath).mtime).toISOString()
        };
      });

    logger.info('Local file list success', {
      operation: 'list',
      prefix,
      count: blobs.length,
      duration: `${Date.now() - startTime}ms`,
    });

    return { blobs };
  } catch (error) {
    logger.error('Local file list error', {
      operation: 'list',
      prefix: options?.prefix || '',
      error: error instanceof Error ? error.message : String(error),
      duration: `${Date.now() - startTime}ms`,
    });

    throw error;
  }
} 