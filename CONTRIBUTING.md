# Contributing to AWS CDK Secure Constructs

Thank you for your interest in contributing to AWS CDK Secure Constructs! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

We welcome contributions from the community! Here are the main ways you can contribute:

### 🐛 Reporting Bugs

- Use the [GitHub issue tracker](https://github.com/yourusername/aws-cdk-secure-constructs/issues)
- Include a clear and descriptive title
- Provide detailed steps to reproduce the issue
- Include error messages and stack traces
- Specify your environment (OS, Node.js version, CDK version)

### 💡 Suggesting Enhancements

- Use the [GitHub issue tracker](https://github.com/yourusername/aws-cdk-secure-constructs/issues)
- Clearly describe the enhancement and its benefits
- Provide use cases and examples
- Consider security implications

### 🔧 Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation
4. **Test your changes**
   ```bash
   npm install
   npm run build
   npm test
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add new secure construct for X"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

## 📋 Development Setup

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Git
- AWS CDK CLI (optional, for testing deployments)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aws-cdk-secure-constructs.git
   cd aws-cdk-secure-constructs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup pre-commit hooks**
   ```bash
   npm run prepare
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
aws-cdk-secure-constructs/
├── src/                    # Source code
│   ├── constructs/         # CDK constructs
│   ├── blueprints/         # CDK Blueprints property injectors
│   └── index.ts           # Main export file
├── test/                  # Test files
├── docs/                  # Documentation
├── examples/              # Usage examples
└── .github/              # GitHub configuration
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow strict TypeScript configuration
- Use meaningful type names
- Avoid `any` type - use proper typing

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use trailing commas in objects and arrays
- Maximum line length: 100 characters

### Naming Conventions

- Use PascalCase for classes and interfaces
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names

### Comments and Documentation

- Use JSDoc comments for public APIs
- Include examples in documentation
- Keep comments up-to-date with code changes

## 🧪 Testing

### Test Requirements

- All new features must include tests
- Maintain at least 80% code coverage
- Include unit tests and integration tests
- Test both success and failure scenarios

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="SecureBucket"
```

### Test Structure

- Place tests in the `test/` directory
- Name test files with `.test.ts` extension
- Use descriptive test names
- Group related tests with `describe` blocks

## 🔒 Security Guidelines

### Security Requirements

- All constructs must implement security best practices by default
- Follow AWS security recommendations
- Include security documentation
- Consider compliance requirements (SOC2, HIPAA, etc.)

### Security Review

- All contributions will be reviewed for security implications
- Security-related changes require additional review
- Report security vulnerabilities privately to maintainers

## 📚 Documentation

### Documentation Requirements

- All public APIs must be documented
- Include usage examples
- Document security features and configurations
- Keep documentation up-to-date with code changes

### Documentation Structure

- API documentation in JSDoc comments
- README files for each construct
- Examples in the `examples/` directory
- Security guidelines in `docs/SECURITY.md`

## 🔄 Pull Request Process

### PR Requirements

1. **Clear description** of changes
2. **Tests included** for new functionality
3. **Documentation updated** if needed
4. **All CI checks passing**
5. **Security review** for sensitive changes

### PR Review Process

1. **Automated checks** (linting, tests, formatting)
2. **Code review** by maintainers
3. **Security review** if applicable
4. **Documentation review**
5. **Final approval** and merge

### Commit Message Format

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

## 🏷️ Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 🆘 Getting Help

- **Documentation**: Check the [README](./README.md) and [docs](./docs/) directory
- **Issues**: Use [GitHub issues](https://github.com/yourusername/aws-cdk-secure-constructs/issues)
- **Discussions**: Use [GitHub discussions](https://github.com/yourusername/aws-cdk-secure-constructs/discussions)

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors list

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AWS CDK Secure Constructs! 🚀 