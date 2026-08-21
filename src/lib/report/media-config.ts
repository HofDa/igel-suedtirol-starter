export const REPORT_MEDIA_CONFIG = {
  maxFiles: 3,
  maxImageBytes: 8 * 1024 * 1024,
  maxVideoBytes: 25 * 1024 * 1024,
  maxRequestBytes: 60 * 1024 * 1024,
  imageMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'] as const,
  videoMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'] as const
} as const;

export type ReportMediaMimeType =
  | (typeof REPORT_MEDIA_CONFIG.imageMimeTypes)[number]
  | (typeof REPORT_MEDIA_CONFIG.videoMimeTypes)[number];

export function reportMediaType(mimeType: string) {
  if ((REPORT_MEDIA_CONFIG.imageMimeTypes as readonly string[]).includes(mimeType)) return 'image' as const;
  if ((REPORT_MEDIA_CONFIG.videoMimeTypes as readonly string[]).includes(mimeType)) return 'video' as const;
  return null;
}
