# Local consumer example

This is a minimal CDK app that imports `aws-cdk-secure-constructs` as an **installed npm package** (not from `../src`). It is used to verify the publishable tarball before release.

## Manual usage

After building and packing the library at the repo root:

```bash
# From repo root
npm run build
npm pack

# Install into this app (adjust tarball name/version)
cd examples/local-consumer
npm install
npm install ../../aws-cdk-secure-constructs-*.tgz
npx cdk synth
```

## Automated usage

From the repo root:

```bash
npm run test:local-build
```

This builds, packs, installs the tarball here, and runs `cdk synth`.
