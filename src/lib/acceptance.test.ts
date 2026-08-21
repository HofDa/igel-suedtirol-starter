import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { mergeDraft } from '@/components/report/useReportDraft';
import { routing } from '@/i18n/routing';
import { createDefaultReportValues } from '@/lib/report/defaults';
import { roadHazardSchema } from '@/lib/road-hazards/schema';

describe('cross-feature acceptance boundaries', () => {
  it('keeps the SOS page informational and does not submit scientific data', () => {
    const source = readFileSync('src/app/[locale]/hilfe/page.tsx', 'utf8');
    expect(source).not.toContain('/api/sightings');
    expect(source).not.toContain('<form');
  });

  it('validates road hazards independently of sightings', () => {
    const result = roadHazardSchema.safeParse({
      municipality: 'bozen',
      latitude: 46.5,
      longitude: 11.35,
      roadName: 'Teststraße',
      locality: '',
      hazardTypes: ['missing_passage'],
      description: 'Beschreibender Test ohne reale Personendaten.',
      reporterFirstName: 'Test',
      reporterLastName: 'Person',
      reporterEmail: 'test@example.test',
      reporterPhone: '',
      preferredContact: 'email',
      scientificUseConsent: true,
      privacyNoticeConsent: true,
      clientSubmissionId: crypto.randomUUID(),
      submittedLocale: 'de',
    });
    expect(result.success).toBe(true);
    const repository = readFileSync('src/lib/road-hazards/repository.ts', 'utf8');
    expect(repository).toContain("rpc('create_road_hazard_with_contact'");
    expect(repository).not.toContain("from('sightings')");
  });

  it('exposes only blurred coordinates and no contacts in public database views', () => {
    const migration = readFileSync(
      'supabase/migrations/202607310001_updated_reporting_requirements.sql',
      'utf8',
    );
    const publicViews = migration.slice(
      migration.indexOf('create view public.published_sightings'),
      migration.indexOf('grant select on public.published_sightings'),
    );
    expect(publicViews).toContain('public_location');
    expect(publicViews).not.toContain('exact_location');
    expect(publicViews).not.toContain('reporter_email');
    expect(publicViews).not.toContain('reporter_phone');
  });

  it('retains the established public routes while adding the new entries', () => {
    const paths = Object.keys(routing.pathnames);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/karte',
        '/igel',
        '/schutz',
        '/hilfe',
        '/ergebnisse',
        '/projekt',
        '/melden',
      ]),
    );
    expect(paths).toEqual(
      expect.arrayContaining([
        '/melden/beobachtung',
        '/melden/strassenopfer',
        '/melden/strassenabschnitt',
      ]),
    );
  });

  it('uses an established internal contact route in the footer', () => {
    const source = readFileSync('src/components/layout/Footer.tsx', 'utf8');
    expect(source).toContain("['contact', '/ueber-uns']");
    expect(source).not.toContain('projekt@example.org');
  });

  it('restores all new report fields through the offline draft merger', () => {
    const defaults = createDefaultReportValues('de');
    const stored = {
      ...defaults,
      municipality: 'bozen' as const,
      observedDate: '2026-07-16',
      observedTimeFrom: '20:00',
      observedTimeTo: '21:00',
      timeAccuracy: 'range' as const,
      reporterFirstName: 'Test',
      reporterLastName: 'Person',
      reporterPhone: '+39 000',
      behaviorOther: 'Test',
      artificial: true,
      features: { ...defaults.features, artificialLightingNearby: true },
    };
    const restored = mergeDraft(defaults, stored);
    expect(restored).toMatchObject({
      municipality: 'bozen',
      observedTimeFrom: '20:00',
      observedTimeTo: '21:00',
      reporterPhone: '+39 000',
      behaviorOther: 'Test',
      features: { artificialLightingNearby: true },
    });
  });

  it('keeps demo mode operational without Supabase configuration', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true');
    vi.resetModules();
    const { publicEnv } = await import('@/lib/env');
    expect(publicEnv.demoMode).toBe(true);
    vi.unstubAllEnvs();
  });
});
