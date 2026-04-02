import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';

/**
 * Wrapper function to protect admin routes on the server side
 * Use this in server components to redirect unauthenticated users
 */
export async function withAuth(
  callback: () => Promise<JSX.Element> | JSX.Element
): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/admin/login');
  }
  
  return callback();
}

/**
 * Gets the current session if it exists
 */
export async function getCurrentSession() {
  return getServerSession(authOptions);
} 