import { ComplianceRegistry } from '../../src';
import { S3BucketCompliance } from '../../src/resources/s3-bucket/compliance';

describe('ComplianceRegistry', () => {
  it('returns a report for every exposed resource', () => {
    const reports = ComplianceRegistry.all();

    expect(Array.isArray(reports)).toBe(true);
    expect(reports.length).toBeGreaterThanOrEqual(1);
  });

  it('stays in sync with the S3 compliance report', () => {
    const reports = ComplianceRegistry.all();
    const s3Report = S3BucketCompliance.report();

    expect(reports).toContainEqual(s3Report);
  });

  it('every report entry has a resource, version, and non-empty controls', () => {
    for (const report of ComplianceRegistry.all()) {
      expect(report.resourceType).toBeTruthy();
      expect(report.version).toBeTruthy();
      expect(Array.isArray(report.controls)).toBe(true);
      expect(report.controls.length).toBeGreaterThan(0);
      for (const control of report.controls) {
        expect(control.id).toBeTruthy();
        expect(control.title).toBeTruthy();
        expect(control.status).toBeTruthy();
        expect(control.enforcedBy).toBeTruthy();
      }
    }
  });
});
