# Testing Guide

This guide explains how to run tests safely without affecting your production database.

## Environment Files

This project uses multiple environment files for different purposes:

| File | Purpose | Gitignored? |
|------|---------|-------------|
| `.env` | Production database | ✅ Yes |
| `.env.local` | Local development overrides | ✅ Yes |
| `.env.test` | Test database reference (safe defaults) | ❌ No |
| `.env.test.local` | Local test overrides | ✅ Yes |
| `.env.test.example` | Template for local setup | ❌ No |

### Setting Up Local Test Environment

1. **Copy the template**:
   ```bash
   cp .env.test.example .env.test.local
   ```

2. **Edit `.env.test.local`** with your local PostgreSQL credentials:
   ```bash
   # For macOS, run 'whoami' to find your username
   POSTGRES_USER=your_mac_username
   POSTGRES_PASSWORD=your_password
   
   # Update DATABASE_URL with your credentials
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/portfolio_test"
   ```

3. **Start the test database**:
   ```bash
   npm run test:start-db
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

### How It Works

- **`.env.test.local`**: Your local test configuration (gitignored). This is the main env file used for running tests.
- **`.env.test`**: Contains safe generic defaults for reference. Not used directly in testing.
- **`.env.test.example`**: Shows developers what variables they need to set in their local config.

## Quick Start

```bash
# 1. Start test database (first time)
npm run test:start-db

# 2. Run tests
npm test

# 3. Stop test database (optional)
npm run test:stop-db
```

## Commands

### Start Test Database
```bash
npm run test:start-db
```
Starts a Docker PostgreSQL container for testing.

### Run Tests
```bash
npm test
```
Runs all tests. Automatically uses `.env.test.local` (your local test database).

### Stop Test Database
```bash
npm run test:stop-db
```
Stops the Docker container. Data is preserved.

### Reset Test Database
```bash
npm run test:clean
```
Completely resets the test database (deletes and recreates).

## Troubleshooting

### "SAFETY CHECK FAILED" Error

This means tests are trying to connect to production database!

**Solution:**
```bash
# Start test database first
npm run test:start-db

# Then run tests
npm test
```

### "Connection Refused" Error

Test database not running.

**Solution:**
```bash
npm run test:start-db
```

### Port Conflict (Port 5432 in use)

If another service (like a local PostgreSQL server) is using port 5432, the test database container will fail to start.

**Solution:**

1. Stop the other service using port 5432
2. Or, change the port in `docker-compose.test.yml` (e.g., to `"5433:5432"`) and update `DATABASE_URL` in `.env.test.local` to match

### Tests Fail After Long Time

Reset the test database:
```bash
npm run test:clean
npm test
```

## Seeding Production Database

⚠️ WARNING: This will modify your production Neon database!

This command is for **production recovery only** - use when you've lost data and need to restore from the recovered data.

```bash
# Verify you're using production .env
echo $DATABASE_URL

# If it shows your Neon URL, you're good
# Run the seed
npm run db:seed
```

## How It Works

### Safety Features

| Feature | What It Does |
|---------|--------------|
| `.env.test.local` | Contains local test database URL |
| `dotenv -e .env.test.local` | Forces tests to use local test database |
| Safety check in setup.ts | Blocks if trying to connect to production |
| Docker container | Isolated test database |

### Test Database Flow

```
npm test
    ↓
Loads .env.test.local (not .env)
    ↓
Safety check verifies test DB
    ↓
Runs tests against Docker PostgreSQL
    ↓
Data is isolated from production
```

## Common Issues

### Tests Still Use Production Database

Make sure you've started the test database:
```bash
npm run test:start-db
```

### Can't Connect to Docker

Make sure Docker is running:
```bash
docker --version
docker ps
```

### Want to Verify Production is Safe

Check your current DATABASE_URL:
```bash
# This should NOT show neon.tech
echo $DATABASE_URL

# If it does, tests would fail (safety check)
# Always use npm run test:start-db && npm test
```

## GitHub Actions

Tests on GitHub automatically use a test database - no setup needed!

```yaml
# .github/workflows/test.yml
services:
  postgres:
    env:
      POSTGRES_DB: portfolio_test  # Creates test DB automatically
```

## Summary

| Action | Command |
|--------|---------|
| Start test DB | `npm run test:start-db` |
| Run tests | `npm test` |
| Stop test DB | `npm run test:stop-db` |
| Reset test DB | `npm run test:clean` |
| Seed production | `npm run db:seed` |
