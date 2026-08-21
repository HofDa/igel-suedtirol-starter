import { describe, expect, it } from 'vitest';
import { createDefaultReportValues } from '@/lib/report/defaults';
import { reportSchema, type ReportSubmission } from '@/lib/report/schema';
import { toPublicSighting, toReporterContact, toSightingInsert } from './mappers';

function createReport(): ReportSubmission {
  return reportSchema.parse({
    ...createDefaultReportValues('de', 'roadkill'),
    municipality: 'bozen',
    latitude: 46.5,
    longitude: 11.35,
    observedDate: '2026-07-16',
    observedTimeFrom: '21:30',
    reporterFirstName: 'Test',
    reporterLastName: 'Person',
    reporterEmail: 'test@example.test',
    roadName: 'Teststraße',
    scientificUseConsent: true,
    privacyNoticeConsent: true,
  });
}

describe('sighting mappers', () => {
  it('maps exact coordinates only to the private sighting insert', () => {
    const insert = toSightingInsert(createReport());
    expect(insert.exact_location).toBe('POINT(11.35 46.5)');
    expect(insert).not.toHaveProperty('public_location');
    expect(insert.roadkill).toBe(true);
    expect(insert.privacy_notice_consent).toBe(true);
  });

  it('keeps reporter contact fields out of the sighting insert', () => {
    const values = createReport();
    const insert = toSightingInsert(values);
    expect(insert).not.toHaveProperty('reporter_first_name');
    expect(insert).not.toHaveProperty('reporter_email');
    expect(toReporterContact(values)).toMatchObject({
      reporter_first_name: 'Test',
      reporter_last_name: 'Person',
      reporter_email: 'test@example.test',
    });
  });

  it('serializes only public coordinates for map responses', () => {
    const sighting = toPublicSighting({
      id: 'id',
      occurrence_id: 'IGEL-1',
      observation_type: 'alive',
      observed_at: '2026-07-16T10:00:00Z',
      public_latitude: 46.5,
      public_longitude: 11.3,
      exact_location: 'must-not-leak',
      reporter_email: 'must-not-leak',
      roadkill: false,
    });
    expect(sighting).not.toHaveProperty('exact_location');
    expect(sighting).not.toHaveProperty('reporter_email');
  });
});
