import type {SupabaseClient} from '@supabase/supabase-js';
import {createAdminClient} from '@/lib/supabase/admin';
import type {ReportFormValues} from '@/lib/report/schema';
import type {PublicSighting} from '@/types/sighting';
import {toPublicSighting, toReporterContactInsert, toSightingInsert} from './mappers';

type RepositoryResult<T> = {success: true; data: T} | {success: false; error: string};

function getAdminClient(): RepositoryResult<SupabaseClient> {
  const client = createAdminClient();
  return client ? {success: true, data: client} : {success: false, error: 'backend-not-configured'};
}

export async function listPublishedSightings(): Promise<RepositoryResult<PublicSighting[]>> {
  const client = getAdminClient();
  if (!client.success) return client;

  const {data, error} = await client.data
    .from('published_sightings')
    .select('*')
    .order('observed_at', {ascending: false})
    .limit(500);

  if (error) return {success: false, error: 'map-load-failed'};
  return {success: true, data: (data ?? []).map((row) => toPublicSighting(row as Record<string, unknown>))};
}

export async function createSighting(values: ReportFormValues, photo?: File): Promise<RepositoryResult<string>> {
  const client = getAdminClient();
  if (!client.success) return client;

  const {data: sighting, error: sightingError} = await client.data
    .from('sightings')
    .insert(toSightingInsert(values))
    .select('id, occurrence_id')
    .single();

  if (sightingError || !sighting) return {success: false, error: 'database-insert-failed'};

  const contact = toReporterContactInsert(sighting.id, values);
  if (contact) await client.data.from('reporter_contacts').insert(contact);

  if (photo) await storePhoto(client.data, sighting.id, photo);

  return {success: true, data: sighting.occurrence_id};
}

async function storePhoto(client: SupabaseClient, sightingId: string, photo: File) {
  const extension = photo.name.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${sightingId}/${crypto.randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await photo.arrayBuffer());
  const {error} = await client.storage.from('sighting-media').upload(path, bytes, {
    contentType: photo.type,
    upsert: false
  });
  if (error) return;

  await client.from('sighting_media').insert({
    sighting_id: sightingId,
    storage_path: path,
    mime_type: photo.type,
    file_size_bytes: photo.size,
    public_approved: false
  });
}
