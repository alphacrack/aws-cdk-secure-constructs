/**
 * Status of a single compliance control for a resource.
 */
export enum ControlStatus {
  /** Locked by the construct/injector and not overridable. */
  ENFORCED = 'enforced',
  /** Applied as a tier default but configurable within secure bounds. */
  CONFIGURABLE = 'configurable',
  /** Not applicable to this resource. */
  NOT_APPLICABLE = 'not-applicable',
}

/**
 * A single compliance control mapping (e.g. a CIS benchmark line item) and how
 * this library satisfies it.
 */
export interface ComplianceControl {
  /** Stable control identifier, e.g. `CIS-AWS-2.1.1`. */
  readonly id: string;
  /** Human-readable control title. */
  readonly title: string;
  /** How the control is handled by this library. */
  readonly status: ControlStatus;
  /** The property/feature that satisfies the control, e.g. `encryption=S3_MANAGED`. */
  readonly enforcedBy: string;
}

/**
 * A compliance report for a single resource type.
 *
 * Every {@link ControlStatus.ENFORCED} control is expected to be backed by a
 * synthesis test so the report cannot drift from actual behavior.
 */
export interface ComplianceReport {
  /** CloudFormation resource type the report describes, e.g. `AWS::S3::Bucket`. */
  readonly resourceType: string;
  /** Compliance framework name, e.g. `CIS AWS Foundations Benchmark`. */
  readonly framework: string;
  /** Framework version, e.g. `v3.0.0`. */
  readonly version: string;
  /** The controls covered by this resource. */
  readonly controls: ComplianceControl[];
}
