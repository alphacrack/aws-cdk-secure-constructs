# Contributing

Thanks for contributing. Issues and PRs welcome.

## Setup

```bash
git clone https://github.com/alphacrack/aws-cdk-secure-constructs.git
cd aws-cdk-secure-constructs
npm install
npm run prepare    # husky hooks
npm run build
npm test
```

Requires Node.js 18+ and `aws-cdk-lib` >= 2.196.0 (property injectors).

## Project layout

```
src/
  core/                 # SecurityLevel, compliance types
  resources/s3-bucket/  # construct, blueprints, compliance report
  index.ts
test/                   # mirrors src/
examples/               # usage samples + local-consumer (tarball test)
scripts/                # test-local-build.sh, release.sh
```

Adding a new resource? See [.cursor/skills/add-secure-resource/SKILL.md](.cursor/skills/add-secure-resource/SKILL.md).

## Before you open a PR

1. Add or update tests (including compliance tests for new enforced controls).
2. Run:

   ```bash
   npm run lint
   npm test
   npm run build
   npm run test:local-build   # if exports or packaging changed
   ```

3. Update [docs/API.md](docs/API.md) when the public API changes.
4. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit and PR titles (`feat(s3-bucket): ...`).

## Releasing (maintainers)

From a clean `main` branch:

```bash
npm run release -- patch   # or minor | major
```

This runs quality gates, bumps version, tags `vX.Y.Z`, and pushes. [.github/workflows/release.yml](.github/workflows/release.yml) publishes to npm (needs `NPM_TOKEN`).

See also [.cursor/skills/publish-local-build/SKILL.md](.cursor/skills/publish-local-build/SKILL.md).

## Security issues

Do not open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).

## License

Contributions are licensed under the MIT License.
