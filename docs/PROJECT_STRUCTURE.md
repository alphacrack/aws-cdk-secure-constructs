# Project Structure

This document explains the organization and structure of the AWS CDK Secure Constructs project.

## 📁 Directory Structure

```
aws-cdk-secure-constructs/
├── .github/                    # GitHub configuration
│   ├── workflows/             # GitHub Actions CI/CD workflows
│   │   ├── ci.yml            # Continuous integration workflow
│   │   └── release.yml       # Release automation workflow
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   │   ├── bug_report.md     # Bug report template
│   │   └── feature_request.md # Feature request template
│   └── pull_request_template.md # PR template
├── .husky/                    # Git hooks configuration
│   └── pre-commit           # Pre-commit hook
├── docs/                      # Documentation
│   ├── API.md               # API reference documentation
│   ├── SECURITY.md          # Security documentation
│   └── PROJECT_STRUCTURE.md # This file
├── examples/                  # Usage examples
│   ├── basic-usage.ts       # Basic SecureBucket usage
│   └── blueprints-usage.ts  # CDK Blueprints examples
├── src/                       # Source code
│   ├── constructs/          # CDK constructs
│   │   └── secure-bucket.ts # SecureBucket construct
│   ├── blueprints/          # CDK Blueprints property injectors
│   │   └── secure-bucket-defaults.ts # Property injectors
│   └── index.ts             # Main export file
├── test/                      # Test files
│   ├── setup.ts             # Test setup configuration
│   ├── constructs/          # Construct tests
│   │   └── secure-bucket.test.ts
│   └── blueprints/          # Blueprint tests
│       └── secure-bucket-defaults.test.ts
├── .eslintrc.js              # ESLint configuration
├── .gitignore                # Git ignore rules
├── .prettierrc               # Prettier configuration
├── CHANGELOG.md              # Version history
├── CONTRIBUTING.md           # Contribution guidelines
├── jest.config.js            # Jest test configuration
├── LICENSE                   # MIT license
├── package.json              # NPM package configuration
├── README.md                 # Project documentation
└── tsconfig.json             # TypeScript configuration
```

## 🏗️ Architecture Overview

### Core Components

#### 1. Constructs (`src/constructs/`)
Contains the main CDK constructs that provide secure infrastructure components.

- **SecureBucket**: A secure S3 bucket construct with security best practices
- Future constructs will be added here (SecureLambda, SecureRDS, etc.)

#### 2. Blueprints (`src/blueprints/`)
Contains CDK Blueprints property injectors for organizational standards.

- **SecureBucketDefaults**: Applies secure defaults to S3 buckets
- **StrictSecureBucketDefaults**: Enforces strict security settings

#### 3. Tests (`test/`)
Comprehensive test suite for all components.

- **Unit Tests**: Test individual construct functionality
- **Integration Tests**: Test construct interactions
- **Blueprint Tests**: Test property injection behavior

### Configuration Files

#### Development Tools
- **TypeScript**: `tsconfig.json` - Strict TypeScript configuration
- **ESLint**: `.eslintrc.js` - Code quality and security rules
- **Prettier**: `.prettierrc` - Code formatting standards
- **Jest**: `jest.config.js` - Testing framework configuration

#### Git & CI/CD
- **Husky**: `.husky/` - Git hooks for pre-commit checks
- **GitHub Actions**: `.github/workflows/` - Automated CI/CD pipelines
- **Issue Templates**: `.github/ISSUE_TEMPLATE/` - Standardized issue reporting

#### Documentation
- **README.md**: Main project documentation
- **API.md**: Comprehensive API reference
- **SECURITY.md**: Security features and best practices
- **CONTRIBUTING.md**: Contribution guidelines

## 📦 Package Structure

### Main Exports (`src/index.ts`)

```typescript
// Constructs
export * from './constructs/secure-bucket';

// Blueprints
export * from './blueprints/secure-bucket-defaults';

// Re-exports for convenience
export type { Construct } from 'constructs';
export type { Stack } from 'aws-cdk-lib';
```

### NPM Package Configuration

The `package.json` includes:

- **Main Entry**: `lib/index.js` - Compiled JavaScript
- **Type Definitions**: `lib/index.d.ts` - TypeScript definitions
- **Scripts**: Build, test, lint, and deployment commands
- **Dependencies**: AWS CDK and TypeScript dependencies
- **Dev Dependencies**: Testing, linting, and development tools

## 🔧 Development Workflow

### Local Development

1. **Setup**: `npm install` - Install dependencies
2. **Development**: `npm run watch` - Watch mode for development
3. **Testing**: `npm test` - Run test suite
4. **Linting**: `npm run lint` - Check code quality
5. **Building**: `npm run build` - Compile TypeScript

### Pre-commit Hooks

Automated checks run before each commit:

- **Linting**: ESLint with security-focused rules
- **Formatting**: Prettier code formatting
- **Tests**: Unit test execution

### CI/CD Pipeline

GitHub Actions workflows:

1. **CI Workflow**: Runs on push/PR to main/develop
   - Multi-node testing (18.x, 20.x)
   - Linting and formatting checks
   - Test execution with coverage
   - Security scanning
   - CDK synthesis validation

2. **Release Workflow**: Runs on version tags
   - Automated npm publishing
   - GitHub release creation
   - Documentation updates

## 🧪 Testing Strategy

### Test Organization

```
test/
├── setup.ts                    # Global test configuration
├── constructs/                 # Construct tests
│   └── secure-bucket.test.ts  # SecureBucket tests
└── blueprints/                # Blueprint tests
    └── secure-bucket-defaults.test.ts
```

### Test Types

1. **Unit Tests**: Test individual construct functionality
2. **Integration Tests**: Test construct interactions
3. **Property Injection Tests**: Test CDK Blueprints behavior
4. **Security Tests**: Validate security configurations

### Test Coverage

- **Target**: 80% minimum coverage
- **Tools**: Jest with coverage reporting
- **Reports**: HTML, LCOV, and text coverage reports

## 📚 Documentation Strategy

### Documentation Types

1. **User Documentation**: README, examples, API reference
2. **Developer Documentation**: Contributing guidelines, project structure
3. **Security Documentation**: Security features, compliance, best practices
4. **API Documentation**: Comprehensive API reference with examples

### Documentation Maintenance

- **Automated**: Documentation generation from code comments
- **Manual**: Security and compliance documentation
- **Examples**: Real-world usage examples
- **Migration**: Guides for upgrading and migrating

## 🔒 Security Architecture

### Security Layers

1. **Construct Level**: Built-in security features
2. **Blueprint Level**: Organizational security standards
3. **Application Level**: CDK application security
4. **Infrastructure Level**: AWS security best practices

### Security Features

- **Encryption**: Server-side encryption by default
- **Access Control**: Block public access, IAM integration
- **Monitoring**: Access logging, CloudTrail integration
- **Compliance**: SOC2, GDPR, HIPAA support

## 🚀 Deployment Strategy

### Package Publishing

1. **Version Management**: Semantic versioning
2. **Automated Publishing**: GitHub Actions workflow
3. **Quality Gates**: Tests, linting, security scans
4. **Documentation**: Automated documentation updates

### Release Process

1. **Development**: Feature development in feature branches
2. **Testing**: Comprehensive testing in CI/CD
3. **Review**: Code review and security review
4. **Release**: Automated release on version tags
5. **Documentation**: Updated documentation and changelog

## 🔄 Maintenance

### Regular Tasks

- **Dependency Updates**: Weekly security updates
- **Security Reviews**: Monthly security assessments
- **Documentation Updates**: Quarterly documentation reviews
- **Performance Monitoring**: Continuous performance monitoring

### Quality Assurance

- **Code Quality**: Automated linting and formatting
- **Test Coverage**: Maintain 80%+ test coverage
- **Security Scanning**: Regular security vulnerability scans
- **Compliance**: Regular compliance assessments

---

This project structure ensures maintainability, security, and scalability while providing a professional foundation for open-source development. 