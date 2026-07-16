/**
 * Minimal hand-maintained types for orientation.
 * Replace with `npm run supabase:types` after connecting a project.
 */
export type VerificationStatus = 'new' | 'in_review' | 'needs_clarification' | 'validated' | 'rejected' | 'duplicate';
export type PublicationStatus = 'private' | 'approved' | 'published';
export type UserRole = 'viewer' | 'moderator' | 'expert' | 'admin';
