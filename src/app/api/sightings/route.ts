import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {publicEnv} from '@/lib/env';
import {reportSchema} from '@/lib/report/schema';
import type {PublicSighting} from '@/types/sighting';

export const runtime = 'nodejs';

const demoSightings: PublicSighting[] = [
  {id: '1', occurrenceId: 'IGEL-2026-000101', observationType: 'alive', observedAt: '2026-07-12T21:15:00+02:00', municipality: 'Meran', habitat: 'private_garden', latitude: 46.67, longitude: 11.16, roadkill: false},
  {id: '2', occurrenceId: 'IGEL-2026-000102', observationType: 'dead', observedAt: '2026-07-10T06:30:00+02:00', municipality: 'Bozen', habitat: 'road', latitude: 46.5, longitude: 11.35, roadkill: true},
  {id: '3', occurrenceId: 'IGEL-2026-000103', observationType: 'alive', observedAt: '2026-07-08T22:00:00+02:00', municipality: 'Kaltern', habitat: 'vineyard', latitude: 46.41, longitude: 11.24, roadkill: false},
  {id: '4', occurrenceId: 'IGEL-2026-000104', observationType: 'injured', observedAt: '2026-07-06T20:20:00+02:00', municipality: 'Brixen', habitat: 'settlement', latitude: 46.72, longitude: 11.66, roadkill: false}
];

export async function GET() {
  const supabase = createAdminClient();
  if (publicEnv.demoMode || !supabase) return NextResponse.json({sightings: demoSightings});

  const {data, error} = await supabase
    .from('published_sightings')
    .select('*')
    .order('observed_at', {ascending: false})
    .limit(500);

  if (error) return NextResponse.json({error: 'map-load-failed'}, {status: 500});

  const sightings: PublicSighting[] = (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    occurrenceId: String(row.occurrence_id),
    observationType: row.observation_type as PublicSighting['observationType'],
    observedAt: String(row.observed_at),
    municipality: row.municipality ? String(row.municipality) : undefined,
    habitat: row.habitat ? String(row.habitat) : undefined,
    latitude: Number(row.public_latitude),
    longitude: Number(row.public_longitude),
    roadkill: Boolean(row.roadkill)
  }));

  return NextResponse.json({sightings});
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payloadRaw = formData.get('payload');
    if (typeof payloadRaw !== 'string') return NextResponse.json({error: 'invalid-payload'}, {status: 400});

    const parsed = reportSchema.safeParse(JSON.parse(payloadRaw));
    if (!parsed.success) return NextResponse.json({error: 'validation-failed', issues: parsed.error.issues}, {status: 400});

    const photo = formData.get('photo');
    if (photo instanceof File) {
      if (photo.size > 8 * 1024 * 1024) return NextResponse.json({error: 'file-too-large'}, {status: 413});
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(photo.type)) return NextResponse.json({error: 'unsupported-file'}, {status: 415});
    }

    if (publicEnv.demoMode) {
      return NextResponse.json({occurrenceId: `DEMO-${Date.now()}`, persisted: false});
    }

    const supabase = createAdminClient();
    if (!supabase) return NextResponse.json({error: 'backend-not-configured'}, {status: 503});
    const values = parsed.data;
    const observedAt = values.timeUnknown || !values.observedTime
      ? `${values.observedDate}T12:00:00+02:00`
      : `${values.observedDate}T${values.observedTime}:00+02:00`;

    const {data: sighting, error: sightingError} = await supabase
      .from('sightings')
      .insert({
        observation_type: values.observationType,
        observed_at: observedAt,
        time_accuracy: values.timeUnknown ? 'date_only' : 'exact',
        individual_count: values.individualCount,
        behavior: values.behaviors,
        habitat: values.habitat,
        animal_injured: values.observationType === 'injured',
        roadkill: values.observationType === 'dead' && values.features.roadNearby,
        notes: values.notes || null,
        exact_location: `POINT(${values.longitude} ${values.latitude})`,
        coordinate_uncertainty_m: values.accuracy ? Math.round(values.accuracy) : null,
        location_source: values.locationSource,
        robot_mower_nearby: values.features.robotMowerNearby,
        fence_nearby: values.features.fenceNearby,
        road_nearby: values.features.roadNearby,
        pool_or_shaft_nearby: values.features.poolOrShaftNearby,
        garden_passage_present: values.features.gardenPassagePresent,
        shelter_present: values.features.shelterPresent,
        water_source_present: values.features.waterSourcePresent,
        reporter_is_anonymous: !values.reporterName && !values.reporterEmail,
        scientific_use_consent: values.scientificUseConsent,
        photo_publication_consent: values.photoPublicationConsent,
        contact_consent: values.contactConsent,
        newsletter_consent: values.newsletterConsent,
        submitted_locale: values.submittedLocale
      })
      .select('id, occurrence_id')
      .single();

    if (sightingError || !sighting) return NextResponse.json({error: 'database-insert-failed'}, {status: 500});

    if (values.reporterName || values.reporterEmail) {
      await supabase.from('reporter_contacts').insert({
        sighting_id: sighting.id,
        reporter_name: values.reporterName || null,
        reporter_email: values.reporterEmail || null
      });
    }

    if (photo instanceof File && photo.size > 0) {
      const extension = photo.name.split('.').pop()?.toLowerCase() || 'bin';
      const path = `${sighting.id}/${crypto.randomUUID()}.${extension}`;
      const bytes = new Uint8Array(await photo.arrayBuffer());
      const {error: uploadError} = await supabase.storage.from('sighting-media').upload(path, bytes, {contentType: photo.type, upsert: false});
      if (!uploadError) {
        await supabase.from('sighting_media').insert({
          sighting_id: sighting.id,
          storage_path: path,
          mime_type: photo.type,
          file_size_bytes: photo.size,
          public_approved: false
        });
      }
    }

    return NextResponse.json({occurrenceId: sighting.occurrence_id, persisted: true}, {status: 201});
  } catch {
    return NextResponse.json({error: 'unexpected-error'}, {status: 500});
  }
}
