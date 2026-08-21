import {describe, expect, it} from 'vitest';
import {createDefaultReportValues} from './defaults';
import {reportSchema, requiresSosNotice} from './schema';

function validReport(overrides: Record<string, unknown> = {}) {
  return {
    ...createDefaultReportValues('de'),
    observationType: 'alive', municipality: 'bozen', latitude: 46.5, longitude: 11.35,
    observedDate: '2026-07-16', observedTimeFrom: '20:30', observedTimeTo: '', timeAccuracy: 'exact',
    reporterFirstName: 'Ada', reporterLastName: 'Test', reporterEmail: 'ada@example.test',
    scientificUseConsent: true, privacyNoticeConsent: true,
    ...overrides
  };
}

describe('reportSchema', () => {
  it('starts a new report with an empty observation date', () => {
    expect(createDefaultReportValues('de').observedDate).toBe('');
  });

  it('accepts a complete report', () => expect(reportSchema.safeParse(validReport()).success).toBe(true));
  it('rejects a future observation date', () => expect(reportSchema.safeParse(validReport({observedDate: '2999-01-01'})).success).toBe(false));

  it('validates a complete time range', () => {
    expect(reportSchema.safeParse(validReport({timeAccuracy: 'range', observedTimeFrom: '20:00', observedTimeTo: '21:00'})).success).toBe(true);
  });

  it('keeps both time fields empty when the time is unknown', () => {
    expect(reportSchema.safeParse(validReport({timeAccuracy: 'date_only', observedTimeFrom: '', observedTimeTo: ''})).success).toBe(true);
    expect(reportSchema.safeParse(validReport({timeAccuracy: 'date_only', observedTimeFrom: '20:00'})).success).toBe(false);
  });

  it('rejects an end time before the start time', () => {
    expect(reportSchema.safeParse(validReport({timeAccuracy: 'range', observedTimeFrom: '21:00', observedTimeTo: '20:00'})).success).toBe(false);
  });

  it('requires first and last name', () => {
    expect(reportSchema.safeParse(validReport({reporterFirstName: ''})).success).toBe(false);
    expect(reportSchema.safeParse(validReport({reporterLastName: ''})).success).toBe(false);
  });

  it('requires at least email or phone', () => {
    expect(reportSchema.safeParse(validReport({reporterEmail: '', reporterPhone: ''})).success).toBe(false);
    expect(reportSchema.safeParse(validReport({reporterEmail: '', reporterPhone: '+39 123'})).success).toBe(true);
  });

  it('rejects coordinates outside South Tyrol', () => expect(reportSchema.safeParse(validReport({latitude: 0})).success).toBe(false));
  it('requires a municipality from the official list', () => expect(reportSchema.safeParse(validReport({municipality: 'invented-place'})).success).toBe(false));

  it('accepts only integer counts from 1 to 20', () => {
    expect(reportSchema.safeParse(validReport({individualCount: 1})).success).toBe(true);
    expect(reportSchema.safeParse(validReport({individualCount: 20})).success).toBe(true);
    expect(reportSchema.safeParse(validReport({individualCount: 1.5})).success).toBe(false);
    expect(reportSchema.safeParse(validReport({individualCount: 21})).success).toBe(false);
  });

  it('marks an injured hedgehog for the SOS notice', () => {
    expect(requiresSosNotice('injured')).toBe(true);
    expect(requiresSosNotice('alive')).toBe(false);
  });
});
