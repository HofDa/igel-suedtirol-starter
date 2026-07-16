import {describe, expect, it} from 'vitest';
import {createDefaultReportValues} from '@/lib/report/defaults';
import {parseSightingRequest} from './request';

function validPayload() {
  return {
    ...createDefaultReportValues('de'),
    observationType: 'alive',
    latitude: 46.5,
    longitude: 11.35,
    scientificUseConsent: true
  };
}

describe('parseSightingRequest', () => {
  it('accepts a valid idempotent submission payload', async () => {
    const formData = new FormData();
    formData.set('payload', JSON.stringify(validPayload()));
    const result = await parseSightingRequest(new Request('http://localhost/api/sightings', {method: 'POST', body: formData}));
    expect(result.success).toBe(true);
    if (result.success) expect(result.values.clientSubmissionId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('rejects an oversized request before parsing multipart data', async () => {
    const request = new Request('http://localhost/api/sightings', {
      method: 'POST',
      headers: {'content-length': String(10 * 1024 * 1024)},
      body: 'not-parsed'
    });
    await expect(parseSightingRequest(request)).resolves.toMatchObject({success: false, status: 413});
  });

  it('limits streamed bodies without a content-length header', async () => {
    const request = new Request('http://localhost/api/sightings', {
      method: 'POST',
      headers: {'content-type': 'application/octet-stream'},
      body: new Uint8Array(10 * 1024 * 1024)
    });
    await expect(parseSightingRequest(request)).resolves.toMatchObject({success: false, status: 413});
  });

  it('returns a client error for malformed JSON', async () => {
    const formData = new FormData();
    formData.set('payload', '{');
    const result = await parseSightingRequest(new Request('http://localhost/api/sightings', {method: 'POST', body: formData}));
    expect(result).toMatchObject({success: false, error: 'invalid-payload', status: 400});
  });
});
