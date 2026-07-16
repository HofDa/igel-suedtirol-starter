import type {ReportSubmission} from '@/lib/report/schema';
import {toObservationTimestamp} from '@/lib/report/date-time';
import type {PublicSighting} from '@/types/sighting';

export function toSightingInsert(values: ReportSubmission) {
  return {
    observation_type: values.observationType,
    observed_at: toObservationTimestamp(values),
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
  };
}

export function toReporterContactInsert(sightingId: string, values: ReportSubmission) {
  if (!values.reporterName && !values.reporterEmail) return null;
  return {
    sighting_id: sightingId,
    reporter_name: values.reporterName || null,
    reporter_email: values.reporterEmail || null
  };
}

export function toPublicSighting(row: Record<string, unknown>): PublicSighting {
  return {
    id: String(row.id),
    occurrenceId: String(row.occurrence_id),
    observationType: row.observation_type as PublicSighting['observationType'],
    observedAt: String(row.observed_at),
    municipality: row.municipality ? String(row.municipality) : undefined,
    habitat: row.habitat ? String(row.habitat) : undefined,
    latitude: Number(row.public_latitude),
    longitude: Number(row.public_longitude),
    roadkill: Boolean(row.roadkill)
  };
}
