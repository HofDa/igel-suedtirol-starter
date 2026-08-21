import type {SupabaseClient} from '@supabase/supabase-js';
import sharp from 'sharp';
import {reportMediaType} from '@/lib/report/media-config';

const EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm'
};

export function detectMediaMimeType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)) return 'image/png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp';
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'video/webm';
  if (ascii(bytes, 4, 4) === 'ftyp') {
    const brand = ascii(bytes, 8, 4);
    if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) return 'image/heic';
    if (brand === 'qt  ') return 'video/quicktime';
    return 'video/mp4';
  }
  return null;
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

async function prepareMedia(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  if (reportMediaType(file.type) === 'image') {
    // Sharp schreibt standardmäßig keine EXIF-/XMP-/ICC-Metadaten zurück.
    // Die Rotation wird vor dem Entfernen anhand der EXIF-Orientierung angewandt.
    const output = await sharp(input, {failOn: 'error'}).rotate().webp({quality: 88}).toBuffer();
    return {bytes: output, mimeType: 'image/webp'};
  }
  return {bytes: input, mimeType: file.type};
}

export async function storeSightingMedia(
  client: SupabaseClient,
  sightingId: string,
  files: File[],
  consents: {scientificUseApproved: boolean; publicUseApproved: boolean}
): Promise<boolean> {
  const bucket = client.storage.from('sighting-media');
  const uploadedPaths: string[] = [];
  try {
    for (const [sortOrder, file] of files.entries()) {
      const prepared = await prepareMedia(file);
      const extension = EXTENSIONS_BY_MIME_TYPE[prepared.mimeType];
      if (!extension) throw new Error('unsupported-media');
      const path = `${sightingId}/${String(sortOrder).padStart(2, '0')}-${crypto.randomUUID()}.${extension}`;
      const {error} = await bucket.upload(path, prepared.bytes, {contentType: prepared.mimeType, upsert: false});
      if (error) throw error;
      uploadedPaths.push(path);
      const {error: mediaError} = await client.from('sighting_media').insert({
        sighting_id: sightingId,
        storage_path: path,
        mime_type: prepared.mimeType,
        file_size_bytes: prepared.bytes.byteLength,
        media_type: reportMediaType(prepared.mimeType),
        sort_order: sortOrder,
        scientific_use_approved: consents.scientificUseApproved,
        public_use_approved: consents.publicUseApproved,
        public_approved: false
      });
      if (mediaError) throw mediaError;
    }
    return true;
  } catch {
    if (uploadedPaths.length > 0) await bucket.remove(uploadedPaths);
    if (uploadedPaths.length > 0) await client.from('sighting_media').delete().eq('sighting_id', sightingId).in('storage_path', uploadedPaths);
    return false;
  }
}
