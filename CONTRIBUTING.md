# Contributing to TaskForge

Thank you for your interest in contributing to TaskForge! This guide will help you get started.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Set up the development environment** following the [README](README.md#getting-started)
3. **Create a branch** for your changes: `git checkout -b feature/your-feature-name`

## Development Workflow

1. Make your changes in a feature branch
2. Write or update tests if applicable
3. Ensure the code builds without errors:
   ```bash
   cd frontend && npm run build
   cd backend && npm run build
   ```
4. Commit your changes with a clear, descriptive message
5. Push to your fork and open a pull request

## Pull Request Guidelines

- Keep PRs focused on a single change
- Provide a clear description of what changed and why
- Link any related issues (e.g., "Closes #12")
- Include screenshots for UI changes
- Make sure CI checks pass

## Code Style

- **Frontend**: TypeScript, React functional components, Tailwind CSS for styling
- **Backend**: TypeScript, NestJS module structure, TypeORM for database
- Use meaningful variable and function names
- Follow the existing patterns in the codebase

## Reporting Bugs

Use the [bug report template](https://github.com/engmaryamameen/TaskForge/issues/new?template=bug_report.md) and include:

- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information

## Suggesting Features

Use the [feature request template](https://github.com/engmaryamameen/TaskForge/issues/new?template=feature_request.md) and describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## Good First Issues

Look for issues labeled [`good first issue`](https://github.com/engmaryamameen/TaskForge/labels/good%20first%20issue) — these are great starting points for new contributors.

## Questions?

Open a [GitHub Discussion](https://github.com/engmaryamameen/TaskForge/discussions) if you have questions or want to discuss an idea before implementing it.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
