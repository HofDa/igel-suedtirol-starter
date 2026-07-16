import {describe, expect, it} from 'vitest';
import {createDefaultReportValues} from './defaults';
import {reportSchema} from './schema';

describe('reportSchema', () => {
  it('accepts a complete report', () => {
    const values = createDefaultReportValues('de');
    values.scientificUseConsent = true;
    expect(reportSchema.safeParse(values).success).toBe(true);
  });

  it('rejects missing scientific consent', () => {
    const values = createDefaultReportValues('de');
    expect(reportSchema.safeParse(values).success).toBe(false);
  });

  it('rejects coordinates outside the project region bounds', () => {
    const values = createDefaultReportValues('de');
    values.scientificUseConsent = true;
    values.latitude = 0;
    expect(reportSchema.safeParse(values).success).toBe(false);
  });
});
