import {describe, expect, it} from 'vitest';
import {createDefaultReportValues} from './defaults';
import {reportSchema, type ReportSubmission} from './schema';

function createValidReport(): ReportSubmission {
  return reportSchema.parse({
    ...createDefaultReportValues('de'),
    observationType: 'alive',
    latitude: 46.5,
    longitude: 11.35,
    scientificUseConsent: true
  });
}

describe('reportSchema', () => {
  it('accepts a complete report', () => {
    expect(reportSchema.safeParse(createValidReport()).success).toBe(true);
  });

  it('rejects a report without an explicit observation type', () => {
    const values = {...createValidReport(), observationType: undefined};
    expect(reportSchema.safeParse(values).success).toBe(false);
  });

  it('rejects missing scientific consent', () => {
    const values = createValidReport();
    values.scientificUseConsent = false;
    expect(reportSchema.safeParse(values).success).toBe(false);
  });

  it('rejects a report without a chosen position', () => {
    const values = {...createValidReport(), latitude: undefined, longitude: undefined};
    expect(reportSchema.safeParse(values).success).toBe(false);
  });

  it('rejects coordinates outside the project region bounds', () => {
    const values = createValidReport();
    values.latitude = 0;
    expect(reportSchema.safeParse(values).success).toBe(false);
  });

  it('rejects malformed and nonexistent local observation times', () => {
    expect(reportSchema.safeParse({...createValidReport(), observedDate: 'not-a-date'}).success).toBe(false);
    expect(reportSchema.safeParse({...createValidReport(), observedDate: '2026-03-29', observedTime: '02:30'}).success).toBe(false);
  });

  it('requires contact consent before accepting personal contact data', () => {
    const values = {...createValidReport(), reporterEmail: 'reporter@example.test', contactConsent: false};
    expect(reportSchema.safeParse(values).success).toBe(false);
  });
});
