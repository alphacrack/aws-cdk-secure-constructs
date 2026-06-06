# Design Guidelines

These guidelines define how every construct and property injector in this
library must behave.

## 1. Secure by default

Every construct must, with zero configuration:

- Encrypt data at rest (SSE / KMS as appropriate to the service)
- Enforce encryption in transit (deny non-TLS where the service supports it)
- Block public access where the service supports it
- Disable ACL-based access in favor of resource owner enforcement
- Default to the `HIGH` security tier

## 2. Three-level control model

Each resource separates its properties into three levels:

1. **CIS-critical (immutable).** Security-critical settings live in
   `CIS_CRITICAL` and are applied **last** in both the construct and every
   property injector. They can never be overridden by users or injectors.
2. **Tier baseline.** Operational settings vary by `SecurityLevel`
   (`HIGH`/`MEDIUM`/`LOW`); the construct defaults to `HIGH`.
3. **Tighten-only injector.** `Tiered<Resource>Defaults` applies the chosen tier
   via field-level secure-max merges and re-asserts CIS-critical fields. The
   effective tier is `strictest(constructTier, injectorTier)` - an injector can
   only tighten, never loosen.

## 3. Compliance must be verified, not claimed

- Each resource exposes a CIS report (`<Resource>Compliance.report()`).
- Every `ENFORCED` control must be backed by a synthesis test that attempts to
  violate it and asserts the resulting template still complies.
- A claimed control without a passing test is a bug.

## 4. API stability and jsii compatibility

- Public API must be jsii-compatible: enums (not union types), interfaces that
  extend CDK props directly (no `Omit`/`Partial` in public types), no free
  functions/consts (use class statics), and no namespace re-exports.
- Preserve backwards compatibility; deprecate (do not delete) public symbols.
- `npm run api-diff` (jsii-diff) gates breaking changes in CI.

## 5. Testing and quality bar

- Write tests first (see the `add-secure-resource` skill).
- Maintain >= 80% coverage (statements, branches, functions, lines).
- `npm run build` (jsii) must pass with zero errors and warnings.
- `npm run lint` must pass with zero errors.

## Non-goals (for now)

- Runtime policy enforcement engines (cdk-nag / Aspects) are not yet bundled;
  injectors set strong defaults but are not a hard guarantee against an L1
  `Cfn*` resource. Runtime enforcement is on the roadmap.
