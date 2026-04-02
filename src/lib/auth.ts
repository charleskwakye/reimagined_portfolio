import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Basic auth options for Admin access
// In a real application, you should use a more secure method
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Portfolio Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Basic check for admin credentials
        // In production, use environment variables and proper hashing
        console.log('Auth attempt:', {
          hasUsername: !!credentials?.username,
          hasPassword: !!credentials?.password,
          envUsername: !!process.env.ADMIN_USERNAME,
          envPassword: !!process.env.ADMIN_PASSWORD
        });

        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "admin",
            name: "Admin",
            email: "admin@example.com",
          };
        }
        console.log('Authentication failed');
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub || "admin";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 