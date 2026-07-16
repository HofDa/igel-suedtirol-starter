import {reportSchema, type ReportFormValues} from '@/lib/report/schema';

const MAX_PHOTO_SIZE = 8 * 1024 * 1024;
const SUPPORTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

type ParsedRequest =
  | {success: true; values: ReportFormValues; photo?: File}
  | {success: false; error: string; status: number; issues?: unknown};

export async function parseSightingRequest(request: Request): Promise<ParsedRequest> {
  const formData = await request.formData();
  const payloadRaw = formData.get('payload');
  if (typeof payloadRaw !== 'string') return {success: false, error: 'invalid-payload', status: 400};

  let payload: unknown;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return {success: false, error: 'invalid-payload', status: 400};
  }

  const parsed = reportSchema.safeParse(payload);
  if (!parsed.success) {
    return {success: false, error: 'validation-failed', status: 400, issues: parsed.error.issues};
  }

  const candidate = formData.get('photo');
  const photo = candidate instanceof File && candidate.size > 0 ? candidate : undefined;
  if (photo && photo.size > MAX_PHOTO_SIZE) return {success: false, error: 'file-too-large', status: 413};
  if (photo && !SUPPORTED_PHOTO_TYPES.includes(photo.type)) {
    return {success: false, error: 'unsupported-file', status: 415};
  }

  return {success: true, values: parsed.data, photo};
}
