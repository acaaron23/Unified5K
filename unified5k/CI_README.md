# CI Pipeline

## CI Tool Used

This project uses **GitHub Actions** for continuous integration.

## Tasks Implemented

The CI pipeline performs three automated checks on every push:

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

## How to Trigger the Pipeline

The pipeline automatically runs on:
- Pushes to `main`, `master`, `develop`, or `Aaron-RunSignUp` branches
- Pull requests to `main`, `master`, or `develop` branches

## Challenges Faced

Challenges we faced when implementing this CI pipeline was knowing where to start. We began watching some YouTube videos for some guidance and asking our PM and TPM for any tips, and it helped quite a bit. We utilized tools such as Claude to guide us through, making sure we are executing the pipeline correctly and it helped us learn how it's structured and how it runs. Afterwards, we were able to create the github/workflows directory with a yaml file. Within the yaml file was directions to run tests for 1: Code Linting, 2: Code Testing, and 3: Build Automation only after sucessful lint and code testing.