import type {SupabaseClient} from '@supabase/supabase-js';
import {describe, expect, it, vi} from 'vitest';
import {storeSightingPhoto} from './media';

function createClient(mediaError: unknown) {
  const upload = vi.fn().mockResolvedValue({error: null});
  const remove = vi.fn().mockResolvedValue({error: null});
  const insert = vi.fn().mockResolvedValue({error: mediaError});
  const client = {
    storage: {from: vi.fn().mockReturnValue({upload, remove})},
    from: vi.fn().mockReturnValue({insert})
  } as unknown as SupabaseClient;
  return {client, upload, remove};
}

describe('storeSightingPhoto', () => {
  it('removes an uploaded object when its metadata insert fails', async () => {
    const {client, upload, remove} = createClient(new Error('metadata failed'));
    const stored = await storeSightingPhoto(client, 'sighting-id', new File(['photo'], 'untrusted.exe', {type: 'image/jpeg'}));
    expect(stored).toBe(false);
    expect(upload.mock.calls[0]?.[0]).toMatch(/^sighting-id\/[0-9a-f-]+\.jpg$/);
    expect(remove).toHaveBeenCalledWith([upload.mock.calls[0]?.[0]]);
  });

  it('keeps an uploaded object when metadata is stored', async () => {
    const {client, remove} = createClient(null);
    await expect(storeSightingPhoto(client, 'sighting-id', new File(['photo'], 'photo.png', {type: 'image/png'}))).resolves.toBe(true);
    expect(remove).not.toHaveBeenCalled();
  });
});
