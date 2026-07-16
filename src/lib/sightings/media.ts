import type {SupabaseClient} from '@supabase/supabase-js';

const EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic'
};

export async function storeSightingPhoto(client: SupabaseClient, sightingId: string, photo: File): Promise<boolean> {
  const extension = EXTENSIONS_BY_MIME_TYPE[photo.type];
  if (!extension) return false;

  const path = `${sightingId}/${crypto.randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await photo.arrayBuffer());
  const bucket = client.storage.from('sighting-media');
  const {error} = await bucket.upload(path, bytes, {contentType: photo.type, upsert: false});
  if (error) return false;

  const {error: mediaError} = await client.from('sighting_media').insert({
    sighting_id: sightingId,
    storage_path: path,
    mime_type: photo.type,
    file_size_bytes: photo.size,
    public_approved: false
  });
  if (!mediaError) return true;

  await bucket.remove([path]);
  return false;
}
