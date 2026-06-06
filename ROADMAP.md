# Roadmap

This roadmap is indicative, not a commitment. Each new resource follows the
established pattern (see [.cursor/skills/add-secure-resource](.cursor/skills/add-secure-resource/SKILL.md)
and [docs/DESIGN.md](docs/DESIGN.md)).

## Near term

- [ ] `SecureQueue` (SQS) - KMS encryption + SSL enforced, tier-variable retention
- [ ] `SecureTable` (DynamoDB) - encryption + PITR, tier-variable backup posture
- [ ] `SecureFunction` (Lambda) - tracing, least-privilege defaults

## Mid term

- [ ] `SecureVpc` networking defaults (flow logs, no default SG egress)
- [ ] Additional CIS controls per resource, each with verified-compliance tests
- [ ] Optional `cdk-nag` integration for runtime enforcement (Aspects), complementing the property-injector defaults

## Ongoing

- [ ] Keep `aws-cdk-lib` peer floor and CIS reports current
- [ ] Multi-language packages (Python/Java/.NET) via jsii-pacmak
- [ ] Expand examples and API docs

Have a request? Open a [feature request](https://github.com/alphacrack/aws-cdk-secure-constructs/issues/new?template=feature-request.yml).
