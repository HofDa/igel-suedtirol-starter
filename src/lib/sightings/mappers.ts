import type { ReportSubmission } from '@/lib/report/schema';
import { toObservationTimestamp } from '@/lib/report/date-time';
import { publicSightingSchema } from './public-schema';
import type { PublicSighting } from '@/types/sighting';

export function toSightingInsert(values: ReportSubmission) {
  return {
    observation_type: values.observationType,
    observed_at: toObservationTimestamp(values),
    observed_date: values.observedDate,
    observed_time_from:
      values.timeAccuracy === 'date_only' ? null : values.observedTimeFrom || null,
    observed_time_to: values.timeAccuracy === 'range' ? values.observedTimeTo || null : null,
    time_accuracy: values.timeAccuracy,
    individual_count: values.individualCount,
    behavior: values.behaviors,
    behavior_other: values.behaviorOther || null,
    habitat: values.habitat,
    age_class: values.ageClass,
    sex: values.sex,
    animal_vital_status:
      values.observationType === 'dead'
        ? 'dead'
        : ['alive', 'injured'].includes(values.observationType)
          ? 'alive'
          : values.animalVitalStatus,
    animal_injured: values.observationType === 'injured',
    roadkill: values.reportKind === 'roadkill',
    road_name: values.roadName || null,
    road_position: values.reportKind === 'roadkill' ? values.roadPosition : null,
    notes: values.notes || null,
    exact_location: `POINT(${values.longitude} ${values.latitude})`,
    coordinate_uncertainty_m: values.accuracy ? Math.round(values.accuracy) : null,
    municipality: values.municipality,
    locality: values.locality || null,
    address_or_place: values.addressOrPlace || null,
    location_source: values.locationSource,
    robot_mower_nearby: values.features.robotMowerNearby,
    fence_nearby: values.features.fenceNearby,
    road_nearby: values.features.roadNearby,
    pool_or_shaft_nearby: values.features.poolOrShaftNearby,
    garden_passage_present: values.features.gardenPassagePresent,
    shelter_present: values.features.shelterPresent,
    water_source_present: values.features.waterSourcePresent,
    artificial_lighting_nearby: values.features.artificialLightingNearby,
    dog_or_cat_nearby: values.features.dogOrCatNearby,
    reporter_is_anonymous: false,
    scientific_use_consent: values.scientificUseConsent,
    privacy_notice_consent: values.privacyNoticeConsent,
    photo_publication_consent: values.publicMediaUseApproved,
    contact_consent: values.contactConsent,
    newsletter_consent: values.newsletterConsent,
    client_submission_id: values.clientSubmissionId,
    submitted_locale: values.submittedLocale,
  };
}

export function toReporterContact(values: ReportSubmission) {
  return {
    reporter_name: `${values.reporterFirstName} ${values.reporterLastName}`.trim(),
    reporter_first_name: values.reporterFirstName,
    reporter_last_name: values.reporterLastName,
    reporter_email: values.reporterEmail || null,
    reporter_phone: values.reporterPhone || null,
    preferred_contact: values.preferredContact,
  };
}

export function toPublicSighting(row: Record<string, unknown>): PublicSighting {
  return publicSightingSchema.parse({
    id: String(row.id),
    occurrenceId: String(row.occurrence_id),
    observationType: row.observation_type as PublicSighting['observationType'],
    observedAt: String(row.observed_at),
    municipality: row.municipality ? String(row.municipality) : undefined,
    habitat: row.habitat ? String(row.habitat) : undefined,
    latitude: Number(row.public_latitude),
    longitude: Number(row.public_longitude),
    roadkill: Boolean(row.roadkill),
  });
}
