/**
 * Minimal hand-maintained types for orientation.
 * Replace with `npm run supabase:types` after connecting a project.
 */
export type VerificationStatus = 'new' | 'in_review' | 'needs_clarification' | 'validated' | 'rejected' | 'duplicate';
export type PublicationStatus = 'private' | 'approved' | 'published';
export type UserRole = 'viewer' | 'moderator' | 'expert' | 'admin';
export type TimeAccuracy = 'exact' | 'range' | 'date_only';
export type AgeClass = 'adult' | 'young_of_year' | 'unknown';
export type Sex = 'female' | 'male' | 'unknown';
export type MediaType = 'image' | 'video';
export type RoadPosition = 'carriageway' | 'roadside' | 'embankment' | 'unknown';
export type RoadHazardType =
  | 'frequent_hedgehog_crossings'
  | 'multiple_roadkills'
  | 'high_vehicle_speed'
  | 'barrier_or_wall'
  | 'missing_passage'
  | 'poor_visibility'
  | 'road_drain_or_shaft'
  | 'other';

export type ReporterContactRow = {
  id: string;
  sighting_id: string | null;
  road_hazard_report_id: string | null;
  reporter_first_name: string | null;
  reporter_last_name: string | null;
  reporter_email: string | null;
  reporter_phone: string | null;
  preferred_contact: 'email' | 'phone' | 'either' | null;
};

export type SightingMediaRow = {
  id: string;
  sighting_id: string;
  storage_path: string;
  mime_type: string;
  media_type: MediaType;
  sort_order: number;
  duration_seconds: number | null;
  scientific_use_approved: boolean;
  public_use_approved: boolean;
  public_approved: boolean;
};

export type RoadHazardReportRow = {
  id: string;
  report_number: string;
  reported_at: string;
  municipality: string;
  road_name: string;
  locality: string | null;
  hazard_types: RoadHazardType[];
  description: string;
  coordinate_uncertainty_m: number | null;
  verification_status: VerificationStatus;
  publication_status: PublicationStatus;
  reporter_contact_id: string | null;
  created_at: string;
  updated_at: string;
};
