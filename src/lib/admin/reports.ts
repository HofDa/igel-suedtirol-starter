import 'server-only';

import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';

export type AdminMedia = { id: string; approved: boolean; publicUseApproved: boolean };
export type AdminSighting = {
  id: string;
  municipality: string;
  kind: 'observation' | 'roadkill';
  observed: string;
  created: string;
  time: string;
  age: string;
  sex: string;
  habitat: string;
  behaviors: string[];
  media: AdminMedia[];
  status: string;
  contact?: string;
};

const demoSightings: AdminSighting[] = [
  {
    id: 'IGEL-2026-000486',
    municipality: 'Meran',
    kind: 'observation',
    observed: '2026-07-30',
    created: '2026-07-31',
    time: '20:30',
    age: 'adult',
    sex: 'unknown',
    habitat: 'private_garden',
    behaviors: ['moving'],
    media: [{ id: 'demo-media-1', approved: true, publicUseApproved: true }],
    status: 'new',
  },
  {
    id: 'IGEL-2026-000485',
    municipality: 'Bozen',
    kind: 'roadkill',
    observed: '2026-07-29',
    created: '2026-07-31',
    time: '06:00–07:00',
    age: 'unknown',
    sex: 'unknown',
    habitat: 'road_outside_settlement',
    behaviors: ['unknown'],
    media: [{ id: 'demo-media-2', approved: false, publicUseApproved: false }],
    status: 'in_review',
  },
];

export async function getCurrentAdminRole() {
  if (!isSupabaseConfigured()) return { role: 'admin' as UserRole, userId: null, demo: true };
  const client = await createClient();
  const { data: claims } = await client.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { role: 'viewer' as UserRole, userId: null, demo: false };
  const { data } = await client.from('profiles').select('role').eq('id', userId).maybeSingle();
  return { role: (data?.role ?? 'viewer') as UserRole, userId, demo: false };
}

export async function listAdminSightings(kind: string) {
  const access = await getCurrentAdminRole();
  if (access.demo)
    return { rows: filterSightings(demoSightings, kind), canViewContacts: false, demo: true };
  const client = await createClient();
  let query = client
    .from('sightings')
    .select(
      `
    occurrence_id, municipality, roadkill, observed_date, observed_time_from,
    observed_time_to, time_accuracy, created_at, age_class, sex, habitat,
    behavior, verification_status, sighting_media(id, public_approved, public_use_approved)
  `,
    )
    .order('created_at', { ascending: false })
    .limit(250);
  if (kind === 'roadkill') query = query.eq('roadkill', true);
  if (kind === 'observation') query = query.eq('roadkill', false);
  const { data, error } = await query;
  if (error) return { rows: [], canViewContacts: false, demo: false, error: 'load-failed' };
  const canViewContacts = access.role === 'expert' || access.role === 'admin';
  const contactBySighting = new Map<string, string>();
  if (canViewContacts) {
    const ids = (data ?? []).map((row) => String(row.occurrence_id));
    const { data: sightingIds } = await client
      .from('sightings')
      .select('id, occurrence_id')
      .in('occurrence_id', ids);
    const idMap = new Map(
      (sightingIds ?? []).map((row) => [String(row.id), String(row.occurrence_id)]),
    );
    const { data: contacts } = await client
      .from('reporter_contacts')
      .select(
        'sighting_id, reporter_first_name, reporter_last_name, reporter_email, reporter_phone',
      )
      .in('sighting_id', [...idMap.keys()]);
    for (const contact of contacts ?? []) {
      const occurrenceId = idMap.get(String(contact.sighting_id));
      if (occurrenceId)
        contactBySighting.set(
          occurrenceId,
          [
            contact.reporter_first_name,
            contact.reporter_last_name,
            contact.reporter_email,
            contact.reporter_phone,
          ]
            .filter(Boolean)
            .join(' · '),
        );
    }
  }
  const rows: AdminSighting[] = (data ?? []).map((row) => ({
    id: String(row.occurrence_id),
    municipality: String(row.municipality ?? ''),
    kind: row.roadkill ? 'roadkill' : 'observation',
    observed: String(row.observed_date),
    created: String(row.created_at).slice(0, 10),
    time:
      row.time_accuracy === 'date_only'
        ? ''
        : row.time_accuracy === 'range'
          ? `${String(row.observed_time_from).slice(0, 5)}–${String(row.observed_time_to).slice(0, 5)}`
          : String(row.observed_time_from).slice(0, 5),
    age: String(row.age_class),
    sex: String(row.sex),
    habitat: String(row.habitat),
    behaviors:
      Array.isArray(row.behavior) && row.behavior.length ? row.behavior.map(String) : ['unknown'],
    media: Array.isArray(row.sighting_media)
      ? row.sighting_media.map((media) => ({
          id: String(media.id),
          approved: Boolean(media.public_approved),
          publicUseApproved: Boolean(media.public_use_approved),
        }))
      : [],
    status: String(row.verification_status),
    contact: contactBySighting.get(String(row.occurrence_id)),
  }));
  return { rows, canViewContacts, demo: false };
}

function filterSightings(rows: AdminSighting[], kind: string) {
  return kind === 'all' ? rows : rows.filter((row) => row.kind === kind);
}

export async function listAdminRoadHazards() {
  const access = await getCurrentAdminRole();
  if (access.demo)
    return {
      demo: true,
      rows: [
        {
          id: 'STRASSE-2026-000014',
          created: '2026-07-31',
          municipality: 'Bozen',
          roadName: '',
          hazards: ['frequent_hedgehog_crossings'],
          status: 'new',
        },
      ],
    };
  const client = await createClient();
  const { data, error } = await client
    .from('road_hazard_reports')
    .select('report_number, created_at, municipality, road_name, hazard_types, verification_status')
    .order('created_at', { ascending: false })
    .limit(250);
  if (error) return { demo: false, rows: [], error: 'load-failed' };
  return {
    demo: false,
    rows: (data ?? []).map((row) => ({
      id: String(row.report_number),
      created: String(row.created_at).slice(0, 10),
      municipality: String(row.municipality),
      roadName: String(row.road_name),
      hazards: Array.isArray(row.hazard_types) ? row.hazard_types.map(String) : [],
      status: String(row.verification_status),
    })),
  };
}
