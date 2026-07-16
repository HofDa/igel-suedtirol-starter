import {reportSchema, type ReportSubmission} from '@/lib/report/schema';

const MAX_PHOTO_SIZE = 8 * 1024 * 1024;
const MAX_REQUEST_SIZE = 9 * 1024 * 1024;
const SUPPORTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

type ParsedRequest =
  | {success: true; values: ReportSubmission; photo?: File}
  | {success: false; error: string; status: number; issues?: unknown};

export async function parseSightingRequest(request: Request): Promise<ParsedRequest> {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
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

  const candidate = formData.get('photo');
  const photo = candidate instanceof File && candidate.size > 0 ? candidate : undefined;
  if (photo && photo.size > MAX_PHOTO_SIZE) return {success: false, error: 'file-too-large', status: 413};
  if (photo && !SUPPORTED_PHOTO_TYPES.includes(photo.type)) {
    return {success: false, error: 'unsupported-file', status: 415};
  }

  return {success: true, values: parsed.data, photo};
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
    if (size > MAX_REQUEST_SIZE) {
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
