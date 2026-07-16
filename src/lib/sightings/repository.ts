import type {SupabaseClient} from '@supabase/supabase-js';
import {createAdminClient} from '@/lib/supabase/admin';
import {createPublicClient} from '@/lib/supabase/public';
import type {ReportSubmission} from '@/lib/report/schema';
import type {PublicSighting} from '@/types/sighting';
import {toPublicSighting, toReporterContact, toSightingInsert} from './mappers';
import {storeSightingPhoto} from './media';

type RepositoryResult<T> = {success: true; data: T} | {success: false; error: string};

function getAdminClient(): RepositoryResult<SupabaseClient> {
  const client = createAdminClient();
  return client ? {success: true, data: client} : {success: false, error: 'backend-not-configured'};
}

function getPublicClient(): RepositoryResult<SupabaseClient> {
  const client = createPublicClient();
  return client ? {success: true, data: client} : {success: false, error: 'backend-not-configured'};
}

export async function listPublishedSightings(): Promise<RepositoryResult<PublicSighting[]>> {
  const client = getPublicClient();
  if (!client.success) return client;

  const {data, error} = await client.data
    .from('published_sightings')
    .select('*')
    .order('observed_at', {ascending: false})
    .limit(500);

  if (error) return {success: false, error: 'map-load-failed'};
  try {
    return {success: true, data: (data ?? []).map((row) => toPublicSighting(row as Record<string, unknown>))};
  } catch {
    return {success: false, error: 'map-load-failed'};
  }
}

type CreatedSighting = {occurrenceId: string; photoStored: boolean};

export async function createSighting(values: ReportSubmission, sourceHash: string, photo?: File): Promise<RepositoryResult<CreatedSighting>> {
  const client = getAdminClient();
  if (!client.success) return client;

  const {data, error: sightingError} = await client.data
    .rpc('create_sighting_with_contact', {
      p_sighting: toSightingInsert(values),
      p_contact: toReporterContact(values),
      p_submission_ip_hash: sourceHash
    })
    .single();
  const sighting = data as {id: string; occurrence_id: string} | null;

  if (sightingError?.message.includes('rate_limit_exceeded')) return {success: false, error: 'rate-limit-exceeded'};
  if (sightingError || !sighting) return {success: false, error: 'database-insert-failed'};

  const photoStored = photo ? await storeSightingPhoto(client.data, sighting.id, photo) : true;

  return {success: true, data: {occurrenceId: sighting.occurrence_id, photoStored}};
}
