# Contributing to Noteship

Thank you for your interest in contributing to Noteship! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Security](#security)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/noteship.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18 or later
- pnpm 9.12.0 (install via `npm install -g pnpm@9.12.0`)
- AWS Account (for infrastructure deployment)
- Auth0 Account (for authentication)

### Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Fill in your local development values
   ```
   
   For local development with emulators:
   ```bash
   cp .env.local.example .env
   # Use local emulator endpoints
   ```

3. **Start development servers**:
   ```bash
   pnpm dev
   ```

4. **Run tests**:
   ```bash
   pnpm test
   ```

5. **Lint code**:
   ```bash
   pnpm lint
   ```

6. **Format code**:
   ```bash
   pnpm format
   ```

### Repository Structure

- `apps/web`: Next.js web application (landing + dashboard)
- `apps/api`: API Gateway + Lambda handlers
- `apps/workers`: SQS workers and scheduled jobs
- `packages/domain`: Shared types, schemas, plan entitlements
- `packages/connectors`: Vendor connectors (LinkedIn, Medium, etc.)
- `packages/utils`: Shared utilities
- `packages/infra`: Infrastructure as code (AWS CDK)

See [README.md](./README.md) for more details.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/AhmedYassinH/noteship/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Detailed description of the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots (if applicable)

### Suggesting Features

1. Check if the feature has already been suggested in [Issues](https://github.com/AhmedYassinH/noteship/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Detailed description of the feature
   - Use cases and benefits
   - Any potential drawbacks
   - Optional: mockups or examples

### Contributing Code

1. **Choose an issue**: Look for issues labeled `good first issue` or `help wanted`
2. **Comment on the issue**: Let others know you're working on it
3. **Follow the development setup**: See [Development Setup](#development-setup)
4. **Write tests**: Add tests for your changes
5. **Follow coding standards**: See [Coding Standards](#coding-standards)
6. **Submit a pull request**: See [Pull Request Process](#pull-request-process)

## Security

**Please do not report security vulnerabilities through public GitHub issues.**

See [SECURITY.md](./SECURITY.md) for details on how to report security vulnerabilities.

### Security Checklist for Contributors

- [ ] No hardcoded secrets, API keys, or credentials
- [ ] All sensitive data stored in environment variables
- [ ] Input validation and sanitization implemented
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Proper authentication and authorization checks
- [ ] Dependencies reviewed for known vulnerabilities

## Pull Request Process

### Before Submitting

1. **Update documentation**: Update relevant documentation for your changes
2. **Run tests**: Ensure all tests pass (`pnpm test`)
3. **Run linter**: Ensure code passes linting (`pnpm lint`)
4. **Format code**: Format your code (`pnpm format`)
5. **Build**: Ensure the project builds (`pnpm build`)
6. **Test manually**: Test your changes in the browser/application

### Submitting a Pull Request

1. **Create a pull request** against the `main` branch
2. **Provide a clear title**: Use conventional commit format (e.g., `feat: add user profile page`)
3. **Fill out the PR template**: Provide all requested information
4. **Link related issues**: Reference any related issues (e.g., `Closes #123`)
5. **Request review**: Request review from maintainers

### PR Review Process

- Maintainers will review your PR within a few days
- Address any feedback or requested changes
- Once approved, a maintainer will merge your PR

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add semantic search to notes
fix: resolve auth token expiration bug
docs: update deployment guide
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types; use proper type definitions
- Use interfaces for object shapes
- Use enums or const objects for constants

### Code Style

- Follow the existing code style
- Use Prettier for formatting (automatic with `pnpm format`)
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic

### Testing

- Write unit tests for new features
- Write integration tests for API endpoints
- Maintain or improve code coverage
- Test edge cases and error scenarios

### Documentation

- Update README.md if adding new features
- Update relevant documentation in `docs/`
- Add JSDoc comments for public APIs
- Keep comments up to date with code changes

### Git Workflow

1. Keep commits atomic (one logical change per commit)
2. Write clear, descriptive commit messages
3. Rebase your branch on `main` before submitting PR
4. Squash fixup commits before merging

## Architecture and Design

Before making significant changes:

1. Read the [System Architecture](./docs/technical/noteship-system-architecture.md)
2. Read the [Low-Level Design](./docs/technical/noteship-low-level-design.md)
3. Discuss major changes in an issue first
4. Update architecture docs if your changes affect them

## Environment Variables and Secrets

See [ENV-AND-SECRETS.md](./docs/contributing/ENV-AND-SECRETS.md) for guidelines on:

- Managing environment variables
- Handling secrets securely
- Local vs. production configuration

## Deployment

See [deployment.md](./docs/technical/deployment.md) for:

- CDK deployment commands
- Environment conventions
- Infrastructure setup

## Questions?

- Open an issue with the `question` label
- Reach out to the maintainer: me@ahmedyassin.dev

## License

By contributing to Noteship, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Noteship!** 🚀
