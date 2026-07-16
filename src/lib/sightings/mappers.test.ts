import {describe, expect, it} from 'vitest';
import {createDefaultReportValues} from '@/lib/report/defaults';
import {reportSchema, type ReportSubmission} from '@/lib/report/schema';
import {toPublicSighting, toReporterContact, toSightingInsert} from './mappers';

function createReport(): ReportSubmission {
  return reportSchema.parse({
    ...createDefaultReportValues('de'),
    observationType: 'dead',
    latitude: 46.5,
    longitude: 11.35,
    observedDate: '2026-07-16',
    observedTime: '21:30',
    scientificUseConsent: true,
    features: {...createDefaultReportValues('de').features, roadNearby: true}
  });
}

describe('sighting mappers', () => {
  it('maps exact coordinates only to the private sighting insert', () => {
    const insert = toSightingInsert(createReport());
    expect(insert.exact_location).toBe('POINT(11.35 46.5)');
    expect(insert).not.toHaveProperty('public_location');
    expect(insert.roadkill).toBe(true);
  });

  it('keeps reporter contact fields out of the sighting insert', () => {
    const values = {...createReport(), reporterName: 'Test Name', reporterEmail: 'test@example.test'};
    const insert = toSightingInsert(values);
    expect(insert).not.toHaveProperty('reporter_name');
    expect(insert).not.toHaveProperty('reporter_email');
    expect(toReporterContact(values)).toEqual({
      reporter_name: 'Test Name',
      reporter_email: 'test@example.test'
    });
  });

  it('serializes only public coordinates for map responses', () => {
    const sighting = toPublicSighting({
      id: 'id', occurrence_id: 'IGEL-1', observation_type: 'alive', observed_at: '2026-07-16T10:00:00Z',
      public_latitude: 46.5, public_longitude: 11.3, exact_location: 'must-not-leak', roadkill: false
    });
    expect(sighting.latitude).toBe(46.5);
    expect(sighting.longitude).toBe(11.3);
    expect(sighting).not.toHaveProperty('exact_location');
  });
});
