# CI Pipeline

## What It Does

This project has an automated CI pipeline that runs on every push to the main branches. It performs three checks:

### 1. Code Linting (ESLint)
- Runs `npm run lint`
- Checks for code style issues and common errors
- Fails if any linting errors are found (warnings are okay)

### 2. TypeScript Type Checking
- Runs `npm run type-check`
- Verifies all TypeScript types are correct
- Fails if there are any type errors

### 3. Build Verification
- Runs `npx expo export --platform web`
- Ensures the app can compile and build successfully
- Fails if the build process encounters errors

## How to View Results

1. Go to the **Actions** tab on GitHub
2. Click on the latest workflow run
3. View the results of each check

## Running Locally

You can run these same checks on your local machine before pushing:

```bash
npm run lint          # Run linting
npm run type-check    # Check types
npx expo export --platform web --output-dir dist  # Test build
```

## When It Runs

The pipeline automatically runs on:
- Pushes to `main`, `master`, `develop`, or `Aaron-RunSignUp` branches
- Pull requests to `main`, `master`, or `develop` branches
