import {NextResponse} from 'next/server';
import {publicEnv} from '@/lib/env';
import {createRoadHazardReport} from '@/lib/road-hazards/repository';
import {roadHazardSchema} from '@/lib/road-hazards/schema';
import {getSubmissionSecurity} from '@/lib/sightings/submission-security';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > 64 * 1024) return NextResponse.json({error: 'request-too-large'}, {status: 413});
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({error: 'invalid-payload'}, {status: 400}); }
  const parsed = roadHazardSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({error: 'validation-failed', issues: parsed.error.issues}, {status: 400});
  if (publicEnv.demoMode) return NextResponse.json({reportNumber: `DEMO-STRASSE-${Date.now()}`, persisted: false}, {status: 201});
  const security = getSubmissionSecurity(request);
  if (!security.success) return NextResponse.json({error: security.error}, {status: 503});
  const result = await createRoadHazardReport(parsed.data, security.sourceHash);
  if (!result.success) return NextResponse.json({error: result.error}, {status: result.error === 'rate-limit-exceeded' ? 429 : result.error === 'backend-not-configured' ? 503 : 500});
  return NextResponse.json({reportNumber: result.reportNumber, persisted: true}, {status: 201});
}
