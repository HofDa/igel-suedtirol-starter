import {describe, expect, it} from 'vitest';
import {createDefaultReportValues} from './defaults';
import {reportSchema, type ReportFormValues} from './schema';

function createValidReport(): ReportFormValues {
  const values = createDefaultReportValues('de');
  values.observationType = 'alive';
  values.scientificUseConsent = true;
  return values;
}

describe('reportSchema', () => {
  it('accepts a complete report', () => {
    expect(reportSchema.safeParse(createValidReport()).success).toBe(true);
  });

  it('rejects a report without an explicit observation type', () => {
    const values = createValidReport();
    values.observationType = undefined as unknown as ReportFormValues['observationType'];
    expect(reportSchema.safeParse(values).success).toBe(false);
  });

  it('rejects missing scientific consent', () => {
    const values = createValidReport();
    values.scientificUseConsent = false;
    expect(reportSchema.safeParse(values).success).toBe(false);
  });

  it('rejects coordinates outside the project region bounds', () => {
    const values = createValidReport();
    values.latitude = 0;
    expect(reportSchema.safeParse(values).success).toBe(false);
  });
});
