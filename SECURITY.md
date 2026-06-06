# Security Policy

## Supported versions

Security fixes are provided for the latest published minor release line.

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |
| < 1.0   | ❌        |

## Reporting a vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

Report vulnerabilities privately through GitHub Security Advisories:

1. Go to the repository's **Security** tab.
2. Click **Report a vulnerability** (Private vulnerability reporting).
3. Provide a description, affected versions, reproduction steps, and impact.

If you cannot use GitHub Security Advisories, open a minimal issue asking a
maintainer to contact you privately — without disclosing the vulnerability.

## What to expect

- **Acknowledgement:** within 5 business days.
- **Assessment & triage:** we validate the report and determine severity.
- **Fix & disclosure:** we aim to release a fix and publish a coordinated
  advisory promptly; we will credit reporters who wish to be acknowledged.

## Scope

This policy covers the code published by this library (the constructs and
property injectors under `src/`). Issues in `aws-cdk-lib`, `constructs`, or
other upstream dependencies should be reported to their respective projects.

For documentation of the library's built-in security features and compliance
posture, see [docs/SECURITY.md](docs/SECURITY.md).
