'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminRole } from '@/lib/admin/reports';

export async function setMediaApproval(formData: FormData) {
  const mediaId = formData.get('mediaId');
  const approved = formData.get('approved') === 'true';
  const locale = formData.get('locale') === 'it' ? 'it' : 'de';
  if (typeof mediaId !== 'string') return;
  const access = await getCurrentAdminRole();
  if (access.demo || !access.userId || !['moderator', 'expert', 'admin'].includes(access.role))
    return;
  const client = await createClient();
  const { data: media } = await client
    .from('sighting_media')
    .select('sighting_id, public_approved, public_use_approved')
    .eq('id', mediaId)
    .maybeSingle();
  if (!media || media.public_approved === approved) return;
  if (approved && !media.public_use_approved) return;
  const { error } = await client
    .from('sighting_media')
    .update({ public_approved: approved })
    .eq('id', mediaId);
  if (error) return;
  await client.from('moderation_events').insert({
    sighting_id: media.sighting_id,
    moderator_id: access.userId,
    note: approved ? 'media_public_approved' : 'media_public_revoked',
  });
  revalidatePath(`/${locale}/admin/meldungen`);
}
