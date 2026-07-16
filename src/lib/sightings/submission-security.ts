import 'server-only';

import {createHmac} from 'node:crypto';

type SubmissionSecurity =
  | {success: true; sourceHash: string}
  | {success: false; error: 'submission-security-not-configured'};

export function getSubmissionSecurity(request: Request): SubmissionSecurity {
  const salt = process.env.SUBMISSION_HASH_SALT;
  if (!salt || salt.length < 32) return {success: false, error: 'submission-security-not-configured'};

  const source = getSourceAddress(request) ?? 'unknown-source';
  const sourceHash = createHmac('sha256', salt).update(source).digest('hex');
  return {success: true, sourceHash};
}

function getSourceAddress(request: Request) {
  const trustedHeaders = ['x-vercel-forwarded-for', 'cf-connecting-ip', 'x-forwarded-for'];
  for (const header of trustedHeaders) {
    const value = request.headers.get(header)?.split(',')[0]?.trim();
    if (value) return value.slice(0, 128);
  }
  return undefined;
}
