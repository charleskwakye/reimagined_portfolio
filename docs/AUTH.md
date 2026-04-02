# Authentication Guide

## Overview

This portfolio website uses Next.js Authentication (NextAuth.js) to protect admin routes. Only authorized users can access the admin dashboard and make changes to the website content. The admin section is completely hidden from unauthorized users.

## Environment Variables

To set up authentication, you need to configure the following environment variables in your `.env.local` file:

```
# NextAuth Configuration
NEXTAUTH_SECRET=your-long-secure-random-string
NEXTAUTH_URL=http://localhost:3000

# Admin Credentials
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-secure-password
```

### Variable Descriptions:

- **NEXTAUTH_SECRET**: A secret key used to encrypt tokens. In production, use a long, randomly generated string. You can generate one with: `openssl rand -base64 32`
- **NEXTAUTH_URL**: The base URL of your application. In development, use http://localhost:3000
- **ADMIN_USERNAME**: The username for admin access
- **ADMIN_PASSWORD**: The password for admin access

## Security Features

### Admin Route Protection
- All admin routes return 404 errors for unauthorized users, hiding the existence of the admin section
- The login page uses generic language that doesn't reveal it's for admin access
- API endpoints return 404 instead of 401/403 to prevent endpoint discovery

### Authentication Flow
1. To access the admin panel, navigate directly to `/admin/login`
2. After successful authentication, you will be redirected to the admin dashboard
3. All admin API endpoints verify authentication before processing requests
4. Failed authentication attempts won't reveal the existence of the admin section

## Security Notes

1. **Never commit** your `.env.local` file to version control
2. Use strong passwords for admin credentials
3. In production, consider using OAuth providers instead of credentials-based authentication for enhanced security
4. The secret key should be kept private and should never be shared
5. Regularly rotate credentials and monitor failed authentication attempts

## Development Testing

For development testing, you can set simple credentials like:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password123
```

But ensure these are replaced with strong credentials in production. 