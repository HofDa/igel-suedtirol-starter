import type {SupabaseClient} from '@supabase/supabase-js';
import {describe, expect, it, vi} from 'vitest';
import {detectMediaMimeType, storeSightingMedia} from './media';

function createClient(mediaError: unknown) {
  const upload = vi.fn().mockResolvedValue({error: null});
  const remove = vi.fn().mockResolvedValue({error: null});
  const insert = vi.fn().mockResolvedValue({error: mediaError});
  const inFilter = vi.fn().mockResolvedValue({error: null});
  const eq = vi.fn().mockReturnValue({in: inFilter});
  const deleteRow = vi.fn().mockReturnValue({eq});
  const client = {storage: {from: vi.fn().mockReturnValue({upload, remove})}, from: vi.fn().mockReturnValue({insert, delete: deleteRow})} as unknown as SupabaseClient;
  return {client, upload, remove};
}

const onePixelPng = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));

describe('sighting media', () => {
  it('detects supported content from magic bytes', () => {
    expect(detectMediaMimeType(onePixelPng)).toBe('image/png');
    expect(detectMediaMimeType(new TextEncoder().encode('not an image'))).toBeNull();
  });

  it('removes uploaded objects when metadata storage fails', async () => {
    const {client, upload, remove} = createClient(new Error('metadata failed'));
    const stored = await storeSightingMedia(client, 'sighting-id', [new File([onePixelPng], 'photo.png', {type: 'image/png'})], {scientificUseApproved: true, publicUseApproved: false});
    expect(stored).toBe(false);
    expect(upload.mock.calls[0]?.[0]).toMatch(/^sighting-id\/00-[0-9a-f-]+\.webp$/);
    expect(remove).toHaveBeenCalled();
  });
});
