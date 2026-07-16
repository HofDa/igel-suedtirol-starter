import {NextResponse} from 'next/server';
import {publicEnv} from '@/lib/env';
import {demoSightings} from '@/lib/sightings/demo';
import {createSighting, listPublishedSightings} from '@/lib/sightings/repository';
import {parseSightingRequest} from '@/lib/sightings/request';

export const runtime = 'nodejs';

export async function GET() {
  if (publicEnv.demoMode) return NextResponse.json({sightings: demoSightings});
  const result = await listPublishedSightings();
  if (!result.success) return NextResponse.json({error: result.error}, {status: result.error === 'backend-not-configured' ? 503 : 500});
  return NextResponse.json({sightings: result.data});
}

export async function POST(request: Request) {
  try {
    const parsed = await parseSightingRequest(request);
    if (!parsed.success) return NextResponse.json({error: parsed.error, issues: parsed.issues}, {status: parsed.status});

    if (publicEnv.demoMode) {
      return NextResponse.json({occurrenceId: `DEMO-${Date.now()}`, persisted: false});
    }

    const result = await createSighting(parsed.values, parsed.photo);
    if (!result.success) return NextResponse.json({error: result.error}, {status: result.error === 'backend-not-configured' ? 503 : 500});
    return NextResponse.json({occurrenceId: result.data, persisted: true}, {status: 201});
  } catch {
    return NextResponse.json({error: 'unexpected-error'}, {status: 500});
  }
}
