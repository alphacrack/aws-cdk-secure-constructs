# AWS CDK Secure Constructs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![CDK](https://img.shields.io/badge/CDK-2.96.0-orange.svg)](https://aws.amazon.com/cdk/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Nx](https://img.shields.io/badge/Nx-Monorepo-purple.svg)](https://nx.dev/)

A professional collection of AWS CDK constructs with security best practices, built using the latest [CDK Blueprints](https://docs.aws.amazon.com/cdk/v2/guide/blueprints.html) methodology. This project provides secure, production-ready infrastructure components that enforce organizational standards and compliance requirements.

## 🚀 Features

- **Security-First Design**: All constructs implement security best practices by default
- **CDK Blueprints Integration**: Uses property injection for consistent configuration across your organization
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **Production Ready**: Battle-tested constructs used in production environments
- **Comprehensive Testing**: Extensive test coverage with Jest
- **CI/CD Ready**: GitHub Actions workflows for automated testing and deployment
- **Documentation**: Detailed documentation and examples for each construct
- **Nx Monorepo**: Built with Nx for efficient builds, caching, and affected-based workflows
- **Advanced Pre-commit Hooks**: Comprehensive linting and testing automation

## 📦 Current Constructs

### S3 Secure Bucket
A secure S3 bucket construct that enforces:
- Server-side encryption (SSE-S3 or SSE-KMS)
- Block public access (enabled by default)
- SSL enforcement
- Versioning
- Access logging
- Lifecycle policies
- Proper IAM permissions

## 🛠️ Installation

```bash
npm install aws-cdk-secure-constructs
```

## 📖 Usage

### Basic S3 Secure Bucket

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { SecureBucket } from 'aws-cdk-secure-constructs';

const app = new App();
const stack = new Stack(app, 'MySecureStack');

// Create a secure S3 bucket with default security settings
const secureBucket = new SecureBucket(stack, 'MySecureBucket', {
  bucketName: 'my-secure-bucket-name',
  // Optional: Override defaults if needed
  versioned: true,
  lifecycleRules: [
    {
      id: 'transition-to-ia',
      transitions: [
        {
          storageClass: 'STANDARD_IA',
          transitionAfter: Duration.days(30),
        },
      ],
    },
  ],
});
```

### Using CDK Blueprints

```typescript
import { App, Stack, PropertyInjectors } from 'aws-cdk-lib';
import { SecureBucketDefaults } from 'aws-cdk-secure-constructs';

const app = new App();

// Attach secure defaults to all S3 buckets in this app
PropertyInjectors.of(app).add(new SecureBucketDefaults());

const stack = new Stack(app, 'MyStack');

// This bucket automatically gets secure defaults
const bucket = new Bucket(stack, 'MyBucket');
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development

### Prerequisites

- Node.js 18 or later
- AWS CDK CLI
- AWS credentials configured

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### Pre-commit Hooks

This project uses Husky and lint-staged for pre-commit hooks. They will automatically:
- Run ESLint on staged TypeScript files
- Format code with Prettier
- Run tests

## 🏗️ Nx Monorepo Setup

This project is configured as an Nx monorepo for efficient development and CI/CD workflows.

### Nx Features

- **Smart Caching**: Builds, tests, and linting are cached for faster subsequent runs
- **Affected-based Execution**: Only runs tasks on projects that have changed
- **Parallel Execution**: Runs tasks in parallel when possible
- **Dependency Graph**: Visual representation of project dependencies

### Nx Commands

```bash
# Build the project
nx build

# Run tests
nx test

# Run linting
nx lint

# Format code
nx format

# Check formatting
nx format:check

# View dependency graph
nx graph

# View affected projects
nx affected:graph

# Run tasks only on affected projects
nx affected:build
nx affected:test
nx affected:lint

# Reset Nx cache
nx reset
```

### Advanced Pre-commit Hooks

The project includes comprehensive pre-commit hooks that:

1. **Conventional Commits**: Enforces conventional commit message format
2. **Linting**: Runs ESLint on staged TypeScript files
3. **Formatting**: Formats code with Prettier
4. **Testing**: Runs tests on affected files
5. **Build Verification**: Ensures the project builds successfully

#### Pre-commit Hook Features

- **Smart File Detection**: Only processes relevant files (TypeScript, JSON, Markdown)
- **Error Handling**: Provides clear error messages with color-coded output
- **Performance Optimization**: Uses Nx caching for faster execution
- **Conventional Commits**: Enforces commit message standards

#### Commit Message Format

All commits must follow the conventional commit format:

```
type(scope): description
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commits

**Examples:**
```bash
feat(secure-bucket): add encryption by default
fix: resolve TypeScript compilation error
docs: update README with usage examples
test: add unit tests for security levels
```

### CI/CD with Nx

The GitHub Actions workflow leverages Nx for efficient CI/CD:

- **Affected-based Testing**: Only tests projects that have changed
- **Parallel Execution**: Runs jobs in parallel when possible
- **Caching**: Uses Nx cache for faster builds
- **Artifact Management**: Efficiently manages build artifacts

## 📚 Documentation

- [API Reference](./docs/API.md)
- [Security Best Practices](./docs/SECURITY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://github.com/yourusername/aws-cdk-secure-constructs#readme)
- 🐛 [Bug Reports](https://github.com/yourusername/aws-cdk-secure-constructs/issues)
- 💡 [Feature Requests](https://github.com/yourusername/aws-cdk-secure-constructs/issues)
- 💬 [Discussions](https://github.com/yourusername/aws-cdk-secure-constructs/discussions)

## 🙏 Acknowledgments

- AWS CDK team for the excellent framework
- The open-source community for inspiration and feedback
- Contributors who help improve this project

---

**Note**: This project follows the [AWS CDK Blueprints](https://docs.aws.amazon.com/cdk/v2/guide/blueprints.html) methodology for property injection and organizational standards enforcement. 