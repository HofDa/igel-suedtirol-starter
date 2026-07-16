import {describe, expect, it} from 'vitest';
import {getDefaultObservationDateTime, toObservationTimestamp} from './date-time';

describe('observation date and time', () => {
  it('uses summer time for July observations', () => {
    expect(toObservationTimestamp({observedDate: '2026-07-16', observedTime: '21:30', timeUnknown: false}))
      .toBe('2026-07-16T21:30:00+02:00');
  });

  it('uses standard time for January observations', () => {
    expect(toObservationTimestamp({observedDate: '2026-01-16', observedTime: '21:30', timeUnknown: false}))
      .toBe('2026-01-16T21:30:00+01:00');
  });

  it('anchors date-only observations at local noon', () => {
    expect(toObservationTimestamp({observedDate: '2026-01-16', timeUnknown: true}))
      .toBe('2026-01-16T12:00:00+01:00');
  });

  it('derives both default fields in the project time zone', () => {
    expect(getDefaultObservationDateTime(new Date('2026-01-01T23:30:00Z'))).toEqual({
      date: '2026-01-02',
      time: '00:30'
    });
  });

  it('rejects a local time skipped by the daylight-saving transition', () => {
    expect(() => toObservationTimestamp({observedDate: '2026-03-29', observedTime: '02:30', timeUnknown: false}))
      .toThrow('invalid-project-local-time');
  });
});
