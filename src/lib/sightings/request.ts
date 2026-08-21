import {reportSchema, type ReportSubmission} from '@/lib/report/schema';
import {REPORT_MEDIA_CONFIG, reportMediaType} from '@/lib/report/media-config';
import {detectMediaMimeType} from './media';

type ParsedRequest =
  | {success: true; values: ReportSubmission; media: File[]}
  | {success: false; error: string; status: number; issues?: unknown};

export async function parseSightingRequest(request: Request): Promise<ParsedRequest> {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > REPORT_MEDIA_CONFIG.maxRequestBytes) {
    return {success: false, error: 'request-too-large', status: 413};
  }

  const body = await readLimitedBody(request.body);
  if (!body) return {success: false, error: 'request-too-large', status: 413};

  const boundedRequest = new Request(request.url, {method: request.method, headers: request.headers, body});
  const formData = await boundedRequest.formData();
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

  const media = formData.getAll('media').filter((candidate): candidate is File => candidate instanceof File && candidate.size > 0);
  if (media.length > REPORT_MEDIA_CONFIG.maxFiles) return {success: false, error: 'too-many-files', status: 400};
  for (const file of media) {
    const declaredType = reportMediaType(file.type);
    if (!declaredType) return {success: false, error: 'unsupported-file', status: 415};
    const maxSize = declaredType === 'video' ? REPORT_MEDIA_CONFIG.maxVideoBytes : REPORT_MEDIA_CONFIG.maxImageBytes;
    if (file.size > maxSize) return {success: false, error: 'file-too-large', status: 413};
    const detectedMime = detectMediaMimeType(new Uint8Array(await file.slice(0, 32).arrayBuffer()));
    if (!detectedMime || detectedMime !== file.type) return {success: false, error: 'unsupported-file', status: 415};
  }
  if (media.length > 0 && !parsed.data.scientificMediaUseApproved) return {success: false, error: 'media-consent-required', status: 400};

  return {success: true, values: parsed.data, media};
}

async function readLimitedBody(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > REPORT_MEDIA_CONFIG.maxRequestBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
