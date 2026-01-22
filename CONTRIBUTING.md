# Contributing to PlannerAPI

Thank you for your interest in contributing to PlannerAPI! This document provides guidelines and instructions for contributing to the project.

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

---

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/PlannerAPI.git
cd PlannerAPI

# Add upstream remote for staying in sync
git remote add upstream https://github.com/nycsav/PlannerAPI.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Configure environment (see ENVIRONMENT_SETUP.md)
cp .env.example .env
cp functions/.env.example functions/.env
# Edit .env files with your credentials

# Start development server
npm run dev
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/description` - New feature
- `fix/description` - Bug fix
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### 2. Make Changes

- Keep commits small and focused
- Follow code style guidelines (see below)
- Add tests for new features
- Update documentation as needed
- Test your changes locally

### 3. Commit Changes

```bash
git add .
git commit -m "feat: add new feature

- Description of what changed
- Why it was changed
- Any breaking changes (if applicable)"
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `style:` Code style changes (formatting, missing semicolons)
- `refactor:` Code refactoring without feature change
- `test:` Test updates or new tests
- `chore:` Build, dependency, or tooling changes
- `perf:` Performance improvements

**Examples:**

```
feat(daily-intel): add card deduplication logic

- Implement source URL deduplication
- Add title similarity checking
- Prevent duplicate cards from being stored

Fixes #123
```

```
fix(error-boundary): catch async errors in useEffect

- Add error boundary for async operations
- Improve error message clarity
```

### 4. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# Fill out the PR template with description of changes
```

---

## Code Standards

### TypeScript

- Use strict TypeScript mode
- Add proper type annotations
- Avoid `any` type unless absolutely necessary
- Use interfaces for component props

```typescript
// Good
interface CardProps {
  title: string;
  description: string;
  onClick: (id: string) => void;
}

// Avoid
const Card = (props: any) => { ... }
```

### React Components

- Functional components with hooks
- Extract complex logic to custom hooks
- Memoize expensive operations with `useMemo` and `useCallback`
- Keep components focused and reusable

```typescript
// Good
export const Card: React.FC<CardProps> = ({ title, onClick }) => {
  return <div onClick={() => onClick(title)}>{title}</div>;
};

// Avoid class components unless necessary
```

### Styling

- Use Tailwind CSS utility classes
- Follow existing design system (see DESIGN-SYSTEM.md)
- Avoid inline styles
- Use CSS modules only for complex styling

```typescript
// Good
<div className="p-4 bg-bureau-bg rounded-lg hover:bg-bureau-slate/10">
  Content
</div>

// Avoid
<div style={{ padding: '16px', backgroundColor: '#fff' }}>
  Content
</div>
```

### API Integration

- Use centralized endpoints: `import { ENDPOINTS, fetchWithTimeout } from '../config/api'`
- Always include timeout protection
- Handle errors gracefully
- Log meaningful error messages

```typescript
// Good
import { ENDPOINTS, fetchWithTimeout } from '../config/api';

const response = await fetchWithTimeout(ENDPOINTS.chatIntel, {
  method: 'POST',
  body: JSON.stringify({ query, audience }),
  timeout: 30000,
});

// Avoid
const response = await fetch('https://hardcoded-url.com/endpoint', {...});
```

### Comments

- Add comments for complex logic
- Explain WHY, not WHAT (code shows what)
- Use JSDoc for functions and components

```typescript
// Good
/**
 * Deduplicates cards by checking source URL and title similarity
 * to prevent displaying redundant information
 */
function deduplicateCards(cards: Card[]): Card[] {
  // Implementation
}

// Avoid
// Loop through cards
cards.forEach(...);
```

---

## Testing

### Manual Testing

Before submitting PR:
- Test on Chrome and Safari
- Test on mobile (iPhone)
- Test responsive design
- Verify no console errors
- Check analytics events tracked

### Unit Tests (if applicable)

```bash
npm run test
```

### Feature Testing

See [TESTING-CHECKLIST.md](docs/../TESTING-CHECKLIST.md) for comprehensive test scenarios.

---

## Pull Request Guidelines

### Before Submitting

- [ ] Branch is up to date with `main`
- [ ] All tests passing
- [ ] No console warnings/errors
- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings generated
```

---

## Documentation

### Update These When Relevant

- **README.md** - For major features
- **docs/** - For technical changes
- **DESIGN-SYSTEM.md** - For UI changes
- **API_ENDPOINTS.md** - For API changes
- **Code comments** - For complex logic

### Documentation Standards

- Keep language clear and concise
- Use examples for clarity
- Include code snippets where relevant
- Link to related documentation
- Update table of contents if adding sections

---

## Editorial Guidelines (Daily Intelligence)

If modifying intelligence generation:
- Review [DAILY_INTEL_FRAMEWORK.md](docs/DAILY_INTEL_FRAMEWORK.md)
- Follow [EDITORIAL_VOICE.md](docs/EDITORIAL_VOICE.md)
- Maintain content quality standards
- Test with multiple audience types

---

## Reporting Bugs

### Before Creating Issue

- Check if issue already exists
- Reproduce the bug consistently
- Note your environment (OS, browser, Node version)
- Gather error messages and logs

### Issue Template

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Expected behavior
4. Actual behavior

## Environment
- OS: macOS/Windows/Linux
- Browser: Chrome/Safari/Firefox
- Node version: 20.x
- PlannerAPI version: 1.0.0

## Logs
```
Error message or console output
```

## Workaround (if any)
How to work around the issue until fixed
```

---

## Feature Requests

### Suggest Enhancements

1. Check [FUTURE_IDEAS.md](docs/FUTURE_IDEAS.md) first
2. Provide clear use case
3. Include examples of similar features
4. Explain expected behavior

---

## Code Review Process

### What Reviewers Look For

- ✅ Code quality and style
- ✅ Test coverage
- ✅ Documentation
- ✅ Performance implications
- ✅ Security considerations
- ✅ Backward compatibility

### Responding to Review Feedback

- Be open to suggestions
- Ask clarifying questions
- Address all feedback
- Request re-review when complete
- Thank reviewers for their time

---

## Release Process

### Version Numbers

Follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH` (e.g., 1.0.0)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Checklist

- [ ] All PRs merged and tested
- [ ] Version number updated
- [ ] CHANGELOG.md updated
- [ ] README.md updated if needed
- [ ] Documentation complete
- [ ] Create GitHub release with notes

---

## Questions & Support

- Ask questions in GitHub Discussions (if available)
- Review existing documentation first
- Check similar open/closed issues
- Reach out to maintainers if blocked

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License (same as PlannerAPI).

---

## Thank You!

Your contributions help make PlannerAPI better for everyone. We appreciate your time and effort!
