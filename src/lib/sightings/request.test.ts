import {describe, expect, it} from 'vitest';
import {createDefaultReportValues} from '@/lib/report/defaults';
import {parseSightingRequest} from './request';

function validPayload() {
  return {
    ...createDefaultReportValues('de'),
    observationType: 'alive',
    municipality: 'bozen',
    latitude: 46.5,
    longitude: 11.35,
    observedDate: '2026-07-16',
    observedTimeFrom: '20:30',
    reporterFirstName: 'Ada', reporterLastName: 'Test', reporterEmail: 'ada@example.test',
    scientificUseConsent: true,
    privacyNoticeConsent: true
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
      headers: {'content-length': String(61 * 1024 * 1024)},
      body: 'not-parsed'
    });
    await expect(parseSightingRequest(request)).resolves.toMatchObject({success: false, status: 413});
  });

  it('returns a client error for malformed JSON', async () => {
    const formData = new FormData();
    formData.set('payload', '{');
    const result = await parseSightingRequest(new Request('http://localhost/api/sightings', {method: 'POST', body: formData}));
    expect(result).toMatchObject({success: false, error: 'invalid-payload', status: 400});
  });

  it('rejects more than three media files', async () => {
    const formData = new FormData(); formData.set('payload', JSON.stringify({...validPayload(), scientificMediaUseApproved: true}));
    for (let index = 0; index < 4; index++) formData.append('media', new File([new Uint8Array([0xff, 0xd8, 0xff])], `${index}.jpg`, {type: 'image/jpeg'}));
    await expect(parseSightingRequest(new Request('http://localhost/api/sightings', {method: 'POST', body: formData}))).resolves.toMatchObject({success: false, error: 'too-many-files'});
  });

  it('rejects unsupported content based on its bytes, not its extension', async () => {
    const formData = new FormData(); formData.set('payload', JSON.stringify({...validPayload(), scientificMediaUseApproved: true}));
    formData.append('media', new File(['not an image'], 'looks-safe.jpg', {type: 'image/jpeg'}));
    await expect(parseSightingRequest(new Request('http://localhost/api/sightings', {method: 'POST', body: formData}))).resolves.toMatchObject({success: false, error: 'unsupported-file', status: 415});
  });
});
