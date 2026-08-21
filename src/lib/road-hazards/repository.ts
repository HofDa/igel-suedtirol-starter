import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
import type {RoadHazardSubmission} from './schema';

export async function createRoadHazardReport(values: RoadHazardSubmission, sourceHash: string) {
  const client = createAdminClient();
  if (!client) return {success: false as const, error: 'backend-not-configured'};
  const {data, error} = await client.rpc('create_road_hazard_with_contact', {
    p_report: {
      municipality: values.municipality,
      exact_location: `POINT(${values.longitude} ${values.latitude})`,
      coordinate_uncertainty_m: values.accuracy ? Math.round(values.accuracy) : null,
      road_name: values.roadName,
      locality: values.locality || null,
      hazard_types: values.hazardTypes,
      description: values.description,
      scientific_use_consent: values.scientificUseConsent,
      privacy_notice_consent: values.privacyNoticeConsent,
      client_submission_id: values.clientSubmissionId,
      submitted_locale: values.submittedLocale
    },
    p_contact: {
      reporter_name: `${values.reporterFirstName} ${values.reporterLastName}`,
      reporter_first_name: values.reporterFirstName,
      reporter_last_name: values.reporterLastName,
      reporter_email: values.reporterEmail || null,
      reporter_phone: values.reporterPhone || null,
      preferred_contact: values.preferredContact
    },
    p_submission_ip_hash: sourceHash
  }).single();
  if (error?.message.includes('rate_limit_exceeded')) return {success: false as const, error: 'rate-limit-exceeded'};
  if (error || !data) return {success: false as const, error: 'database-insert-failed'};
  const report = data as {report_number: string};
  return {success: true as const, reportNumber: report.report_number};
}
