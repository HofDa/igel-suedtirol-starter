import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const runE2e = process.env.RUN_SUPABASE_E2E === 'true';
const e2e = runE2e ? describe : describe.skip;
const onePixelPng = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  ),
);

type SubmissionResponse = {
  occurrenceId: string;
  persisted: boolean;
  mediaStored: boolean;
};

e2e('Supabase production boundary', () => {
  let admin: SupabaseClient;
  let authAdmin: SupabaseClient;
  let anonymous: SupabaseClient;
  let staff: SupabaseClient;
  let postSighting: (request: Request) => Promise<Response>;
  let occurrenceId = '';
  let sightingId = '';
  let mediaPath = '';
  let staffUserId = '';
  const clientSubmissionId = crypto.randomUUID();
  const staffEmail = `igel-e2e-${clientSubmissionId}@example.invalid`;
  const staffPassword = `E2e-${crypto.randomUUID()}-Aa1!`;

  beforeAll(async () => {
    const url = requiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    const publicKey = requiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    admin = createClient(url, serviceRoleKey, clientOptions());
    authAdmin = createClient(
      url,
      process.env.SUPABASE_AUTH_ADMIN_KEY ?? serviceRoleKey,
      clientOptions(),
    );
    anonymous = createClient(url, publicKey, clientOptions());

    const route = await import('@/app/api/sightings/route');
    postSighting = route.POST;

    const { data, error } = await authAdmin.auth.admin.createUser({
      email: staffEmail,
      password: staffPassword,
      email_confirm: true,
    });
    expect(error).toBeNull();
    staffUserId = data.user?.id ?? '';
    expect(staffUserId).not.toBe('');

    const { error: profileError } = await admin.from('profiles').insert({
      id: staffUserId,
      display_name: 'Automated E2E account',
      role: 'viewer',
    });
    expect(profileError).toBeNull();

    staff = createClient(url, publicKey, clientOptions());
    const { error: signInError } = await staff.auth.signInWithPassword({
      email: staffEmail,
      password: staffPassword,
    });
    expect(signInError).toBeNull();
  }, 30_000);

  afterAll(async () => {
    if (mediaPath) await admin.storage.from('sighting-media').remove([mediaPath]);
    if (sightingId) await admin.from('sightings').delete().eq('id', sightingId);
    if (staffUserId) await authAdmin.auth.admin.deleteUser(staffUserId);
  });

  it('stores one API submission, its separate contact and a private processed image', async () => {
    const response = await postSighting(createSubmissionRequest(clientSubmissionId, onePixelPng));
    expect(response.status).toBe(201);
    const result = (await response.json()) as SubmissionResponse;
    expect(result).toMatchObject({ persisted: true, mediaStored: true });
    occurrenceId = result.occurrenceId;

    const { data: sighting, error: sightingError } = await admin
      .from('sightings')
      .select('id, occurrence_id, municipality, client_submission_id, verification_status')
      .eq('occurrence_id', occurrenceId)
      .single();
    expect(sightingError).toBeNull();
    sightingId = String(sighting?.id);
    expect(sighting).toMatchObject({
      municipality: 'bozen',
      client_submission_id: clientSubmissionId,
      verification_status: 'new',
    });

    const { data: contacts, error: contactError } = await admin
      .from('reporter_contacts')
      .select('sighting_id, reporter_first_name, reporter_last_name, reporter_email')
      .eq('sighting_id', sightingId);
    expect(contactError).toBeNull();
    expect(contacts).toEqual([
      expect.objectContaining({
        sighting_id: sightingId,
        reporter_first_name: 'E2E',
        reporter_last_name: 'Test',
        reporter_email: 'igel-e2e@example.invalid',
      }),
    ]);

    const { data: media, error: mediaError } = await admin
      .from('sighting_media')
      .select('storage_path, mime_type, media_type, sort_order, public_approved')
      .eq('sighting_id', sightingId)
      .single();
    expect(mediaError).toBeNull();
    expect(media).toMatchObject({
      mime_type: 'image/webp',
      media_type: 'image',
      sort_order: 0,
      public_approved: false,
    });
    mediaPath = String(media?.storage_path);

    const { data: storedImage, error: downloadError } = await admin.storage
      .from('sighting-media')
      .download(mediaPath);
    expect(downloadError).toBeNull();
    const bytes = new Uint8Array(await storedImage!.arrayBuffer());
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('RIFF');
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe('WEBP');
  }, 30_000);

  it('keeps anonymous users outside tables and private storage', async () => {
    const { data: directRows, error: directReadError } = await anonymous
      .from('sightings')
      .select('id')
      .eq('id', sightingId);
    expect(directReadError || directRows?.length === 0).toBeTruthy();

    const { data: contacts, error: contactError } = await anonymous
      .from('reporter_contacts')
      .select('id')
      .eq('sighting_id', sightingId);
    expect(contactError || contacts?.length === 0).toBeTruthy();

    const { error: mutationError } = await anonymous
      .from('sightings')
      .update({ notes: 'anonymous mutation must fail' })
      .eq('id', sightingId);
    expect(mutationError).not.toBeNull();

    const { error: storageError } = await anonymous.storage
      .from('sighting-media')
      .download(mediaPath);
    expect(storageError).not.toBeNull();
  });

  it('enforces viewer, moderator and expert RLS boundaries', async () => {
    const { data: viewerRows } = await staff.from('sightings').select('id').eq('id', sightingId);
    expect(viewerRows).toEqual([]);

    expect(await setStaffRole('moderator')).toBeNull();
    const { data: moderatorRows, error: moderatorError } = await staff
      .from('sightings')
      .select('id, exact_location')
      .eq('id', sightingId);
    expect(moderatorError).toBeNull();
    expect(moderatorRows).toHaveLength(1);

    const { data: moderatorContacts } = await staff
      .from('reporter_contacts')
      .select('id')
      .eq('sighting_id', sightingId);
    expect(moderatorContacts).toEqual([]);
    const { error: moderatorStorageError } = await staff.storage
      .from('sighting-media')
      .download(mediaPath);
    expect(moderatorStorageError).toBeNull();

    expect(await setStaffRole('expert')).toBeNull();
    const { data: expertContacts, error: expertContactError } = await staff
      .from('reporter_contacts')
      .select('id')
      .eq('sighting_id', sightingId);
    expect(expertContactError).toBeNull();
    expect(expertContacts).toHaveLength(1);
  });

  it('publishes only blurred coordinates and no contact fields', async () => {
    const { error: publishError } = await admin
      .from('sightings')
      .update({
        verification_status: 'validated',
        publication_status: 'published',
        validated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      })
      .eq('id', sightingId);
    expect(publishError).toBeNull();

    const { data: published, error: publicError } = await anonymous
      .from('published_sightings')
      .select('*')
      .eq('occurrence_id', occurrenceId)
      .single();
    expect(publicError).toBeNull();
    expect(published).not.toHaveProperty('exact_location');
    expect(published).not.toHaveProperty('reporter_email');
    expect(published).not.toHaveProperty('reporter_phone');
    expect(Number(published?.public_latitude)).not.toBeCloseTo(46.500123, 5);
    expect(Number(published?.public_longitude)).not.toBeCloseTo(11.350123, 5);
  });

  it('is idempotent and rejects invalid input before persistence', async () => {
    const duplicate = await postSighting(createSubmissionRequest(clientSubmissionId));
    expect(duplicate.status).toBe(201);
    expect((await duplicate.json()) as SubmissionResponse).toMatchObject({ occurrenceId });

    const { count, error: countError } = await admin
      .from('sightings')
      .select('*', { count: 'exact', head: true })
      .eq('client_submission_id', clientSubmissionId);
    expect(countError).toBeNull();
    expect(count).toBe(1);

    const invalidId = crypto.randomUUID();
    const invalid = await postSighting(
      createSubmissionRequest(invalidId, undefined, { latitude: 45, longitude: 9 }),
    );
    expect(invalid.status).toBe(400);
    const { count: invalidCount } = await admin
      .from('sightings')
      .select('*', { count: 'exact', head: true })
      .eq('client_submission_id', invalidId);
    expect(invalidCount).toBe(0);
  });

  async function setStaffRole(role: 'moderator' | 'expert') {
    const { error } = await admin.from('profiles').update({ role }).eq('id', staffUserId);
    return error;
  }
});

function createSubmissionRequest(
  clientSubmissionId: string,
  image?: Uint8Array,
  location: { latitude: number; longitude: number } = { latitude: 46.500123, longitude: 11.350123 },
) {
  const formData = new FormData();
  formData.set(
    'payload',
    JSON.stringify({
      reportKind: 'observation',
      observationType: 'alive',
      ...location,
      accuracy: 12,
      locationSource: 'gps',
      municipality: 'bozen',
      locality: '',
      addressOrPlace: '',
      observedDate: todayInSouthTyrol(),
      observedTimeFrom: '20:30',
      observedTimeTo: '',
      timeAccuracy: 'exact',
      reporterFirstName: 'E2E',
      reporterLastName: 'Test',
      reporterEmail: 'igel-e2e@example.invalid',
      reporterPhone: '',
      preferredContact: 'email',
      individualCount: 1,
      animalVitalStatus: 'alive',
      ageClass: 'unknown',
      sex: 'unknown',
      behaviors: ['moving'],
      behaviorOther: '',
      habitat: 'settlement',
      features: {
        robotMowerNearby: false,
        fenceNearby: false,
        roadNearby: false,
        poolOrShaftNearby: false,
        gardenPassagePresent: false,
        shelterPresent: false,
        waterSourcePresent: false,
        artificialLightingNearby: false,
        dogOrCatNearby: false,
      },
      roadName: '',
      roadPosition: 'unknown',
      notes: 'Automated Supabase E2E record',
      contactConsent: true,
      scientificUseConsent: true,
      privacyNoticeConsent: true,
      scientificMediaUseApproved: Boolean(image),
      publicMediaUseApproved: false,
      newsletterConsent: false,
      clientSubmissionId,
      submittedLocale: 'de',
    }),
  );
  if (image) formData.append('media', new File([image], 'e2e.png', { type: 'image/png' }));

  return new Request('http://localhost/api/sightings', {
    method: 'POST',
    headers: { 'x-forwarded-for': '192.0.2.42' },
    body: formData,
  });
}

function todayInSouthTyrol() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function clientOptions() {
  return { auth: { autoRefreshToken: false, persistSession: false } };
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
